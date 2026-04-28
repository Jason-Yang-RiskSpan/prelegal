import json
import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "cerebras/gpt-oss-120b"


class GenerateRequest(BaseModel):
    party1Name: str = ""
    party1Title: str = ""
    party1Company: str = ""
    party1Email: str = ""
    party2Name: str = ""
    party2Title: str = ""
    party2Company: str = ""
    party2Email: str = ""
    purpose: str = ""
    effectiveDate: str = ""
    mndaTermYears: str = "1"
    termOfConfidentialityYears: str = "1"
    governingLaw: str = ""
    jurisdiction: str = ""
    modifications: str = ""


@router.post("/generate")
async def generate(req: GenerateRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    prompt = f"""You are a legal document assistant. Format the following inputs into properly worded cover page fields for a Mutual NDA. Return only valid JSON with these exact keys: purpose, effectiveDate, mndaTermYears, termOfConfidentialityYears, governingLaw, jurisdiction.

Inputs:
- Purpose: {req.purpose}
- Effective Date: {req.effectiveDate}
- MNDA Term: {req.mndaTermYears} year(s)
- Confidentiality Term: {req.termOfConfidentialityYears} year(s)
- Governing Law: {req.governingLaw}
- Jurisdiction: {req.jurisdiction}

Rules:
- purpose: one clear sentence describing how Confidential Information may be used
- effectiveDate: formatted as Month D, YYYY (e.g. April 27, 2026)
- mndaTermYears and termOfConfidentialityYears: return as string numbers
- governingLaw: state name only (e.g. "California")
- jurisdiction: city and state (e.g. "San Francisco, California")"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="LLM request failed")

    content = response.json()["choices"][0]["message"]["content"]
    return json.loads(content)
