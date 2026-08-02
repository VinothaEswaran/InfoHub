from datetime import date as date_type
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.breach_record import BreachRecord
from app.models.company import Company
from app.models.user import User
from app.schemas.domain import BreachRecordOut
from app.services import breach_scanner
from app.services.notification_service import notify_breach

router = APIRouter(prefix="/api/breaches", tags=["breaches"])


def _domain_from_company(company: Company) -> str:
    if company.website:
        parsed = urlparse(company.website if "://" in company.website else f"https://{company.website}")
        return parsed.netloc or parsed.path
    return f"{company.name.lower().replace(' ', '')}.com"


@router.get("", response_model=list[BreachRecordOut])
async def list_breaches(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(BreachRecord)
        .join(Company, Company.id == BreachRecord.company_id)
        .where(Company.owner_id == current_user.id)
        .order_by(BreachRecord.breach_date.desc())
    )
    return list(result.scalars().all())


@router.post("/{company_id}/scan", response_model=list[BreachRecordOut])
async def scan_company(
    company_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    domain = _domain_from_company(company)
    found = await breach_scanner.check_domain_breaches(domain)

    existing_result = await db.execute(select(BreachRecord).where(BreachRecord.company_id == company_id))
    existing_dates = {b.breach_date.isoformat() for b in existing_result.scalars().all()}

    new_records = []
    for b in found:
        if b["breach_date"] in existing_dates:
            continue
        record = BreachRecord(
            company_id=company_id,
            breach_date=date_type.fromisoformat(b["breach_date"]),
            compromised_data=b["compromised_data"],
            severity=b["severity"],
            source=b["source"],
        )
        db.add(record)
        new_records.append(record)

    if new_records:
        company.breach_status = "active"
        await notify_breach(
            db, user_id=current_user.id, company_name=company.name, severity=new_records[0].severity
        )

    await db.commit()
    for r in new_records:
        await db.refresh(r)
    return new_records


@router.patch("/{breach_id}/resolve", response_model=BreachRecordOut)
async def resolve_breach(
    breach_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(BreachRecord)
        .join(Company, Company.id == BreachRecord.company_id)
        .where(BreachRecord.id == breach_id, Company.owner_id == current_user.id)
    )
    breach = result.scalar_one_or_none()
    if not breach:
        raise HTTPException(status_code=404, detail="Breach record not found")
    breach.resolved = True
    await db.commit()
    await db.refresh(breach)
    return breach
