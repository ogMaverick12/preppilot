"""Session schemas — request/response models for session endpoints."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    """Breakdown of the 0-100 score across four dimensions."""
    correctness: int = Field(0, ge=0, le=40)
    complexity: int = Field(0, ge=0, le=30)
    edge_cases: int = Field(0, ge=0, le=20)
    style: int = Field(0, ge=0, le=10)


class SessionCreate(BaseModel):
    """POST /api/v1/sessions/ — create a new session (problem sent to user)."""
    user_id: str
    problem_id: str
    selected_by_skill_version: Optional[str] = None


class SessionSubmit(BaseModel):
    """POST /api/v1/sessions/{session_id}/submit — user submits their solution."""
    user_solution: str
    language: str = "python"
    time_taken_minutes: Optional[int] = None


class SessionFeedback(BaseModel):
    """PATCH /api/v1/sessions/{session_id}/feedback — rate explanation helpfulness."""
    explanation_helpful: int = Field(..., ge=1, le=5)
    difficulty_felt: Optional[str] = Field(None, pattern=r"^(too_easy|right|too_hard)$")


class SessionResponse(BaseModel):
    """Full session detail with Hermes feedback."""
    id: str
    user_id: str
    problem_id: str
    problem_title: Optional[str] = None
    problem_topic: Optional[str] = None
    problem_difficulty: Optional[str] = None
    user_solution: Optional[str] = None
    language: Optional[str] = None
    hermes_feedback: Optional[str] = None
    score: Optional[int] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    time_taken_minutes: Optional[int] = None
    status: str = "sent"
    difficulty_felt: Optional[str] = None
    explanation_helpful: Optional[int] = None
    hints_used: int = 0
    attempt_number: int = 1
    selected_by_skill_version: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    """Paginated list of sessions."""
    sessions: list[SessionResponse]
    total: int
    page: int = 1
    per_page: int = 20
