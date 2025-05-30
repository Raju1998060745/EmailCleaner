"""app.py – Gmail metadata ingester + fast analytics
-----------------------------------------------------------------
1. /authorize  → OAuth consent.
2. /sync       → Fetches up to MAX_GMAIL_MESSAGES, stores (id, sender)
                 in a local SQLite DB (EMAIL_DB, default emailmeta.db).
3. /top_senders→ Instant query: SELECT sender, COUNT(*) ... LIMIT 10.

Why? Instead of hitting Gmail API & counting every request, we store
metadata once, then any analytics endpoint is just SQL ‑ fast even on
30 000+ rows.
"""
import os
import logging
import sqlite3
from time import perf_counter
from typing import List, Optional, Dict, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import Flask, redirect, url_for, session, jsonify, request
import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
from flask_cors import CORS



# ─────────────────────────────────────────────────────────── Configuration ──
SCOPES: List[str] = ["https://www.googleapis.com/auth/gmail.modify"]
CLIENT_SECRETS_FILE: str = "client_secret.json"  # Google Cloud OAuth creds
MAX_THREADS: int = int(os.environ.get("MAX_GMAIL_THREADS", 10))
MAX_MESSAGES: int = int(os.environ.get("MAX_GMAIL_MESSAGES", 1000))
# --- absolute path to project root ---------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, os.environ.get("EMAIL_DB", "emailmeta.db"))


app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev_secret")
CORS(app, supports_credentials=True, origins=["https://localhost:5173"])
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="[%(asctime)s] %(levelname)s %(message)s",
)

logger = logging.getLogger(__name__)
# app.py  (after app = Flask(__name__))
app.config.update(
    SESSION_COOKIE_SAMESITE="None",   # <-- allow cross-site XHRs
    SESSION_COOKIE_SECURE=True,      # keep False on http://localhost
)


# ────────────────────────────────────────────────────────────── SQLite ──

