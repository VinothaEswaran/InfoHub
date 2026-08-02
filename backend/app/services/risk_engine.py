"""
Risk Engine
-----------
Computes a 0-100 privacy risk score for a company from four weighted factors:

  breach_factor        - has this company had breaches, how severe/recent
  retention_factor      - how long it keeps data (longer = riskier)
  transparency_factor   - inverse of how clear/complete its privacy policy is
  sharing_factor         - whether it shares data with third parties

This is a transparent, explainable rule engine by design (regulators and
users need to know *why* a score is what it is). The `PrivacyPolicySummarizer`
(AI-based) feeds the transparency_factor; `BreachScanner` feeds breach_factor.
Swap in a ML model here later by keeping the same `assess()` signature.
"""
from __future__ import annotations

from datetime import date, datetime

WEIGHTS = {
    "breach": 0.40,
    "retention": 0.20,
    "transparency": 0.20,
    "sharing": 0.20,
}


def _breach_factor(breach_records: list[dict]) -> float:
    if not breach_records:
        return 0.0
    severity_points = {"low": 15, "medium": 35, "high": 65, "critical": 100}
    score = 0.0
    today = date.today()
    for b in breach_records:
        base = severity_points.get(b.get("severity", "medium"), 35)
        breach_date = b.get("breach_date")
        if isinstance(breach_date, str):
            breach_date = datetime.fromisoformat(breach_date).date()
        age_years = max(0, (today - breach_date).days / 365) if breach_date else 3
        recency_multiplier = max(0.4, 1 - (age_years * 0.12))  # older breaches matter less
        score = max(score, base * recency_multiplier)
    return min(100.0, score)


def _retention_factor(retention_period_months: int) -> float:
    # 0 months -> 0 risk, 60+ months (5yrs) -> full risk
    return min(100.0, (retention_period_months / 60) * 100)


def _transparency_factor(policy_risk_level: str | None) -> float:
    mapping = {"low": 15.0, "medium": 50.0, "high": 90.0, None: 60.0}
    return mapping.get(policy_risk_level, 60.0)


def _sharing_factor(third_party_sharing: bool) -> float:
    return 80.0 if third_party_sharing else 10.0


def assess(
    *,
    breach_records: list[dict] | None = None,
    retention_period_months: int = 24,
    policy_risk_level: str | None = None,
    third_party_sharing: bool = False,
) -> dict:
    breach = _breach_factor(breach_records or [])
    retention = _retention_factor(retention_period_months)
    transparency = _transparency_factor(policy_risk_level)
    sharing = _sharing_factor(third_party_sharing)

    score = (
        breach * WEIGHTS["breach"]
        + retention * WEIGHTS["retention"]
        + transparency * WEIGHTS["transparency"]
        + sharing * WEIGHTS["sharing"]
    )

    recommendations: list[str] = []
    if breach > 50:
        recommendations.append("This company has a significant breach history — consider a deletion request.")
    if retention > 60:
        recommendations.append("Data retention period is unusually long — ask for a shorter retention window.")
    if transparency > 60:
        recommendations.append("Privacy policy lacks transparency — request a plain-language data summary.")
    if sharing > 50:
        recommendations.append("This company shares data with third parties — review and opt out where possible.")
    if not recommendations:
        recommendations.append("No immediate action needed — this company shows a healthy privacy posture.")

    return {
        "score": round(score, 1),
        "breach_factor": round(breach, 1),
        "retention_factor": round(retention, 1),
        "transparency_factor": round(transparency, 1),
        "sharing_factor": round(sharing, 1),
        "recommendations": recommendations,
    }
