"""User schemas — request/response models for user endpoints."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """POST /api/v1/users/onboard — create user from onboarding."""
    # Auth provider
    auth_provider: str = "telegram"  # telegram | github | google | demo | local
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    # Telegram fields (optional for OAuth)
    telegram_id: Optional[str] = None
    telegram_username: Optional[str] = None
    # Coaching preferences
    experience_level: str = Field("intermediate", pattern=r"^(beginner|intermediate|advanced)$")
    target_companies: Optional[list[str]] = None
    weak_areas: Optional[list[str]] = None
    daily_time_budget: int = 60
    preferred_time: str = "08:00"
    timezone: str = "UTC"
    explanation_style: str = "balanced"
    developer_role: str = "student"
    primary_stack: str = "python"
    target_track: str = "interviews"


class UserUpdate(BaseModel):
    """PATCH /api/v1/users/{user_id} — update user preferences."""
    display_name: Optional[str] = None
    experience_level: Optional[str] = None
    target_companies: Optional[list[str]] = None
    weak_areas: Optional[list[str]] = None
    daily_time_budget: Optional[int] = None
    preferred_time: Optional[str] = None
    timezone: Optional[str] = None
    explanation_style: Optional[str] = None
    notification_preferences: Optional[dict] = None
    developer_role: Optional[str] = None
    primary_stack: Optional[str] = None
    target_track: Optional[str] = None


class UserResponse(BaseModel):
    """Full user profile response."""
    id: str
    auth_provider: str = "telegram"
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    telegram_id: Optional[str] = None
    telegram_username: Optional[str] = None
    experience_level: str
    target_companies: list[str] = []
    weak_areas: list[str] = []
    daily_time_budget: int
    preferred_time: str
    timezone: str
    explanation_style: str
    notification_preferences: Optional[dict] = None
    developer_role: str = "student"
    primary_stack: str = "python"
    target_track: str = "interviews"
    assessment_status: str = "required"
    assessment_completed_sessions: int = 0
    hermes_level: str = "uncalibrated"
    onboarding_complete: bool
    streak: int = 0
    longest_streak: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class UserStatsResponse(BaseModel):
    """GET /api/v1/users/{user_id}/stats — aggregated user statistics."""
    total_sessions: int = 0
    total_solved: int = 0
    total_attempted: int = 0
    total_skipped: int = 0
    average_score: float = 0.0
    best_score: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    improvement_since_start: float = 0.0
    best_topic: Optional[str] = None
    weakest_topic: Optional[str] = None
    problems_this_week: int = 0
    avg_score_this_week: float = 0.0
