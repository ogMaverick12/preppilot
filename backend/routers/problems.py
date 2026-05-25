"""Problems router — browse, filter, and get today's selected problem."""
import json
import re
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.problem import Problem
from backend.models.session import Session
from backend.models.skill import SkillVersion
from backend.models.user import User
from backend.schemas.problem import (
    CustomProblemCreate,
    ProblemResponse,
    ProblemListResponse,
    TodayProblemResponse,
    ProblemRequestCreate,
    ProblemStartCreate,
)
from backend.schemas.session import SessionResponse
from backend.services.problem_service import select_todays_problem

router = APIRouter()


@router.get("/", response_model=ProblemListResponse)
async def list_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all problems with optional filters."""
    query = select(Problem)
    if user_id:
        query = query.where(or_(Problem.owner_user_id.is_(None), Problem.owner_user_id == user_id))
    else:
        query = query.where(Problem.owner_user_id.is_(None))

    if topic:
        query = query.where(Problem.topic == topic)
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Problem.is_custom.desc(), Problem.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    problems = result.scalars().all()

    # Get user scores if user_id provided
    user_scores = {}
    if user_id:
        sessions_result = await db.execute(
            select(Session).where(Session.user_id == user_id)
        )
        for s in sessions_result.scalars().all():
            if s.problem_id not in user_scores or (s.score and s.score > (user_scores[s.problem_id].get("score") or 0)):
                user_scores[s.problem_id] = {"score": s.score, "status": s.status}

    problem_responses = []
    for p in problems:
        user_data = user_scores.get(p.id, {})
        # Apply status filter if specified
        p_status = user_data.get("status", "unseen")
        if status and status != "all" and p_status != status:
            continue

        problem_responses.append(_problem_to_response(p, user_data))

    return ProblemListResponse(
        problems=problem_responses,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/today/{user_id}", response_model=TodayProblemResponse)
async def get_today_problem(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get today's problem selected by Hermes problem_selector skill."""
    # Verify user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await select_todays_problem(user_id, db)
    return result


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: str,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get a single problem by ID."""
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    user_data = {}
    if user_id:
        session_result = await db.execute(
            select(Session).where(
                Session.user_id == user_id,
                Session.problem_id == problem_id,
            )
        )
        sessions = session_result.scalars().all()
        if sessions:
            best = max(sessions, key=lambda s: s.score or 0)
            user_data = {"score": best.score, "status": best.status}

    return _problem_to_response(problem, user_data)


@router.post("/request", response_model=TodayProblemResponse)
async def request_problem(data: ProblemRequestCreate, db: AsyncSession = Depends(get_db)):
    """User requests a problem on a specific topic/difficulty."""
    result = await select_todays_problem(
        data.user_id, db,
        requested_topic=data.topic,
        requested_difficulty=data.difficulty,
    )
    return result


@router.post("/custom", response_model=ProblemResponse)
async def create_custom_problem(data: CustomProblemCreate, db: AsyncSession = Depends(get_db)):
    """Create a private user-owned problem that uses the normal Hermes solve flow."""
    user = await _get_user(data.user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not data.title.strip() or not data.description.strip():
        raise HTTPException(status_code=400, detail="Title and description are required")

    base_slug = _slugify(data.title)
    slug = f"custom-{data.user_id[:8]}-{base_slug}-{int(datetime.utcnow().timestamp())}"
    problem = Problem(
        external_id=f"custom:{data.user_id}:{base_slug}",
        title=data.title.strip(),
        slug=slug,
        difficulty=data.difficulty,
        topic=data.topic,
        sub_topic=data.sub_topic,
        description=data.description.strip(),
        examples=json.dumps(data.examples or []),
        constraints=json.dumps(data.constraints or []),
        hints=json.dumps(data.hints or []),
        solution_approach=None,
        time_complexity=None,
        space_complexity=None,
        source_url=data.source_url,
        tags=json.dumps(data.tags or ["custom"]),
        owner_user_id=data.user_id,
        is_custom=True,
    )
    db.add(problem)
    await db.commit()
    await db.refresh(problem)
    return _problem_to_response(problem, {"status": "unseen"})


@router.post("/{problem_id}/start", response_model=SessionResponse)
async def start_problem_session(
    problem_id: str,
    data: ProblemStartCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create or reuse a user's active solve session for this problem."""
    user = await _get_user(data.user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    problem_result = await db.execute(
        select(Problem).where(
            Problem.id == problem_id,
            or_(Problem.owner_user_id.is_(None), Problem.owner_user_id == data.user_id),
        )
    )
    problem = problem_result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    session_result = await db.execute(
        select(Session)
        .where(
            Session.user_id == data.user_id,
            Session.problem_id == problem_id,
            Session.status == "sent",
        )
        .order_by(Session.created_at.desc())
    )
    session = session_result.scalars().first()
    if not session:
        skill_result = await db.execute(
            select(SkillVersion)
            .where(SkillVersion.skill_name == "problem_selector")
            .order_by(SkillVersion.created_at.desc())
        )
        skill = skill_result.scalars().first()
        session = Session(
            user_id=data.user_id,
            problem_id=problem_id,
            status="sent",
            selected_by_skill_version=skill.version if skill else "1.0",
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    return _session_to_response(session, problem)


# ─── Helpers ────────────────────────────────────────────────────────────────────

def _problem_to_response(p: Problem, user_data: dict = None) -> ProblemResponse:
    user_data = user_data or {}
    return ProblemResponse(
        id=p.id,
        title=p.title,
        slug=p.slug,
        difficulty=p.difficulty,
        topic=p.topic,
        sub_topic=p.sub_topic,
        description=p.description,
        examples=json.loads(p.examples) if p.examples else [],
        constraints=json.loads(p.constraints) if p.constraints else [],
        hints=json.loads(p.hints) if p.hints else [],
        solution_approach=p.solution_approach,
        time_complexity=p.time_complexity,
        space_complexity=p.space_complexity,
        source_url=p.source_url,
        tags=json.loads(p.tags) if p.tags else [],
        owner_user_id=p.owner_user_id,
        is_custom=bool(p.is_custom),
        your_score=user_data.get("score"),
        status=user_data.get("status", "unseen"),
    )


async def _get_user(user_id: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def _session_to_response(session: Session, problem: Problem) -> SessionResponse:
    return SessionResponse(
        id=session.id,
        user_id=session.user_id,
        problem_id=session.problem_id,
        problem_title=problem.title,
        problem_topic=problem.topic,
        problem_difficulty=problem.difficulty,
        user_solution=session.user_solution,
        language=session.language,
        hermes_feedback=session.hermes_feedback,
        score=session.score,
        score_breakdown=None,
        time_taken_minutes=session.time_taken_minutes,
        status=session.status,
        difficulty_felt=session.difficulty_felt,
        explanation_helpful=session.explanation_helpful,
        hints_used=session.hints_used or 0,
        attempt_number=session.attempt_number or 1,
        selected_by_skill_version=session.selected_by_skill_version,
        created_at=session.created_at,
    )


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug[:60] or "problem"
