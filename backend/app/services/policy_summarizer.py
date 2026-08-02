"""
AI Privacy Policy Summarizer
----------------------------
Reads a privacy policy (raw text, fetched from a URL by the caller) and
returns a structured, human-readable summary.

Two backends are supported:
  1. OPENAI_API_KEY set -> calls an OpenAI-compatible chat completion API
     and asks for structured JSON output (best quality summaries).
  2. No key -> falls back to a local HuggingFace `transformers` summarization
     pipeline (SUMMARIZATION_MODEL, default facebook/bart-large-cnn) plus a
     lightweight keyword/heuristic extractor for the structured fields.

Both paths return the same shape so the API layer doesn't care which one ran.
"""
from __future__ import annotations

import json
import re

import httpx

from app.core.config import settings

RIGHTS_KEYWORDS = {
    "access": "Right to access your data",
    "delet": "Right to request deletion",
    "portab": "Right to data portability",
    "rectif": "Right to correct inaccurate data",
    "object": "Right to object to processing",
    "opt-out": "Right to opt out of sale/sharing",
    "restrict": "Right to restrict processing",
}


async def summarize_policy(raw_text: str) -> dict:
    raw_text = (raw_text or "").strip()
    if not raw_text:
        return _empty_summary()

    if settings.OPENAI_API_KEY:
        try:
            return await _summarize_with_llm(raw_text)
        except Exception:
            pass  # fall through to local heuristic summarizer

    return _summarize_locally(raw_text)


async def _summarize_with_llm(raw_text: str) -> dict:
    prompt = (
        "You are a privacy analyst. Read the privacy policy text below and return ONLY "
        "valid JSON (no markdown fences) with keys: summary (2-3 plain-language sentences), "
        "collected_data (list of strings), retention (one sentence), third_party_sharing "
        "(one sentence), user_rights (list of strings), risk_level (one of 'low','medium','high').\n\n"
        f"POLICY TEXT:\n{raw_text[:6000]}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        content = re.sub(r"^```json|```$", "", content.strip()).strip()
        data = json.loads(content)

    return {
        "ai_summary": data.get("summary", ""),
        "collected_data_summary": data.get("collected_data", []),
        "retention_summary": data.get("retention", ""),
        "third_party_sharing_summary": data.get("third_party_sharing", ""),
        "user_rights_summary": data.get("user_rights", []),
        "risk_level": data.get("risk_level", "medium"),
    }


_hf_pipeline = None


def _get_hf_pipeline():
    global _hf_pipeline
    if _hf_pipeline is None:
        from transformers import pipeline  # imported lazily; heavy dependency

        _hf_pipeline = pipeline("summarization", model=settings.SUMMARIZATION_MODEL)
    return _hf_pipeline


def _summarize_locally(raw_text: str) -> dict:
    try:
        summarizer = _get_hf_pipeline()
        chunk = raw_text[:4000]
        result = summarizer(chunk, max_length=120, min_length=30, do_sample=False)
        summary = result[0]["summary_text"]
    except Exception:
        # transformers not installed / model not downloaded / offline env:
        # fall back to a naive extractive summary so the feature still works.
        sentences = re.split(r"(?<=[.!?])\s+", raw_text)
        summary = " ".join(sentences[:3])[:500]

    lower = raw_text.lower()

    data_terms = {
        "email": "Email address",
        "phone": "Phone number",
        "address": "Physical address",
        "location": "Location data",
        "payment": "Payment details",
        "cookie": "Cookies & tracking identifiers",
        "biometric": "Biometric data",
        "ip address": "IP address",
    }
    collected = [label for term, label in data_terms.items() if term in lower]

    third_party = (
        "This policy indicates data may be shared with third parties or partners."
        if "third part" in lower or "partner" in lower
        else "No explicit third-party sharing language was found."
    )

    retention_match = re.search(r"(?:retain|store)[^.]{0,120}?\b(\d+\s*(?:day|month|year)s?)", lower)
    retention = (
        f"Data appears to be retained for {retention_match.group(1)}."
        if retention_match
        else "Retention period is not clearly specified."
    )

    rights = [label for kw, label in RIGHTS_KEYWORDS.items() if kw in lower]
    if not rights:
        rights = ["No explicit user rights were detected in this text."]

    risk_level = "high" if ("third part" in lower and not rights) else ("low" if len(rights) >= 3 else "medium")

    return {
        "ai_summary": summary,
        "collected_data_summary": collected or ["Not explicitly specified"],
        "retention_summary": retention,
        "third_party_sharing_summary": third_party,
        "user_rights_summary": rights,
        "risk_level": risk_level,
    }


def _empty_summary() -> dict:
    return {
        "ai_summary": "No policy text was provided to analyze.",
        "collected_data_summary": [],
        "retention_summary": None,
        "third_party_sharing_summary": None,
        "user_rights_summary": [],
        "risk_level": "medium",
    }
