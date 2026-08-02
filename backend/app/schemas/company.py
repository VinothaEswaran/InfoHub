from datetime import datetime

from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str
    industry: str = "Other"
    logo_url: str | None = None
    website: str | None = None
    collected_data: list[str] = []
    retention_period_months: int = 24
    third_party_sharing: bool = False


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    industry: str | None = None
    logo_url: str | None = None
    website: str | None = None
    collected_data: list[str] | None = None
    retention_period_months: int | None = None
    third_party_sharing: bool | None = None


class CompanyOut(CompanyBase):
    id: str
    risk_score: float
    breach_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
