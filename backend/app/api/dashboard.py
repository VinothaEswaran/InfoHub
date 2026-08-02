from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.breach_record import BreachRecord
from app.models.company import Company
from app.models.deletion_request import DeletionRequest
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.schemas.domain import DashboardOverview

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def overview(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    companies_result = await db.execute(select(Company).where(Company.owner_id == current_user.id))
    companies = list(companies_result.scalars().all())

    avg_risk = sum(c.risk_score for c in companies) / len(companies) if companies else 0.0

    breach_result = await db.execute(
        select(func.count(BreachRecord.id))
        .join(Company, Company.id == BreachRecord.company_id)
        .where(Company.owner_id == current_user.id)
    )
    recent_breaches = breach_result.scalar_one() or 0

    pending_result = await db.execute(
        select(func.count(DeletionRequest.id)).where(
            DeletionRequest.user_id == current_user.id,
            DeletionRequest.status.in_(["sent", "awaiting"]),
        )
    )
    pending_requests = pending_result.scalar_one() or 0

    resolved_result = await db.execute(
        select(func.count(DeletionRequest.id)).where(
            DeletionRequest.user_id == current_user.id, DeletionRequest.status == "resolved"
        )
    )
    resolved_requests = resolved_result.scalar_one() or 0

    privacy_health_score = round(max(0.0, 100 - avg_risk), 1)

    return DashboardOverview(
        companies_tracking=len(companies),
        average_risk_score=round(avg_risk, 1),
        recent_breaches=recent_breaches,
        pending_requests=pending_requests,
        privacy_health_score=privacy_health_score,
        resolved_requests=resolved_requests,
    )


@router.get("/charts/risk-trend")
async def risk_trend(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(RiskAssessment.assessed_at, RiskAssessment.score)
        .join(Company, Company.id == RiskAssessment.company_id)
        .where(Company.owner_id == current_user.id)
        .order_by(RiskAssessment.assessed_at.asc())
    )
    rows = result.all()
    buckets: dict[str, list[float]] = {}
    for assessed_at, score in rows:
        key = assessed_at.strftime("%Y-%m")
        buckets.setdefault(key, []).append(score)
    return [{"month": k, "avg_risk": round(sum(v) / len(v), 1)} for k, v in sorted(buckets.items())]


@router.get("/charts/data-categories")
async def data_categories(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Company.collected_data).where(Company.owner_id == current_user.id))
    counter: Counter[str] = Counter()
    for (categories,) in result.all():
        counter.update(categories or [])
    return [{"category": k, "count": v} for k, v in counter.most_common()]


@router.get("/charts/deletion-timeline")
async def deletion_timeline(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(DeletionRequest.sent_at, DeletionRequest.status).where(
            DeletionRequest.user_id == current_user.id
        )
    )
    buckets: dict[str, Counter] = {}
    for sent_at, status in result.all():
        key = sent_at.strftime("%Y-%m")
        buckets.setdefault(key, Counter())[status] += 1
    return [{"month": k, **v} for k, v in sorted(buckets.items())]
