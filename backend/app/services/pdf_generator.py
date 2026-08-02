"""
PDF Generator
-------------
Renders a Jinja2 HTML template into a legally-formatted deletion request
letter and converts it to PDF with WeasyPrint. Falls back to writing an
.html file (still viewable/printable) if WeasyPrint's native dependencies
(Pango/Cairo) aren't installed on the host, so the API never hard-fails.
"""
from __future__ import annotations

import os
import uuid
from datetime import date, datetime, timedelta

from jinja2 import Environment, FileSystemLoader, select_autoescape

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "generated_pdfs")

os.makedirs(OUTPUT_DIR, exist_ok=True)

_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"]),
)

JURISDICTION_INFO = {
    "GDPR": {
        "legal_basis": "Article 17 of the EU General Data Protection Regulation (GDPR) — the Right to Erasure",
        "legal_text": (
            "Under Article 17 GDPR, data subjects have the right to obtain the erasure of personal data "
            "concerning them without undue delay where the data is no longer necessary for the purposes "
            "for which it was collected, or where the data subject withdraws consent."
        ),
        "response_days": 30,
    },
    "DPDP": {
        "legal_basis": "Section 12 of India's Digital Personal Data Protection (DPDP) Act, 2023",
        "legal_text": (
            "Under Section 12 of the DPDP Act, 2023, a Data Principal has the right to request the erasure "
            "of personal data that is no longer necessary for the purpose for which it was processed, "
            "unless retention is required by law."
        ),
        "response_days": 30,
    },
    "CCPA": {
        "legal_basis": "the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.105 — Right to Delete",
        "legal_text": (
            "Under the CCPA, California consumers have the right to request that a business delete personal "
            "information it has collected from them, subject to certain statutory exceptions."
        ),
        "response_days": 45,
    },
}


def generate_deletion_letter(
    *,
    company_name: str,
    user_name: str,
    user_email: str,
    jurisdiction: str,
    data_categories: list[str],
) -> dict:
    jurisdiction = jurisdiction.upper()
    info = JURISDICTION_INFO.get(jurisdiction, JURISDICTION_INFO["GDPR"])
    request_id = f"IH-{uuid.uuid4().hex[:10].upper()}"
    today = date.today()
    deadline = today + timedelta(days=info["response_days"])

    template = _env.get_template("deletion_request.html")
    html_content = template.render(
        company_name=company_name,
        user_name=user_name,
        user_email=user_email,
        jurisdiction=jurisdiction,
        request_id=request_id,
        today=today.strftime("%B %d, %Y"),
        deadline=deadline.strftime("%B %d, %Y"),
        legal_basis=info["legal_basis"],
        legal_text=info["legal_text"],
        response_days=info["response_days"],
        data_categories=", ".join(data_categories) if data_categories else "all personal data on file",
    )

    filename_base = f"{request_id}_{company_name.replace(' ', '_')}"
    pdf_path = os.path.join(OUTPUT_DIR, f"{filename_base}.pdf")

    try:
        from weasyprint import HTML  # heavy native dependency; imported lazily

        HTML(string=html_content).write_pdf(pdf_path)
        final_path = pdf_path
    except Exception:
        # Native deps (Pango/Cairo) missing on this host — ship the HTML letter
        # instead so generation never blocks the demo; PDF works once deps are installed.
        html_path = os.path.join(OUTPUT_DIR, f"{filename_base}.html")
        with open(html_path, "w") as f:
            f.write(html_content)
        final_path = html_path

    return {
        "request_id": request_id,
        "deadline": datetime.combine(deadline, datetime.min.time()),
        "file_path": final_path,
    }