def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS messages (
                   id     TEXT PRIMARY KEY,
                   sender TEXT
               );"""
        )
        conn.commit()


def bulk_insert(rows: List[Tuple[str, str]]) -> int:
    """Insert message rows (id, sender); ignore duplicates. Returns inserted count."""
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.executemany(
            "INSERT OR IGNORE INTO messages(id, sender) VALUES (?,?)", rows
        )
        conn.commit()
        return cur.rowcount  # inserted rows only


init_db()

# ─────────────────────────────────────────────── Gmail helper utilities ──

def build_gmail_service(creds_dict: Dict[str, str]):
    creds = google.oauth2.credentials.Credentials(**creds_dict)
    return googleapiclient.discovery.build(
        "gmail", "v1", credentials=creds, cache_discovery=False
    )


def fetch_sender(service, msg_id: str) -> Optional[str]:
    try:
        msg = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=msg_id,
                format="metadata",
                metadataHeaders=["From"],
            )
            .execute()
        )
        for h in msg.get("payload", {}).get("headers", []):
            if h["name"].lower() == "from":
                return h["value"]
    except Exception as exc:  # noqa: BLE001
        logger.debug("Fetch failed %s: %s", msg_id, exc)
    return None


# ───────────────────────────────────────────────────────────── Flask routes ──

@app.route("/")
def index():
    if "credentials" not in session:
        return '<a href="/authorize">Connect Gmail</a>'
    return (
        '<a href="/sync">Sync inbox metadata</a> | '
        '<a href="/top_senders">Top senders</a>'
    )


@app.route("/authorize")
def authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES
    )
    flow.redirect_uri = url_for("oauth2callback", _external=True)
    auth_url, state = flow.authorization_url(access_type="offline", include_granted_scopes="true",prompt="select_account consent",)
    session["state"] = state
    logger.info("Redirecting to Google consent screen …")
    return redirect(auth_url)


@app.route("/oauth2callback")
def oauth2callback():
    """Google redirects here after user consents.

    We expect `session["state"]` to match the `state` query param Google returns.
    If anything is off, we log it and restart the flow.
    """
    expected_state = session.get("state")
    returned_state = request.args.get("state")

    if not expected_state:
        logger.warning("OAuth callback: session missing 'state'.  Restarting.")
        session.clear()
        return redirect(url_for("authorize"))

    if expected_state != returned_state:
        logger.warning("OAuth callback: state mismatch (%s != %s). Restarting.",
                       expected_state, returned_state)
        session.clear()
        return redirect(url_for("authorize"))

    # --- exchange the code for tokens ---
    try:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, state=expected_state
        )
        flow.redirect_uri = url_for("oauth2callback", _external=True)
        flow.fetch_token(authorization_response=request.url)
    except Exception as exc:  # noqa: BLE001
        logger.error("OAuth token exchange failed: %s  Restarting.", exc)
        session.clear()
        return redirect(url_for("authorize"))

    # --- save credentials and return to SPA ---
    creds = flow.credentials
    profile = (
        googleapiclient.discovery.build(
            "gmail", "v1", credentials=creds, cache_discovery=False
        )
        .users()
        .getProfile(userId="me")
        .execute()
    )
    email_addr = profile.get("emailAddress")
    session["credentials"] = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }
    session["email"] = email_addr       
    logger.info("OAuth completed successfully for %s", creds.client_id)

    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    return redirect(FRONTEND_URL)


@app.route("/profile")
def profile():
    email = session.get("email")
    if not email:
        return jsonify({"error": "not authorized"}), 401
    return jsonify({"email": email})

@app.route("/sync")
def sync_inbox():
    creds_dict = session.get("credentials")
    if not creds_dict:
        return redirect(url_for("authorize"))

    service = build_gmail_service(creds_dict)
    logger.info("Syncing up to %d emails (threads=%d)…", MAX_MESSAGES, MAX_THREADS)
    t0 = perf_counter()

    # Step 1: collect message IDs
    msg_ids: List[str] = []
    page_token = None
    while len(msg_ids) < MAX_MESSAGES:
        resp = (
            service.users()
            .messages()
            .list(userId="me", labelIds=["INBOX"], pageToken=page_token, maxResults=500)
            .execute()
        )
        msg_ids.extend([m["id"] for m in resp.get("messages", [])])
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    msg_ids = msg_ids[:MAX_MESSAGES]
    logger.info("Collected %d message IDs", len(msg_ids))

    # Step 2: fetch metadata in parallel
    rows: List[Tuple[str, str]] = []

    def worker(mid):
        local_service = build_gmail_service(creds_dict)
        sender = fetch_sender(local_service, mid)
        if sender:
            return (mid, sender)
        return None

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as ex:
        futures = {ex.submit(worker, mid): mid for mid in msg_ids}
        for idx, fut in enumerate(as_completed(futures), 1):
            res = fut.result()
            if res:
                rows.append(res)
            if idx % 1000 == 0:
                logger.debug("Fetched %d / %d", idx, len(msg_ids))

    inserted = bulk_insert(rows)
    elapsed = perf_counter() - t0
    logger.info("Sync finished: %d new rows (%.2fs)", inserted, elapsed)
    return jsonify({"processed": len(msg_ids), "inserted": inserted, "elapsed_s": elapsed})

@app.route("/disconnect")
def disconnect():
    """Sign out current Gmail: wipe session & bounce back to SPA."""
    session.clear()                               # forget saved creds
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    return redirect(FRONTEND_URL)


@app.route("/top_senders")
def top_senders():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            "SELECT sender, COUNT(*) AS cnt FROM messages GROUP BY sender ORDER BY cnt DESC LIMIT 10"
        )
        return jsonify(cur.fetchall())
    
@app.route("/delete_sender", methods=["POST"])
def delete_sender():
    """
    JSON body: { "sender": "<exact sender string from DB>" }
    Moves every matching message to Trash and removes it from SQLite.
    """
    creds_dict = session.get("credentials")
    if not creds_dict:
        return jsonify({"error": "not authorized"}), 401

    data = request.get_json(silent=True) or {}
    sender = data.get("sender")
    if not sender:
        return jsonify({"error": "sender is required"}), 400

    # 1. Get up to MAX_MESSAGES message IDs for that sender
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute("SELECT id FROM messages WHERE sender=?", (sender,))
        ids = [row[0] for row in cur]

    if not ids:
        return jsonify({"deleted": 0})

    service = build_gmail_service(creds_dict)
    logger.info("Deleting %d messages from '%s'…", len(ids), sender)

    # 2. Gmail API — batchModify supports ≤ 1000 IDs per call
    for i in range(0, len(ids), 1000):
        chunk = ids[i : i + 1000]
        body = {"ids": chunk, "removeLabelIds": ["INBOX"], "addLabelIds": ["TRASH"]}
        service.users().messages().batchModify(userId="me", body=body).execute()

    # 3. Remove rows locally (optional but keeps DB in sync)
    with sqlite3.connect(DB_PATH) as conn:
        conn.executemany("DELETE FROM messages WHERE id=?", [(mid,) for mid in ids])
        conn.commit()

    return jsonify({"deleted": len(ids)})



# ───────────────────────────────────────────────────────────— Main —───────────

if __name__ == "__main__":
    app.run(
        port=5000,
        ssl_context=("localhost+1.pem", "localhost+1-key.pem"),
        debug=True,
    )
