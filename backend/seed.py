"""
Seed the database with a demo user and realistic-looking companies, consent
records, breaches, risk assessments, deletion requests and notifications so
the dashboard looks fully alive on first run.

Usage:
    cd backend
    python seed.py
"""
import asyncio
import random
from datetime import date, datetime, timedelta

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models import (
    BreachRecord,
    Company,
    ConsentRecord,
    DeletionRequest,
    Notification,
    PrivacyPolicy,
    RiskAssessment,
    User,
)
from app.services import risk_engine

random.seed(42)

DEMO_EMAIL = "demo@infohub.app"
DEMO_PASSWORD = "DemoPass123!"

COMPANIES = [
    {"name": "Meta", "industry": "Social Media", "website": "meta.com", "collected_data": ["Email address", "Location data", "Cookies & tracking identifiers", "Phone number"], "retention_period_months": 60, "third_party_sharing": True},
    {"name": "Amazon", "industry": "E-Commerce", "website": "amazon.com", "collected_data": ["Email address", "Payment details", "Physical address"], "retention_period_months": 36, "third_party_sharing": True},
    {"name": "Spotify", "industry": "Entertainment", "website": "spotify.com", "collected_data": ["Email address", "Location data"], "retention_period_months": 12, "third_party_sharing": False},
    {"name": "LinkedIn", "industry": "Professional Network", "website": "linkedin.com", "collected_data": ["Email address", "Phone number", "Employment history"], "retention_period_months": 48, "third_party_sharing": True},
    {"name": "Netflix", "industry": "Entertainment", "website": "netflix.com", "collected_data": ["Email address", "Payment details"], "retention_period_months": 24, "third_party_sharing": False},
    {"name": "Uber", "industry": "Transportation", "website": "uber.com", "collected_data": ["Location data", "Payment details", "Phone number"], "retention_period_months": 36, "third_party_sharing": True},
    {"name": "Airbnb", "industry": "Travel", "website": "airbnb.com", "collected_data": ["Email address", "Payment details", "Physical address"], "retention_period_months": 30, "third_party_sharing": False},
    {"name": "X (Twitter)", "industry": "Social Media", "website": "x.com", "collected_data": ["Email address", "IP address", "Cookies & tracking identifiers"], "retention_period_months": 60, "third_party_sharing": True},
    {"name": "Dropbox", "industry": "Cloud Storage", "website": "dropbox.com", "collected_data": ["Email address"], "retention_period_months": 12, "third_party_sharing": False},
    {"name": "Zomato", "industry": "Food Delivery", "website": "zomato.com", "collected_data": ["Phone number", "Location data", "Payment details"], "retention_period_months": 24, "third_party_sharing": True},
]

POLICY_RISK_BY_INDEX = ["high", "medium", "low", "high", "low", "medium", "low", "high", "low", "medium"]


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        user = User(
            email=DEMO_EMAIL,
            full_name="Aditi Sharma",
            hashed_password=hash_password(DEMO_PASSWORD),
            avatar_url=None,
        )
        db.add(user)
        await db.flush()

        today = date.today()

        for i, c in enumerate(COMPANIES):
            has_breach = i % 3 != 0
            breach_records_for_scoring = []
            company = Company(
                owner_id=user.id,
                name=c["name"],
                industry=c["industry"],
                website=c["website"],
                collected_data=c["collected_data"],
                retention_period_months=c["retention_period_months"],
                third_party_sharing=c["third_party_sharing"],
                breach_status="active" if has_breach else "none",
            )
            db.add(company)
            await db.flush()

            db.add(
                ConsentRecord(
                    company_id=company.id,
                    consent_date=today - timedelta(days=random.randint(60, 900)),
                    purpose="Account creation",
                    consent_method=random.choice(["Web form", "Mobile app", "OAuth sign-up"]),
                )
            )

            policy_risk = POLICY_RISK_BY_INDEX[i]
            db.add(
                PrivacyPolicy(
                    company_id=company.id,
                    source_url=f"https://{c['website']}/privacy",
                    ai_summary=(
                        f"{c['name']} collects {', '.join(c['collected_data'][:2]).lower()} to operate its "
                        f"service{'s' if True else ''}. Data may be retained for up to "
                        f"{c['retention_period_months']} months"
                        + (" and shared with third-party partners for advertising." if c["third_party_sharing"] else ".")
                    ),
                    collected_data_summary=c["collected_data"],
                    retention_summary=f"Retained for approximately {c['retention_period_months']} months.",
                    third_party_sharing_summary=(
                        "Shares data with advertising and analytics partners."
                        if c["third_party_sharing"]
                        else "Does not share data with third parties."
                    ),
                    user_rights_summary=["Right to access your data", "Right to request deletion"],
                    risk_level=policy_risk,
                )
            )

            if has_breach:
                for j in range(random.randint(1, 2)):
                    breach_date = today - timedelta(days=random.randint(30, 800))
                    severity = random.choice(["medium", "high", "critical"])
                    compromised = random.choice(
                        [
                            ["Email addresses", "Passwords"],
                            ["Email addresses", "Payment details"],
                            ["Names", "Phone numbers"],
                        ]
                    )
                    db.add(
                        BreachRecord(
                            company_id=company.id,
                            breach_date=breach_date,
                            compromised_data=compromised,
                            severity=severity,
                            resolved=random.choice([True, False]),
                        )
                    )
                    breach_records_for_scoring.append({"severity": severity, "breach_date": breach_date})

            assessment = risk_engine.assess(
                breach_records=breach_records_for_scoring,
                retention_period_months=c["retention_period_months"],
                policy_risk_level=policy_risk,
                third_party_sharing=c["third_party_sharing"],
            )
            company.risk_score = assessment["score"]

            # a short history trail so the risk trend chart has multiple points
            for months_back in (3, 2, 1, 0):
                db.add(
                    RiskAssessment(
                        company_id=company.id,
                        score=max(0, assessment["score"] + random.uniform(-8, 8)),
                        breach_factor=assessment["breach_factor"],
                        retention_factor=assessment["retention_factor"],
                        transparency_factor=assessment["transparency_factor"],
                        sharing_factor=assessment["sharing_factor"],
                        recommendations=assessment["recommendations"],
                        assessed_at=datetime.utcnow() - timedelta(days=months_back * 30),
                    )
                )

            if i % 4 == 0:
                status = random.choice(["sent", "awaiting", "resolved", "escalated"])
                db.add(
                    DeletionRequest(
                        company_id=company.id,
                        user_id=user.id,
                        jurisdiction=random.choice(["GDPR", "DPDP", "CCPA"]),
                        status=status,
                        deadline=datetime.utcnow() + timedelta(days=random.randint(-5, 25)),
                        sent_at=datetime.utcnow() - timedelta(days=random.randint(5, 40)),
                    )
                )

        db.add(
            Notification(
                user_id=user.id,
                type="breach",
                title="New breach detected: Meta",
                message="Meta was found in a high-severity data breach. Review your data ledger entry.",
            )
        )
        db.add(
            Notification(
                user_id=user.id,
                type="ai_recommendation",
                title="AI recommendation available",
                message="3 companies in your ledger show long data retention periods — consider deletion requests.",
            )
        )
        db.add(
            Notification(
                user_id=user.id,
                type="deadline",
                title="Response deadline approaching: Uber",
                message="Uber has 3 day(s) left to respond to your deletion request.",
            )
        )

        await db.commit()

    print(f"Seed complete. Log in with:\n  email:    {DEMO_EMAIL}\n  password: {DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
