# WPBrigade AI Chatbot Portal

An intelligent, speech-enabled AI Administrative Assistant & User Management Portal built for **WPBrigade**. Powered by **Qwen 2.5 on Groq LPUs** for deterministic structured tool calling, **Groq Whisper** for sub-second voice-to-text transcription, and a modern **React + Express + SQLite** stack.

---

## 🌟 Key Features

### 1. 🤖 Conversational AI & Natural Language Database Management
- **Full CRUD Support**: Manage users via natural voice or chat commands (Create, Read, Update, Delete).
- **Extensive Synonym Coverage**: Recognizes over 45+ natural language synonyms across CRUD intents (*e.g., "onboard", "enroll", "purge", "lookup", "modify"*).
- **Fuzzy Soundalike Matching**: Integrated Levenshtein Distance algorithm catches spoken mishearings and typos (e.g. *Sara* vs. *Sarah*, *Moeed* vs. *Mueed*).
- **Context & Pronoun Memory**: Resolves conversational references (*"his phone number"*, *"change her city to London"*).
- **Aggregations & Queries**: Handles count/total queries naturally (*"how many total users?"*, *"count active users in New York"*).

### 2. 🎙️ Hands-Free Speech-to-Execution
- **In-Browser Audio Recording**: High-fidelity audio capture with visual mic pulsing animations.
- **Sub-200ms Transcription**: Powered by Groq's `whisper-large-v3-turbo`.
- **⚡ Hands-Free Mode Toggle**: Automatically submits transcribed voice commands or allows reviewing before sending.

### 3. 🛡️ Safety Confirmation Guard
- Prevents accidental deletions by requiring explicit interactive confirmation (*"⚠️ CONFIRMATION REQUIRED"*) before executing destructive user removals.

### 4. 📊 Modern Dark Mode Dashboard & Audit Logs
- **Glassmorphism UI**: High-contrast, premium interface inspired by modern enterprise design.
- **AI Chat History & Audit Trail**: Real-time logging of user commands and AI actions with single-click history purging.
- **Authentication**: Secure admin login and sign-up with persistent auto-login (`localStorage`).
- **Interactive Data Table**: Search filtering, direct modals, status badges, and glowing row-pulse animations upon AI modifications.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Lucide Icons | Responsive SPA with floating assistant popover |
| **Styling** | Vanilla CSS (Glassmorphic Dark Theme) | Custom CSS variables, responsive design |
| **Backend API** | Node.js + Express (ES Modules) | RESTful API and multer audio stream handler |
| **AI LLM Engine** | Groq Cloud (`qwen/qwen3.6-27b`) | Deterministic function calling (`temperature: 0.0`) |
| **Voice Transcriber** | Groq Cloud (`whisper-large-v3-turbo`) | Real-time speech-to-text |
| **Database** | SQLite3 | Local persistent storage (`users`, `admins`, `chat_history`) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- PowerShell (Windows) or Bash (macOS/Linux)
- A free [Groq API Key](https://console.groq.com/keys)

---

### 1. Environment Configuration

In the `server/` directory, create or verify `.env`:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GROQ_CHAT_MODEL=qwen/qwen3.6-27b
```

---

### 2. One-Click Launch (Recommended)

Run the included PowerShell launch script from the root directory:

```powershell
.\start-all.ps1
```

This will:
1. Automatically install dependencies for both `server` and `client`.
2. Start the Backend API server at `http://localhost:5000`.
3. Start the Frontend Vite dev server at `http://localhost:3000`.

---

### 3. Manual Launch

#### Start Backend:
```bash
cd server
npm install
npm run dev
```

#### Start Frontend:
```bash
cd client
npm install
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 💬 Example AI Voice & Chat Commands

| Intent | Example Commands |
| :--- | :--- |
| **Query / Search** | `"Find user Moeed"`, `"Look for anyone in Chicago"`, `"Show me active users"` |
| **Counts & Totals** | `"How many total users do we have?"`, `"Count users"` |
| **Create / Register** | `"Add new user Alex Chen with email alex@test.com and phone 012-555-0199"` |
| **Update** | `"Change Moeed's status to Active"`, `"Update Sarah's city to London"` |
| **Delete (Guarded)**| `"Delete user Alex Chen"` *(AI will prompt for confirmation before executing)* |

---

## 📁 Project Structure

```
wpbrigade/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # UI Components (ChatPanel, UserTable, Modals, History)
│   │   ├── services/            # Frontend API client
│   │   ├── App.jsx              # Main dashboard application
│   │   └── index.css            # Custom glassmorphic styling system
│   └── package.json
├── server/                      # Express Backend
│   ├── config/                  # SQLite DB setup & initialization
│   ├── controllers/             # Chat, User & Auth controllers
│   ├── routes/                  # REST endpoints & Voice upload routes
│   ├── services/                # AI function calling & DB query services
│   ├── .env                     # Server environment variables
│   └── package.json
├── database.sqlite              # Persistent SQLite database
├── start-all.ps1                # Automated startup script
└── README.md                    # Project documentation
```

---

## 🔒 Security & Privacy
- Zero sensitive data stored externally; database runs completely on local SQLite.
- Audited token authentication and password hashing with `bcryptjs`.
- Destructive operations require two-step conversational verification.
