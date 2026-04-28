import json
import os
import httpx
from typing import Literal
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"

VALID_FIELDS = {
    "party1Name", "party1Title", "party1Company", "party1Email",
    "party2Name", "party2Title", "party2Company", "party2Email",
    "purpose", "effectiveDate", "mndaTermYears",
    "termOfConfidentialityYears", "governingLaw", "jurisdiction", "modifications",
}

SYSTEM_PROMPT = """You are a legal document assistant helping create a Mutual NDA. Gather all required information through natural conversation.

Fields to collect:
- party1Name, party1Title, party1Company, party1Email (Party 1 details)
- party2Name, party2Title, party2Company, party2Email (Party 2 details)
- purpose: one sentence describing how Confidential Information may be used
- effectiveDate: in YYYY-MM-DD format
- mndaTermYears: string number (e.g. "2")
- termOfConfidentialityYears: string number (e.g. "3")
- governingLaw: state name only (e.g. "California")
- jurisdiction: city and state (e.g. "San Francisco, California")
- modifications: any changes to standard terms (empty string if none)

Always respond with valid JSON containing exactly two keys:
- "reply": your conversational response to the user
- "fields": object with any NdaFormData field keys you have confirmed values for (omit fields you don't know yet)"""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    form: dict = {}


@router.post("/chat")
async def chat(req: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    filled = {k: v for k, v in req.form.items() if k in VALID_FIELDS and v}
    system = SYSTEM_PROMPT
    if filled:
        system += f"\n\nFields already known: {json.dumps(filled)}"

    messages = [{"role": "system", "content": system}]
    for msg in req.messages:
        messages.append({"role": msg.role, "content": msg.content})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "response_format": {"type": "json_object"},
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="LLM request failed")

    content = response.json()["choices"][0]["message"]["content"]
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="LLM returned invalid JSON")

    if "fields" in parsed and isinstance(parsed["fields"], dict):
        parsed["fields"] = {k: v for k, v in parsed["fields"].items() if k in VALID_FIELDS}

    return {
        "reply": parsed.get("reply", ""),
        "fields": parsed.get("fields", {}),
    }
