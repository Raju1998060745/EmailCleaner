# 📧 EmailCleaner

**EmailCleaner** is a full-stack web application that provides Gmail analytics and inbox management capabilities. It allows users to authenticate with their Gmail accounts, synchronize email metadata to a local database, and perform analytics to identify email patterns and bulk delete emails from specific senders.

🔗 **Project Documentation**: [DeepWiki - EmailCleaner Overview](https://deepwiki.com/Raju1998060745/EmailCleaner/1-overview)

---

## 🧠 Purpose and Scope

- **Authenticate** with Gmail via OAuth 2.0
- **Synchronize** email metadata to a local SQLite database
- **Analyze** email patterns to identify frequent senders
- **Bulk delete** emails from specific senders

---

## 🏗️ System Architecture

The application follows a client-server architecture with clear separation between the frontend and backend components:

- **Backend API**: Flask application handling OAuth, Gmail API integration, and database operations.
- **Frontend App**: React + TypeScript application providing the user interface and interacting with the backend API.

---

## 🔄 Core Application Workflows

1. **User Authentication**: Users log in using Google OAuth 2.0, granting the application access to their Gmail account.
2. **Email Synchronization**: The application fetches email metadata using the Gmail API and stores it in a local SQLite database.
3. **Analytics Dashboard**: Users can view analytics to identify patterns, such as frequent senders.
4. **Bulk Deletion**: Users can select specific senders and delete all associated emails in bulk.

---

## 🛠️ Key Technologies and Components

| Component           | Technology            | Purpose                                         |
|---------------------|-----------------------|-------------------------------------------------|
| Backend API         | Flask                 | OAuth handling, Gmail API integration, SQLite operations |
| Frontend App        | React + TypeScript    | User interface, state management, API consumption |
| Authentication      | Google OAuth 2.0      | Gmail account authorization and session management |
| Data Storage        | SQLite                | Email metadata persistence (`messages` table)   |
| Email Processing    | Gmail API + ThreadPoolExecutor | Parallel email metadata fetching         |
| CORS                | Flask-CORS            | Cross-origin requests from React dev server     |

---

## 🗄️ Data Flow and Storage Schema

- **Database**: `emailmeta.db` SQLite database containing a `messages` table to store email metadata.
- **Data Insertion**: Efficient batch insertions handled by the `bulk_insert` function with duplicate handling via `INSERT OR IGNORE`.
- **Parallel Processing**: Email synchronization optimized through `ThreadPoolExecutor` with configurable worker threads and message limits.

---

## 🔐 Security and Configuration

- **OAuth 2.0**: Secure authentication flow with state parameter validation.
- **Session Management**: HTTPS-only session cookies configured for security.
- **File Exclusions**: Sensitive files excluded via `.gitignore`, including `*.db`, `*.pem`, and `*.json`.
- **API Scopes**: Gmail API scopes limited to `gmail.modify` for necessary permissions.
- **Configuration**: Environment variables used for settings like `MAX_GMAIL_THREADS`, `MAX_GMAIL_MESSAGES`, `EMAIL_DB`, and `FLASK_SECRET_KEY`.

---

