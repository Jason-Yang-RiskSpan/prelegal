"""Template registry for legal document generation.

SUPPORTED templates have working cover-page builders and full chat flows.
LISTED-ONLY templates are advertised by the LLM (so it can recommend the
closest match for out-of-scope requests) but cannot yet be generated.
"""

PARTY_FIELDS = [
    {"key": "party1Name", "label": "Party 1 full name", "required": True},
    {"key": "party1Title", "label": "Party 1 title", "required": True},
    {"key": "party1Company", "label": "Party 1 company", "required": True},
    {"key": "party1Email", "label": "Party 1 email", "required": True},
    {"key": "party2Name", "label": "Party 2 full name", "required": True},
    {"key": "party2Title", "label": "Party 2 title", "required": True},
    {"key": "party2Company", "label": "Party 2 company", "required": True},
    {"key": "party2Email", "label": "Party 2 email", "required": True},
]


TEMPLATES = {
    "mutual-nda": {
        "label": "Mutual NDA",
        "aliases": ["nda", "mutual nda", "non-disclosure", "confidentiality agreement"],
        "supported": True,
        "standard_terms_file": "template/Mutual-NDA/Mutual-NDA.md",
        "fields": PARTY_FIELDS + [
            {"key": "purpose", "label": "Purpose (one sentence describing how Confidential Information may be used)", "required": True},
            {"key": "effectiveDate", "label": "Effective date (YYYY-MM-DD)", "required": True},
            {"key": "mndaTermYears", "label": "MNDA term in years", "required": True},
            {"key": "termOfConfidentialityYears", "label": "Confidentiality term in years", "required": True},
            {"key": "governingLaw", "label": "Governing law (state name)", "required": True},
            {"key": "jurisdiction", "label": "Jurisdiction (city, state)", "required": True},
        ],
    },
    "csa": {
        "label": "Cloud Service Agreement",
        "aliases": ["cloud service", "saas agreement", "cloud agreement"],
        "supported": True,
        "standard_terms_file": "template/CSA/CSA.md",
        "fields": PARTY_FIELDS + [
            {"key": "providerCompany", "label": "Provider (vendor) company name", "required": True},
            {"key": "customerCompany", "label": "Customer company name", "required": True},
            {"key": "productDescription", "label": "Product/service description", "required": True},
            {"key": "subscriptionPeriod", "label": "Subscription period (e.g. '12 months')", "required": True},
            {"key": "fees", "label": "Fees (amount and frequency)", "required": True},
            {"key": "effectiveDate", "label": "Effective date (YYYY-MM-DD)", "required": True},
            {"key": "governingLaw", "label": "Governing law (state name)", "required": True},
            {"key": "jurisdiction", "label": "Jurisdiction (city, state)", "required": True},
        ],
    },
    "psa": {
        "label": "Professional Services Agreement",
        "aliases": ["psa", "professional services", "consulting agreement", "services agreement"],
        "supported": True,
        "standard_terms_file": "template/PSA/psa.md",
        "fields": PARTY_FIELDS + [
            {"key": "providerCompany", "label": "Provider company name", "required": True},
            {"key": "customerCompany", "label": "Customer company name", "required": True},
            {"key": "servicesDescription", "label": "Description of services to be provided", "required": True},
            {"key": "fees", "label": "Fees (amount and structure)", "required": True},
            {"key": "effectiveDate", "label": "Effective date (YYYY-MM-DD)", "required": True},
            {"key": "governingLaw", "label": "Governing law (state name)", "required": True},
            {"key": "jurisdiction", "label": "Jurisdiction (city, state)", "required": True},
        ],
    },
    # Listed for recommendation only — generation not wired up yet.
    "sla": {"label": "Service Level Agreement", "aliases": ["sla", "uptime"], "supported": False},
    "dpa": {"label": "Data Processing Agreement", "aliases": ["dpa", "data processing", "gdpr"], "supported": False},
    "design-partner": {"label": "Design Partner Agreement", "aliases": ["design partner", "early access"], "supported": False},
    "partnership": {"label": "Partnership Agreement", "aliases": ["partnership"], "supported": False},
    "baa": {"label": "Business Associate Agreement", "aliases": ["baa", "hipaa"], "supported": False},
    "software-license": {"label": "Software License Agreement", "aliases": ["software license", "license"], "supported": False},
    "pilot": {"label": "Pilot Agreement", "aliases": ["pilot", "trial agreement"], "supported": False},
    "ai-addendum": {"label": "AI Addendum", "aliases": ["ai addendum"], "supported": False},
}


def supported_ids() -> list[str]:
    return [tid for tid, t in TEMPLATES.items() if t.get("supported")]


def template_summary() -> str:
    """Compact list for the LLM system prompt."""
    lines = []
    for tid, t in TEMPLATES.items():
        status = "supported" if t.get("supported") else "listed-only"
        lines.append(f"- {tid} ({t['label']}, {status}; aliases: {', '.join(t['aliases'])})")
    return "\n".join(lines)


def field_keys(template_id: str) -> set[str]:
    t = TEMPLATES.get(template_id)
    if not t or "fields" not in t:
        return set()
    return {f["key"] for f in t["fields"]}


def fields_for_prompt(template_id: str) -> str:
    t = TEMPLATES.get(template_id)
    if not t or "fields" not in t:
        return ""
    return "\n".join(f"- {f['key']}: {f['label']}" for f in t["fields"])


def all_supported_field_schemas() -> str:
    """Compact per-template field schemas for the LLM to extract during template selection."""
    out = []
    for tid, t in TEMPLATES.items():
        if not t.get("supported"):
            continue
        out.append(f"\n[{tid}] field keys:")
        for f in t["fields"]:
            out.append(f"  {f['key']}: {f['label']}")
    return "\n".join(out)
