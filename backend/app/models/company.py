import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(120), default="Other")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # what data of the user's this company holds, e.g. ["email", "phone", "location"]
    collected_data: Mapped[list] = mapped_column(JSON, default=list)
    retention_period_months: Mapped[int] = mapped_column(default=24)
    third_party_sharing: Mapped[bool] = mapped_column(default=False)

    risk_score: Mapped[float] = mapped_column(Float, default=50.0)  # 0-100, higher = riskier
    breach_status: Mapped[str] = mapped_column(String(50), default="none")  # none | past | active

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="companies")
    consent_records = relationship("ConsentRecord", back_populates="company", cascade="all, delete-orphan")
    privacy_policy = relationship("PrivacyPolicy", back_populates="company", uselist=False, cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="company", cascade="all, delete-orphan")
    breach_records = relationship("BreachRecord", back_populates="company", cascade="all, delete-orphan")
    deletion_requests = relationship("DeletionRequest", back_populates="company", cascade="all, delete-orphan")
