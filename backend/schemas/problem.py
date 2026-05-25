"""Problem schemas — request/response models for problem endpoints."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProblemResponse(BaseModel):
    """Single problem detail."""
    id: str
    title: str
    slug: str
    difficulty: str
    topic: str
    sub_topic: Optional[str] = None
    description: str
    examples: list[dict] = []
    constraints: list[str] = []
    hints: list[str] = []
    solution_approach: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    source_url: Optional[str] = None
    tags: list[str] = []
    owner_user_id: Optional[str] = None
    is_custom: bool = False
    # User-specific fields (populated per request)
    your_score: Optional[int] = None
    status: str = "unseen"  # unseen | attempted | solved
    estimated_minutes: str = "30"

    model_config = {"from_attributes": True}


class ProblemListResponse(BaseModel):
    """Paginated list of problems."""
    problems: list[ProblemResponse]
    total: int
    page: int = 1
    per_page: int = 20


class TodayProblemResponse(BaseModel):
    """GET /api/v1/problems/today/{user_id} — today's selected problem."""
    id: str
    title: str
    slug: str
    difficulty: str
    topic: str
    sub_topic: Optional[str] = None
    description: str
    estimated_minutes: str
    selection_reason: str
    sent_at: Optional[str] = None
    selected_by_skill_version: Optional[str] = None
    hints: list[str] = []


class ProblemRequestCreate(BaseModel):
    """POST /api/v1/problems/request — user requests a specific topic."""
    user_id: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None


class ProblemStartCreate(BaseModel):
    """POST /api/v1/problems/{problem_id}/start — start or reuse a solve session."""
    user_id: str


class CustomProblemCreate(BaseModel):
    """POST /api/v1/problems/custom — create a private user problem."""
    user_id: str
    title: str
    difficulty: str = "medium"
    topic: str = "custom"
    sub_topic: Optional[str] = None
    description: str
    examples: list[dict] = []
    constraints: list[str] = []
    hints: list[str] = []
    source_url: Optional[str] = None
    tags: list[str] = []
