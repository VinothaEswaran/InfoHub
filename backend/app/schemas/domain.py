from datetime import date, datetime

from pydantic import BaseModel


# ---- Privacy Policy ----
class PolicyAnalyzeRequest(BaseModel):
    company_id: str
    source_url: str | None = None
    raw_text: str | None = None


class PrivacyPolicyOut(BaseModel):
    id: str
    company_id: str
    source_url: str | None
    ai_summary: str | None
    collected_data_summary: list[str]
    retention_summary: str | None
    third_party_sharing_summary: str | None
    user_rights_summary: list[str]
    risk_level: str
    last_analyzed_at: datetime

    class Config:
        from_attributes = True


# ---- Risk ----
class RiskAssessmentOut(BaseModel):
    id: str
    company_id: str
    score: float
    breach_factor: float
    retention_factor: float
    transparency_factor: float
    sharing_factor: float
    recommendations: list[str]
    assessed_at: datetime

    class Config:
        from_attributes = True


# ---- Breach ----
class BreachRecordOut(BaseModel):
    id: str
    company_id: str
    breach_date: date
    compromised_data: list[str]
    severity: str
    source: str
    resolved: bool
    user_notified: bool

    class Config:
        from_attributes = True


# ---- Deletion Request ----
class DeletionRequestCreate(BaseModel):
    company_id: str
    jurisdiction: str = "GDPR"


class DeletionRequestOut(BaseModel):
    id: str
    company_id: str
    jurisdiction: str
    status: str
    deadline: datetime
    pdf_path: str | None
    sent_at: datetime
    resolved_at: datetime | None

    class Config:
        from_attributes = True


class DeletionRequestStatusUpdate(BaseModel):
    status: str


# ---- Notification ----
class NotificationOut(BaseModel):
    id: str
    type: str
    title: str
    message: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Dashboard ----
class DashboardOverview(BaseModel):
    companies_tracking: int
    average_risk_score: float
    recent_breaches: int
    pending_requests: int
    privacy_health_score: float
    resolved_requests: int
