# InfoHub — Architecture

## High-level flow

```
┌────────────┐      HttpOnly JWT cookie       ┌──────────────┐
│  Frontend  │ ───────────────────────────── ▶│   FastAPI    │
│ React+Vite │ ◀───────────────────────────── │   Backend    │
└────────────┘        JSON over REST           └──────┬───────┘
                                                       │
                          ┌────────────────────────────┼─────────────────────────┐
                          ▼                            ▼                         ▼
                   ┌─────────────┐            ┌────────────────┐        ┌────────────────┐
                   │ PostgreSQL  │            │  Redis + Celery │        │ External APIs  │
                   │ (async SA)  │            │ (breach scans,   │        │ HIBP / OpenAI /│
                   └─────────────┘            │  deadline jobs)  │        │ HF Transformers│
                                               └────────────────┘        └────────────────┘
```

## Why these choices

- **Async SQLAlchemy + FastAPI**: the platform is I/O-heavy (external API calls to HIBP,
  OpenAI/HuggingFace, and privacy-policy URLs) — async avoids blocking the event loop while
  those calls are in flight.
- **Rule-based risk engine** (`app/services/risk_engine.py`): privacy risk scoring needs to be
  *explainable* — a user (and a regulator) should be able to see exactly why a company scored
  a 72/100. A transparent weighted formula is used instead of an opaque ML model; the same
  `assess()` interface makes it easy to swap in a trained model later without touching callers.
- **Graceful degradation everywhere**: HIBP calls fall back to deterministic mock data without
  an API key; PDF generation falls back to HTML if WeasyPrint's native libs aren't installed;
  AI summarization falls back from OpenAI → local HuggingFace pipeline → naive extractive
  summary. The product always works end-to-end in a demo environment, and upgrades in place
  as real credentials/infra are added.
- **Celery + Redis**: nightly breach sweeps and deadline checks are scheduled jobs that
  shouldn't block API requests or run on every page load.
- **HttpOnly JWT cookie** (not localStorage): mitigates XSS token theft; `SameSite=Lax` +
  `Secure` in production.

## Data model

See `backend/app/models/` — `User → Company → {ConsentRecord, PrivacyPolicy, RiskAssessment,
BreachRecord, DeletionRequest}`, plus `Notification` on `User`. Each `Company` is scoped to
its owning `User` (row-level ownership checks happen in every API route via
`Company.owner_id == current_user.id`).

## Extending this project

- **Swap SQLite → Postgres**: already wired — just run via `docker-compose up`, which sets
  `DATABASE_URL` to the Postgres service automatically. Local `python -m uvicorn` defaults to
  SQLite for a zero-config dev experience.
- **Real AI summarization**: set `OPENAI_API_KEY` in `backend/.env`, or leave blank to use the
  local HuggingFace `facebook/bart-large-cnn` pipeline (`pip install transformers torch`).
- **Real breach data**: set `HIBP_API_KEY` (requires a HaveIBeenPwned subscription).
- **Alembic migrations**: `alembic revision --autogenerate -m "message"` then
  `alembic upgrade head` — useful once you move past `create_all`-on-boot for schema changes
  in a real deployment.
