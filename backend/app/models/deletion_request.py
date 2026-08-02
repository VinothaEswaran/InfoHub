import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    jurisdiction: Mapped[str] = mapped_column(String(20), default="GDPR")  # GDPR | DPDP | CCPA
    status: Mapped[str] = mapped_column(String(20), default="sent")  # sent | awaiting | resolved | escalated
    deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    company = relationship("Company", back_populates="deletion_requests")
