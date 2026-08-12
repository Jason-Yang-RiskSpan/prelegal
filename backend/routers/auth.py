import os
import sqlite3
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
import bcrypt
import jwt
import db

router = APIRouter()

_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
_ALGORITHM = "HS256"
_TOKEN_TTL_HOURS = 24

_bearer = HTTPBearer(auto_error=True)


def current_user_id(creds: HTTPAuthorizationCredentials = Depends(_bearer)) -> int:
    try:
        payload = jwt.decode(creds.credentials, _SECRET, algorithms=[_ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class Credentials(BaseModel):
    email: str
    password: str


def _make_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=_TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)


@router.post("/signup")
def signup(creds: Credentials):
    hashed = bcrypt.hashpw(creds.password.encode(), bcrypt.gensalt()).decode()
    try:
        with db.get_conn() as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password) VALUES (?, ?)",
                (creds.email, hashed),
            )
            return {"token": _make_token(cursor.lastrowid)}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already registered")


@router.post("/signin")
def signin(creds: Credentials):
    with db.get_conn() as conn:
        row = conn.execute(
            "SELECT id, password FROM users WHERE email = ?", (creds.email,)
        ).fetchone()
    if not row or not bcrypt.checkpw(creds.password.encode(), row["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": _make_token(row["id"])}
