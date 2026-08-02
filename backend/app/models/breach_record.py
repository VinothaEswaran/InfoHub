import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BreachRecord(Base):
    __tablename__ = "breach_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)

    breach_date: Mapped[date] = mapped_column(Date, nullable=False)
    compromised_data: Mapped[list] = mapped_column(JSON, default=list)  # ["email", "passwords", ...]
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low | medium | high | critical
    source: Mapped[str] = mapped_column(String(120), default="HaveIBeenPwned")
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    user_notified: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="breach_records")
