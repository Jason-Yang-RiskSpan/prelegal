import json
import os
import httpx
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from routers.auth import current_user_id
from templates import TEMPLATES, supported_ids, template_summary, field_keys, fields_for_prompt, all_supported_field_schemas

router = APIRouter()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"
PROVIDER = {"order": ["cerebras"], "allow_fallbacks": False}


def _system_prompt(template_id: Optional[str], filled: dict) -> str:
    base = (
        "You are a legal document assistant. You help users generate legal agreements "
        "from a fixed catalog of templates. Be concise and conversational. Ask one or two "
        "focused follow-on questions per turn — never dump the whole field list at once.\n\n"
        "Available templates:\n"
        f"{template_summary()}\n\n"
        "Out-of-scope rule: if the user asks for a legal document type that is NOT in the "
        "catalog (e.g. employment contract, lease), do not refuse outright. Tell them we "
        "don't have that exact template, recommend the single closest one from the list, "
        "and ask if they want to proceed with that. Never invent templates we don't have.\n\n"
        "Always respond with valid JSON containing exactly these keys:\n"
        '- "reply": your conversational response\n'
        '- "templateId": the chosen template id from the catalog. Set this AS SOON AS the '
        "user's intent matches a supported template (e.g. they say 'NDA' or 'mutual NDA' "
        "→ set templateId to 'mutual-nda' immediately; do not wait for further confirmation). "
        'Only use null when the user has not yet expressed which document they want, or when '
        'recommending an alternative for an out-of-scope request that they have not yet '
        'accepted.\n'
        '- "fields": object of confirmed field values for the chosen template. Always extract '
        'every value the user has provided in the conversation so far, even on the same turn '
        "you set templateId. Omit unknown fields; never include keys that are not in the "
        "template's field list."
        "\n\nField schemas for all supported templates (use these keys exactly):"
        f"{all_supported_field_schemas()}"
    )
    if template_id and template_id in TEMPLATES and TEMPLATES[template_id].get("supported"):
        t = TEMPLATES[template_id]
        base += (
            f"\n\nThe user has chosen: {t['label']} ({template_id}). Gather the following fields "
            f"through natural conversation, asking one or two at a time:\n"
            f"{fields_for_prompt(template_id)}"
        )
        if filled:
            base += f"\n\nFields already known: {json.dumps(filled)}"
    return base


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    templateId: Optional[str] = None
    form: dict = {}


@router.post("/chat")
async def chat(req: ChatRequest, _user_id: int = Depends(current_user_id)):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    valid_keys = field_keys(req.templateId) if req.templateId else set()
    filled = {k: v for k, v in req.form.items() if k in valid_keys and v}

    messages = [{"role": "system", "content": _system_prompt(req.templateId, filled)}]
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
                "provider": PROVIDER,
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

    template_id = parsed.get("templateId") or req.templateId
    if template_id and (template_id not in TEMPLATES or not TEMPLATES[template_id].get("supported")):
        template_id = None

    fields = parsed.get("fields", {})
    if isinstance(fields, dict) and template_id:
        allowed = field_keys(template_id)
        fields = {k: v for k, v in fields.items() if k in allowed}
    else:
        fields = {}

    return {
        "reply": parsed.get("reply", ""),
        "templateId": template_id,
        "fields": fields,
    }
