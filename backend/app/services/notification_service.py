from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession, *, user_id: str, type: str, title: str, message: str
) -> Notification:
    notif = Notification(user_id=user_id, type=type, title=title, message=message)
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


async def notify_breach(db: AsyncSession, *, user_id: str, company_name: str, severity: str) -> Notification:
    return await create_notification(
        db,
        user_id=user_id,
        type="breach",
        title=f"New breach detected: {company_name}",
        message=f"{company_name} was found in a {severity}-severity data breach. Review your data ledger entry.",
    )


async def notify_deadline(db: AsyncSession, *, user_id: str, company_name: str, days_left: int) -> Notification:
    return await create_notification(
        db,
        user_id=user_id,
        type="deadline",
        title=f"Response deadline approaching: {company_name}",
        message=f"{company_name} has {days_left} day(s) left to respond to your deletion request.",
    )


async def notify_deletion_status(
    db: AsyncSession, *, user_id: str, company_name: str, status: str
) -> Notification:
    type_ = "deletion_approved" if status == "resolved" else "deletion_failed" if status == "escalated" else "info"
    title = f"Deletion request update: {company_name}"
    message = f"Your deletion request to {company_name} is now '{status}'."
    return await create_notification(db, user_id=user_id, type=type_, title=title, message=message)
