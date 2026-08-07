# InfoHub

AI-Powered Personal Data Rights and Privacy Management Platform

**Live demo:** [https://infohub-frontend-g3w0.onrender.com](https://infohub-frontend-g3w0.onrender.com)

InfoHub helps you understand, monitor, and control where your personal data lives across the web. Track every company holding your information, get AI-generated summaries of their privacy policies, view an explainable privacy risk score, get notified of data breaches, and generate legally compliant deletion request letters under GDPR, India's DPDP Act, and CCPA, complete with deadline tracking.

## Features

| Page | Description |
|---|---|
| Dashboard | KPI overview, risk trend, data category breakdown, deletion timeline, recent activity |
| Data Ledger | Searchable, filterable, sortable table of every company holding your data |
| Company Details | Risk meter, data collected, breach history, one-click deletion letter generation |
| Privacy Policy AI Summary | Paste a URL and the AI reads it and returns a structured, plain-language summary |
| Risk Analysis | Overall risk meter, company comparison chart, timeline, AI recommendations |
| Breach Monitor | HaveIBeenPwned integration with an offline demo fallback |
| Deletion Requests | Generates a real PDF legal letter per jurisdiction and tracks status and deadlines |
| Notifications | Breach alerts, deadline reminders, deletion status updates, AI recommendations |
| Settings | Account, notification preferences, theme, security |

## Tech Stack

Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, React Query, Axios, Recharts, Heroicons

Backend: FastAPI, async SQLAlchemy 2.0, PostgreSQL (SQLite for local development), Alembic, JWT and Google OAuth2, Celery, Redis, httpx, Jinja2 with WeasyPrint for PDF generation, HuggingFace Transformers or OpenAI for AI summarization

Deployment: Docker, Docker Compose, GitHub Actions, Render

## Getting Started

The fastest way to try InfoHub is the live demo above. To run it locally instead, follow the steps below.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8000
```

The backend runs at http://localhost:8000, with interactive API docs available at /docs. A SQLite database file is created automatically on first run, so no separate database installation is required for local development.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173 and sign in with the demo credentials, which are pre-filled on the login form:

```
email: demo@infohub.app
password: DemoPass123!
```

## Project Structure

```
infohub/
  backend/
    app/
      api/            FastAPI routers
      models/         SQLAlchemy models
      schemas/        Pydantic schemas
      services/       Risk engine, breach scanner, policy summarizer, PDF generator, notifications, auth
      workers/        Celery app and scheduled tasks
      middleware/      Request timing middleware
      core/             Configuration and security
      db/                Database engine and session setup
      templates/          HTML template for deletion letters
      main.py
    alembic/            Migration scaffold
    tests/
    seed.py              Demo data generator
    requirements.txt
    Dockerfile
  frontend/
    src/
      components/       Shared UI components and charts
      pages/               Application pages
      layouts/               Dashboard layout
      routes/                 Route guards
      context/                 Authentication context
      services/                 API client
      hooks/                     Custom hooks
      types/                       Shared TypeScript types
    package.json
    Dockerfile
  docs/
    ARCHITECTURE.md
  docker-compose.yml
  README.md
```

## Testing

```bash
cd backend
pip install pytest
pytest -q
```
