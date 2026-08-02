import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.company import Company
from app.models.deletion_request import DeletionRequest
from app.models.user import User
from app.schemas.domain import (
    DeletionRequestCreate,
    DeletionRequestOut,
    DeletionRequestStatusUpdate,
)
from app.services.notification_service import notify_deletion_status
from app.services.pdf_generator import generate_deletion_letter

router = APIRouter(prefix="/api/deletion-requests", tags=["deletion-requests"])


@router.get("", response_model=list[DeletionRequestOut])
async def list_deletion_requests(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DeletionRequest)
        .where(DeletionRequest.user_id == current_user.id)
        .order_by(DeletionRequest.sent_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=DeletionRequestOut, status_code=201)
async def create_deletion_request(
    payload: DeletionRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Company).where(Company.id == payload.company_id, Company.owner_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    letter = generate_deletion_letter(
        company_name=company.name,
        user_name=current_user.full_name,
        user_email=current_user.email,
        jurisdiction=payload.jurisdiction,
        data_categories=company.collected_data,
    )

    deletion_request = DeletionRequest(
        company_id=company.id,
        user_id=current_user.id,
        jurisdiction=payload.jurisdiction.upper(),
        status="sent",
        deadline=letter["deadline"],
        pdf_path=letter["file_path"],
    )
    db.add(deletion_request)
    await db.commit()
    await db.refresh(deletion_request)
    return deletion_request


@router.get("/{request_id}/download")
async def download_letter(
    request_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(DeletionRequest).where(
            DeletionRequest.id == request_id, DeletionRequest.user_id == current_user.id
        )
    )
    req = result.scalar_one_or_none()
    if not req or not req.pdf_path or not os.path.exists(req.pdf_path):
        raise HTTPException(status_code=404, detail="Letter not found")
    media_type = "application/pdf" if req.pdf_path.endswith(".pdf") else "text/html"
    return FileResponse(req.pdf_path, media_type=media_type, filename=os.path.basename(req.pdf_path))


@router.patch("/{request_id}/status", response_model=DeletionRequestOut)
async def update_status(
    request_id: str,
    payload: DeletionRequestStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeletionRequest).where(
            DeletionRequest.id == request_id, DeletionRequest.user_id == current_user.id
        )
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Deletion request not found")

    if payload.status not in ("sent", "awaiting", "resolved", "escalated"):
        raise HTTPException(status_code=400, detail="Invalid status")

    req.status = payload.status
    result2 = await db.execute(select(Company).where(Company.id == req.company_id))
    company = result2.scalar_one_or_none()
    await notify_deletion_status(
        db, user_id=current_user.id, company_name=company.name if company else "the company", status=payload.status
    )
    await db.commit()
    await db.refresh(req)
    return req
