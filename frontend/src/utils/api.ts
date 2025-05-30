import { SyncStats, TopSender } from '../types';

// Base API URL - would be set based on environment in a real app
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://localhost:5000';

// Generic fetch function with error handling


// Generic typed fetch helper
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Ensure cookies (Flask session) are sent
    credentials: "include",
  });

  // Detect server‑side redirect to /authorize (user not connected)
  if (res.redirected && res.url.includes("/authorize")) {
    throw new Error("Not connected. Please click 'Connect Gmail' first.");
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Trigger inbox sync on the backend and return statistics.
 */
export async function fetchSyncEmails(): Promise<SyncStats> {
  const raw = await fetchAPI<{ processed: number; inserted: number; elapsed_s: number }>(
    "/sync",
  );

  return {
    processed: raw.processed,
    inserted: raw.inserted,
    timeElapsed: raw.elapsed_s, // unify naming
  };
}

/**
 * Fetch the top‑10 senders ranked by message count.
 */
export async function fetchTopSenders(): Promise<TopSender[]> {
  const rows = await fetchAPI<[string, number][]>('/top_senders');
  return rows.map(([email, count]) => ({ email, count }));
}

export async function fetchProfile(): Promise<string> {
  const { email } = await fetchAPI<{ email: string }>("/profile");
  return email;
}

export async function deleteSender(sender: string): Promise<number> {
  const res = await fetchAPI<{ deleted: number }>("/delete_sender", {
    method: "POST",
    body: JSON.stringify({ sender }),
  });
  return res.deleted;          // number of messages moved to Trash
}

export async function disconnect(): Promise<void> {
  await fetchAPI("/disconnect", { method: "GET" });
}
