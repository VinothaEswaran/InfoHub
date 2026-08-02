import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PrivacyPolicy(Base):
    __tablename__ = "privacy_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), nullable=False, unique=True)

    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    collected_data_summary: Mapped[list] = mapped_column(JSON, default=list)
    retention_summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    third_party_sharing_summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    user_rights_summary: Mapped[list] = mapped_column(JSON, default=list)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")  # low | medium | high

    last_analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="privacy_policy")
