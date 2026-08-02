# InfoHub

**AI-Powered Personal Data Rights & Privacy Management Platform**

InfoHub helps you understand, monitor, and control where your personal data lives across the
web. Track every company holding your information, get AI-generated plain-language summaries
of their privacy policies, see an explainable privacy risk score, get notified of data
breaches, and generate legally compliant deletion request letters (GDPR / India's DPDP Act /
CCPA) with deadline tracking.

![Tech](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite%20%2B%20TS-5B3DF5)
![Tech](https://img.shields.io/badge/backend-FastAPI%20%2B%20Async%20SQLAlchemy-00D9FF)

---

## ✨ Features

| Page | What it does |
|---|---|
| **Dashboard** | KPI overview, risk trend, data category breakdown, deletion timeline, recent activity |
| **Data Ledger** | Searchable/filterable/sortable table of every company holding your data |
| **Company Details** | Risk meter, data collected, breach history, one-click deletion letter generation |
| **Privacy Policy AI Summary** | Paste a URL → AI reads it and returns a structured, plain-language summary |
| **Risk Analysis** | Overall risk meter, company comparison chart, timeline, AI recommendations |
| **Breach Monitor** | HaveIBeenPwned integration (with offline demo fallback) |
| **Deletion Requests** | Generates a real PDF legal letter per jurisdiction, tracks status + deadlines |
| **Notifications** | Breach alerts, deadline reminders, deletion status updates, AI recommendations |
| **Settings** | Account, notification prefs, theme, security |

## 🧱 Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, React
Query, Axios, Recharts, Heroicons

**Backend:** FastAPI, async SQLAlchemy 2.0, PostgreSQL (SQLite for local dev), Alembic, JWT +
Google OAuth2, Celery, Redis, httpx, Jinja2 + WeasyPrint (PDF), HuggingFace Transformers /
OpenAI (AI summarization)

**Deployment:** Docker, Docker Compose, GitHub Actions

---

## 🚀 Quick Start (no Docker, fastest path to a running demo)

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                     # defaults work out of the box (SQLite)
python seed.py                                            # creates demo user + 10 companies of realistic data
uvicorn app.main:app --reload --port 8000
```

Backend now runs at `http://localhost:8000` (interactive docs at `/docs`). SQLite database file
`infohub.db` is created automatically on first boot — no separate Postgres install needed for
local development.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. Click **Sign in**, the demo credentials are pre-filled:

```
email:    demo@infohub.app
password: DemoPass123!
```

---

## 🐳 Quick Start (Docker Compose — full production-like stack)

```bash
cp backend/.env.example backend/.env    # edit secrets as needed
docker compose up --build
```

This spins up: PostgreSQL, Redis, the FastAPI backend, a Celery worker, a Celery beat scheduler
(nightly breach scans + deadline checks), and the frontend served via Nginx.

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

After the containers are up, seed demo data once:

```bash
docker compose exec backend python seed.py
```

---

## 🔑 Enabling real integrations (optional — the app works fully without these)

| Feature | Env var | Without it |
|---|---|---|
| Google Sign-In | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Email/password auth still works fully |
| Live breach data | `HIBP_API_KEY` (HaveIBeenPwned) | Deterministic mock breach data is used instead |
| AI policy summarization (best quality) | `OPENAI_API_KEY` | Falls back to a local HuggingFace `facebook/bart-large-cnn` pipeline, then a naive extractive summary if `transformers`/`torch` aren't installed |

All of these live in `backend/.env` (copy from `backend/.env.example`).

---

## 📁 Project Structure

```
infohub/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routers (auth, companies, policies, risk, breaches, deletions, notifications, dashboard)
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # risk_engine, breach_scanner, policy_summarizer, pdf_generator, notification_service, auth_service
│   │   ├── workers/          # Celery app + scheduled tasks
│   │   ├── middleware/       # timing middleware
│   │   ├── core/             # config, security (JWT/hashing)
│   │   ├── db/                # async engine/session, declarative base
│   │   ├── templates/         # Jinja2 HTML template for deletion letters
│   │   └── main.py
│   ├── alembic/               # migration scaffold (wired to app settings/models)
│   ├── tests/
│   ├── seed.py                 # demo data generator
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/         # Sidebar, Navbar, StatCard, RiskMeter, RiskBadge, charts/, Skeletons
│   │   ├── pages/                # Landing, Login, Dashboard, DataLedger, CompanyDetails, PrivacyPolicyPage,
│   │   │                          # RiskAnalysis, BreachMonitor, DeletionRequests, NotificationsPage, Settings
│   │   ├── layouts/               # DashboardLayout
│   │   ├── routes/                 # ProtectedRoute
│   │   ├── context/                 # AuthContext
│   │   ├── services/                 # api.ts (Axios client)
│   │   ├── hooks/                     # useDebounce
│   │   └── types/                      # shared TS interfaces
│   ├── package.json
│   └── Dockerfile
├── docs/
│   └── ARCHITECTURE.md
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## 🧪 Tests

```bash
cd backend
pip install pytest
pytest -q
```

## 🎨 Design

Dark navy (`#071427`) base with purple (`#5B3DF5`) and cyan (`#00D9FF`) accents, glassmorphic
cards with 18px rounded corners, Space Grotesk for display type, Inter for body text — built
to feel like a premium SaaS product (Stripe / Vercel / Notion register).

## ⚠️ Notes on scope

This is a complete, runnable full-stack reference implementation, not a toy mockup — every
page is wired to a real FastAPI endpoint backed by a real (SQLite or Postgres) database, and
`seed.py` populates it with realistic demo data so the dashboard is fully alive on first run.
A few pieces are intentionally simplified for a self-contained demo and clearly marked in code
comments as the place to extend for production: Alembic migrations ship as scaffolding (the
app uses `create_all` on boot for zero-config local dev), and the AI/breach integrations
degrade gracefully to deterministic mocks without API keys so the whole product works offline
out of the box.
