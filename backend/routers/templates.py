import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from routers.auth import current_user_id
from templates import TEMPLATES

router = APIRouter()

TEMPLATE_DIR = Path(os.environ.get("TEMPLATE_DIR", "/app/template"))


@router.get("/templates")
def list_templates(_user_id: int = Depends(current_user_id)):
    return [
        {"id": tid, "label": t["label"], "supported": t.get("supported", False)}
        for tid, t in TEMPLATES.items()
    ]


@router.get("/templates/{template_id}/standard-terms", response_class=PlainTextResponse)
def get_standard_terms(template_id: str, _user_id: int = Depends(current_user_id)):
    t = TEMPLATES.get(template_id)
    if not t or not t.get("supported"):
        raise HTTPException(status_code=404, detail="Template not supported")
    # standard_terms_file is "template/<dir>/<file>"; strip the "template/" prefix
    # since TEMPLATE_DIR already points to the template directory.
    rel = t["standard_terms_file"].removeprefix("template/")
    path = TEMPLATE_DIR / rel
    if not path.exists():
        raise HTTPException(status_code=500, detail="Template file missing")
    return path.read_text()
