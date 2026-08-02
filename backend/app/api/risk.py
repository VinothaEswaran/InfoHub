from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.breach_record import BreachRecord
from app.models.company import Company
from app.models.privacy_policy import PrivacyPolicy
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.schemas.domain import RiskAssessmentOut
from app.services import risk_engine

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.post("/{company_id}/recompute", response_model=RiskAssessmentOut)
async def recompute_risk(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    breach_result = await db.execute(select(BreachRecord).where(BreachRecord.company_id == company_id))
    breaches = [
        {"severity": b.severity, "breach_date": b.breach_date} for b in breach_result.scalars().all()
    ]

    policy_result = await db.execute(select(PrivacyPolicy).where(PrivacyPolicy.company_id == company_id))
    policy = policy_result.scalar_one_or_none()

    assessment_data = risk_engine.assess(
        breach_records=breaches,
        retention_period_months=company.retention_period_months,
        policy_risk_level=policy.risk_level if policy else None,
        third_party_sharing=company.third_party_sharing,
    )

    company.risk_score = assessment_data["score"]
    company.breach_status = "active" if breaches else "none"

    record = RiskAssessment(
        company_id=company_id,
        score=assessment_data["score"],
        breach_factor=assessment_data["breach_factor"],
        retention_factor=assessment_data["retention_factor"],
        transparency_factor=assessment_data["transparency_factor"],
        sharing_factor=assessment_data["sharing_factor"],
        recommendations=assessment_data["recommendations"],
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{company_id}/history", response_model=list[RiskAssessmentOut])
async def risk_history(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(RiskAssessment)
        .join(Company, Company.id == RiskAssessment.company_id)
        .where(RiskAssessment.company_id == company_id, Company.owner_id == current_user.id)
        .order_by(RiskAssessment.assessed_at.asc())
    )
    return list(result.scalars().all())


@router.get("/overview/top-risk", response_model=list[RiskAssessmentOut])
async def top_risk_companies(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Latest risk assessment per company, sorted descending by score (top 5)."""
    result = await db.execute(
        select(RiskAssessment)
        .join(Company, Company.id == RiskAssessment.company_id)
        .where(Company.owner_id == current_user.id)
        .order_by(RiskAssessment.score.desc())
        .limit(5)
    )
    return list(result.scalars().all())
