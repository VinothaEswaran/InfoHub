from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, breaches, companies, dashboard, deletions, notifications, policies, risk
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.middleware.timing import TimingMiddleware

# Import models so their tables register on Base.metadata before create_all runs.
from app import models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="InfoHub API",
    description="AI-Powered Personal Data Rights & Privacy Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(TimingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(policies.router)
app.include_router(risk.router)
app.include_router(breaches.router)
app.include_router(deletions.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
