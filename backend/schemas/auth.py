"""Auth schemas for local email/password mode."""
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=6, max_length=256)
    display_name: str = Field(..., min_length=1, max_length=120)
    developer_role: str = "student"
    primary_stack: str = "python"
    target_track: str = "interviews"
    experience_level: str = "intermediate"
    timezone: str = "UTC"


class VerifyPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=1, max_length=256)
