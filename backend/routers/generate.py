from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str


@router.post("/generate")
def generate(req: GenerateRequest):
    # LLM integration wired in a future ticket
    return {"document": ""}
