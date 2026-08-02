"""
Minimal smoke tests. Run with: pytest (from backend/, after `pip install pytest httpx`)
"""
from app.services import risk_engine


def test_risk_engine_no_breaches_is_low_risk():
    result = risk_engine.assess(
        breach_records=[],
        retention_period_months=6,
        policy_risk_level="low",
        third_party_sharing=False,
    )
    assert result["score"] < 30


def test_risk_engine_breaches_and_sharing_increase_score():
    low = risk_engine.assess(
        breach_records=[], retention_period_months=6, policy_risk_level="low", third_party_sharing=False
    )
    high = risk_engine.assess(
        breach_records=[{"severity": "critical", "breach_date": "2024-01-01"}],
        retention_period_months=60,
        policy_risk_level="high",
        third_party_sharing=True,
    )
    assert high["score"] > low["score"]


def test_risk_engine_score_bounded():
    result = risk_engine.assess(
        breach_records=[{"severity": "critical", "breach_date": "2026-01-01"}] * 5,
        retention_period_months=120,
        policy_risk_level="high",
        third_party_sharing=True,
    )
    assert 0 <= result["score"] <= 100
