"""
Celery Tasks
------------
Background jobs that keep InfoHub's data fresh without blocking API requests:

  scan_all_companies_for_breaches  - nightly HIBP sweep across every tracked company
  check_deletion_deadlines          - flags deletion requests nearing their legal deadline
  generate_deletion_letter_task     - offloads PDF rendering off the request/response cycle

Each task wraps an async DB routine with asyncio.run(), since Celery workers
are synchronous by default but our services/models are async (SQLAlchemy 2.0 async).
"""
from __future__ import annotations

import asyncio
from datetime import date as date_type, datetime, timedelta, timezone
from urllib.parse import urlparse

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.breach_record import BreachRecord
from app.models.company import Company
from app.models.deletion_request import DeletionRequest
from app.services import breach_scanner
from app.services.notification_service import notify_breach, notify_deadline
from app.workers.celery_app import celery_app


def _domain_for(company: Company) -> str:
    if company.website:
        parsed = urlparse(company.website if "://" in company.website else f"https://{company.website}")
        return parsed.netloc or parsed.path
    return f"{company.name.lower().replace(' ', '')}.com"


async def _scan_all_companies() -> int:
    new_breach_count = 0
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Company))
        companies = list(result.scalars().all())

        for company in companies:
            found = await breach_scanner.check_domain_breaches(_domain_for(company))
            existing_result = await db.execute(
                select(BreachRecord.breach_date).where(BreachRecord.company_id == company.id)
            )
            existing_dates = {d.isoformat() for (d,) in existing_result.all()}

            for b in found:
                if b["breach_date"] in existing_dates:
                    continue
                db.add(
                    BreachRecord(
                        company_id=company.id,
                        breach_date=date_type.fromisoformat(b["breach_date"]),
                        compromised_data=b["compromised_data"],
                        severity=b["severity"],
                        source=b["source"],
                    )
                )
                new_breach_count += 1
                await notify_breach(
                    db, user_id=company.owner_id, company_name=company.name, severity=b["severity"]
                )
                company.breach_status = "active"

        await db.commit()
    return new_breach_count


async def _check_deadlines() -> int:
    flagged = 0
    async with AsyncSessionLocal() as db:
        soon = datetime.now(timezone.utc) + timedelta(days=3)
        result = await db.execute(
            select(DeletionRequest).where(
                DeletionRequest.status.in_(["sent", "awaiting"]),
                DeletionRequest.deadline <= soon,
            )
        )
        for req in result.scalars().all():
            company_result = await db.execute(select(Company).where(Company.id == req.company_id))
            company = company_result.scalar_one_or_none()
            days_left = max(0, (req.deadline.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).days)
            await notify_deadline(
                db,
                user_id=req.user_id,
                company_name=company.name if company else "the company",
                days_left=days_left,
            )
            flagged += 1
        await db.commit()
    return flagged


@celery_app.task(name="app.workers.tasks.scan_all_companies_for_breaches")
def scan_all_companies_for_breaches() -> int:
    return asyncio.run(_scan_all_companies())


@celery_app.task(name="app.workers.tasks.check_deletion_deadlines")
def check_deletion_deadlines() -> int:
    return asyncio.run(_check_deadlines())
