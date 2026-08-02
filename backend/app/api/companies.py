from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyOut, CompanyUpdate
from app.services import risk_engine

router = APIRouter(prefix="/api/companies", tags=["companies"])


async def _get_owned_company(db: AsyncSession, company_id: str, user: User) -> Company:
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.get("", response_model=list[CompanyOut])
async def list_companies(
    search: str | None = None,
    industry: str | None = None,
    sort_by: str = "risk_score",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Company).where(Company.owner_id == current_user.id)
    if search:
        query = query.where(Company.name.ilike(f"%{search}%"))
    if industry:
        query = query.where(Company.industry == industry)

    result = await db.execute(query)
    companies = list(result.scalars().all())

    reverse = sort_by in ("risk_score", "created_at", "updated_at")
    companies.sort(key=lambda c: getattr(c, sort_by, c.risk_score), reverse=reverse)
    return companies


@router.post("", response_model=CompanyOut, status_code=201)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = risk_engine.assess(
        breach_records=[],
        retention_period_months=payload.retention_period_months,
        policy_risk_level=None,
        third_party_sharing=payload.third_party_sharing,
    )
    company = Company(owner_id=current_user.id, risk_score=assessment["score"], **payload.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await _get_owned_company(db, company_id, current_user)


@router.patch("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: str,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = await _get_owned_company(db, company_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    await db.commit()
    await db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    company = await _get_owned_company(db, company_id, current_user)
    await db.delete(company)
    await db.commit()
