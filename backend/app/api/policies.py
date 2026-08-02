import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.company import Company
from app.models.privacy_policy import PrivacyPolicy
from app.models.user import User
from app.schemas.domain import PolicyAnalyzeRequest, PrivacyPolicyOut
from app.services import policy_summarizer, risk_engine

router = APIRouter(prefix="/api/policies", tags=["policies"])


async def _fetch_url_text(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            # crude tag strip; good enough for policy prose extraction
            import re

            text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", resp.text, flags=re.S)
            text = re.sub(r"<[^>]+>", " ", text)
            text = re.sub(r"\s+", " ", text)
            return text.strip()
    except Exception:
        return ""


@router.post("/analyze", response_model=PrivacyPolicyOut)
async def analyze_policy(
    payload: PolicyAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Company).where(Company.id == payload.company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    raw_text = payload.raw_text or ""
    if payload.source_url and not raw_text:
        raw_text = await _fetch_url_text(payload.source_url)

    summary = await policy_summarizer.summarize_policy(raw_text)

    existing = await db.execute(select(PrivacyPolicy).where(PrivacyPolicy.company_id == company.id))
    policy = existing.scalar_one_or_none()
    if policy is None:
        policy = PrivacyPolicy(company_id=company.id)
        db.add(policy)

    policy.source_url = payload.source_url
    policy.raw_text = raw_text[:20000] if raw_text else None
    policy.ai_summary = summary["ai_summary"]
    policy.collected_data_summary = summary["collected_data_summary"]
    policy.retention_summary = summary["retention_summary"]
    policy.third_party_sharing_summary = summary["third_party_sharing_summary"]
    policy.user_rights_summary = summary["user_rights_summary"]
    policy.risk_level = summary["risk_level"]

    # Re-run the risk engine now that we have a fresh transparency signal
    assessment = risk_engine.assess(
        breach_records=[],
        retention_period_months=company.retention_period_months,
        policy_risk_level=policy.risk_level,
        third_party_sharing=company.third_party_sharing,
    )
    company.risk_score = assessment["score"]

    await db.commit()
    await db.refresh(policy)
    return policy


@router.get("/{company_id}", response_model=PrivacyPolicyOut)
async def get_policy(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(PrivacyPolicy).where(PrivacyPolicy.company_id == company_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="No policy analysis found for this company yet")
    return policy
