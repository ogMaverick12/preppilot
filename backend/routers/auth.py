"""Local email/password auth endpoints for PrepPilot."""
import hashlib
import hmac
import json
import os
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.schemas.auth import RegisterRequest, VerifyPasswordRequest
from backend.schemas.user import UserResponse

router = APIRouter()

PBKDF2_ITERATIONS = 210_000


@router.post("/register", response_model=UserResponse)
async def register_local_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a local email/password user stored in the configured backend DB."""
    email = _normalize_email(data.email)
    if not _looks_like_email(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address")

    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing and existing.password_hash:
        raise HTTPException(status_code=409, detail="Email is already registered")

    password_salt, password_hash = _hash_password(data.password)
    if existing:
        user = existing
        user.auth_provider = user.auth_provider or "local"
        user.password_salt = password_salt
        user.password_hash = password_hash
        user.display_name = data.display_name
    else:
        user = User(
            auth_provider="local",
            email=email,
            display_name=data.display_name,
            password_salt=password_salt,
            password_hash=password_hash,
            telegram_id=f"local_{uuid4().hex}",
            telegram_username=email.split("@", 1)[0],
            developer_role=data.developer_role,
            primary_stack=data.primary_stack,
            target_track=data.target_track,
            experience_level=data.experience_level,
            timezone=data.timezone,
            explanation_style="balanced",
            target_companies=json.dumps([]),
            weak_areas=json.dumps([]),
            onboarding_complete=True,
            assessment_status="required",
            assessment_completed_sessions=0,
            hermes_level="uncalibrated",
        )
        db.add(user)

    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return _user_to_response(user)


@router.post("/verify-password", response_model=UserResponse)
async def verify_password(data: VerifyPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Verify a local email/password login and return the PrepPilot user."""
    email = _normalize_email(data.email)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not user.password_salt:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not _verify_password(data.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _user_to_response(user)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _looks_like_email(email: str) -> bool:
    return "@" in email and "." in email.rsplit("@", 1)[-1]


def _hash_password(password: str) -> tuple[str, str]:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        PBKDF2_ITERATIONS,
    ).hex()
    return salt, digest


def _verify_password(password: str, salt: str, expected_hash: str) -> bool:
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        PBKDF2_ITERATIONS,
    ).hex()
    return hmac.compare_digest(digest, expected_hash)


def _user_to_response(user: User) -> UserResponse:
    notif_prefs = None
    if user.notification_preferences:
        try:
            notif_prefs = json.loads(user.notification_preferences) if isinstance(user.notification_preferences, str) else user.notification_preferences
        except (json.JSONDecodeError, TypeError):
            notif_prefs = {"daily_problems": True, "weekly_reports": True, "streak_alerts": True}

    return UserResponse(
        id=user.id,
        auth_provider=user.auth_provider or "local",
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        telegram_id=user.telegram_id or "",
        telegram_username=user.telegram_username,
        experience_level=user.experience_level,
        target_companies=json.loads(user.target_companies) if user.target_companies else [],
        weak_areas=json.loads(user.weak_areas) if user.weak_areas else [],
        daily_time_budget=user.daily_time_budget,
        preferred_time=user.preferred_time,
        timezone=user.timezone,
        explanation_style=user.explanation_style,
        notification_preferences=notif_prefs,
        developer_role=user.developer_role or "student",
        primary_stack=user.primary_stack or "python",
        target_track=user.target_track or "interviews",
        assessment_status=user.assessment_status or "required",
        assessment_completed_sessions=user.assessment_completed_sessions or 0,
        hermes_level=user.hermes_level or "uncalibrated",
        onboarding_complete=user.onboarding_complete,
        created_at=user.created_at,
    )
