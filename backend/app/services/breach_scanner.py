"""
Breach Scanner
--------------
Integrates with the HaveIBeenPwned (HIBP) API to check whether a domain/email
has appeared in known breaches. Requires HIBP_API_KEY to be set; without a
key (e.g. local dev without a paid HIBP subscription), falls back to a
deterministic mock generator so the rest of the product still works end to
end for demo purposes.
"""
from __future__ import annotations

import hashlib
from datetime import date, timedelta

import httpx

from app.core.config import settings

HIBP_BASE_URL = "https://haveibeenpwned.com/api/v3"


async def check_domain_breaches(domain: str) -> list[dict]:
    """Returns a list of breach dicts: breach_date, compromised_data, severity, source."""
    if settings.HIBP_API_KEY:
        return await _check_hibp(domain)
    return _mock_breaches(domain)


async def _check_hibp(domain: str) -> list[dict]:
    headers = {"hibp-api-key": settings.HIBP_API_KEY, "user-agent": "InfoHub-PrivacyPlatform"}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{HIBP_BASE_URL}/breaches", params={"domain": domain}, headers=headers)
        if resp.status_code != 200:
            return []
        breaches = resp.json()

    results = []
    for b in breaches:
        classes = b.get("DataClasses", [])
        severity = "critical" if "Passwords" in classes else ("high" if len(classes) > 4 else "medium")
        results.append(
            {
                "breach_date": b.get("BreachDate"),
                "compromised_data": classes,
                "severity": severity,
                "source": "HaveIBeenPwned",
            }
        )
    return results


def _mock_breaches(domain: str) -> list[dict]:
    """Deterministic mock so the same company always shows the same demo data."""
    h = int(hashlib.sha256(domain.encode()).hexdigest(), 16)
    if h % 3 == 0:
        return []  # no breaches, ~1/3 of companies are clean in the demo
    breach_count = 1 + (h % 2)
    results = []
    data_pool = [
        ["Email addresses", "Passwords"],
        ["Email addresses", "Names", "Phone numbers"],
        ["Email addresses", "Passwords", "Payment details"],
        ["Names", "Physical addresses"],
    ]
    for i in range(breach_count):
        days_ago = 30 + ((h >> (i * 4)) % 900)
        classes = data_pool[(h >> (i * 3)) % len(data_pool)]
        severity = "critical" if "Payment details" in classes else ("high" if "Passwords" in classes else "medium")
        results.append(
            {
                "breach_date": (date.today() - timedelta(days=days_ago)).isoformat(),
                "compromised_data": classes,
                "severity": severity,
                "source": "HaveIBeenPwned (simulated - set HIBP_API_KEY for live data)",
            }
        )
    return results
