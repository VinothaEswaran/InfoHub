import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False)

    score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    breach_factor: Mapped[float] = mapped_column(Float, default=0.0)
    retention_factor: Mapped[float] = mapped_column(Float, default=0.0)
    transparency_factor: Mapped[float] = mapped_column(Float, default=0.0)
    sharing_factor: Mapped[float] = mapped_column(Float, default=0.0)

    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="risk_assessments")
