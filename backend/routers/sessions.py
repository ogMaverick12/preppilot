"""Sessions router — create, submit solutions, rate feedback."""
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.session import Session
from backend.models.problem import Problem
from backend.schemas.session import (
    SessionCreate, SessionSubmit, SessionFeedback,
    SessionResponse, SessionListResponse, ScoreBreakdown,
)
from backend.services.submission_service import (
    get_active_session,
    record_feedback_and_evolve,
    submit_solution_to_hermes,
)

router = APIRouter()


@router.post("/", response_model=SessionResponse)
async def create_session(data: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new session (problem sent to user)."""
    session = Session(
        user_id=data.user_id,
        problem_id=data.problem_id,
        status="sent",
        selected_by_skill_version=data.selected_by_skill_version,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return await _session_to_response(session, db)


@router.get("/{user_id}", response_model=SessionListResponse)
async def list_sessions(
    user_id: str,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get session history for a user."""
    query = select(Session).where(Session.user_id == user_id)

    # Join filter by problem attributes if needed
    if topic or difficulty:
        query = query.join(Problem, Session.problem_id == Problem.id)
        if topic:
            query = query.where(Problem.topic == topic)
        if difficulty:
            query = query.where(Problem.difficulty == difficulty)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Order and paginate
    query = query.order_by(Session.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    sessions = result.scalars().all()

    responses = [await _session_to_response(s, db) for s in sessions]

    return SessionListResponse(sessions=responses, total=total, page=page, per_page=per_page)


@router.get("/active/{user_id}", response_model=SessionResponse)
async def get_active_user_session(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get the latest unresolved PrepPilot session for a user."""
    session = await get_active_session(user_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="No active PrepPilot session")
    return await _session_to_response(session, db)


@router.post("/{session_id}/submit", response_model=SessionResponse)
async def submit_solution(
    session_id: str,
    data: SessionSubmit,
    db: AsyncSession = Depends(get_db),
):
    """Submit a solution — triggers Hermes review."""
    session = await _get_session_or_404(session_id, db)

    try:
        await submit_solution_to_hermes(
            session=session,
            user_solution=data.user_solution,
            language=data.language,
            time_taken_minutes=data.time_taken_minutes,
            db=db,
            source="dashboard",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return await _session_to_response(session, db)


@router.patch("/{session_id}/feedback", response_model=SessionResponse)
async def rate_feedback(
    session_id: str,
    data: SessionFeedback,
    db: AsyncSession = Depends(get_db),
):
    """Rate how helpful the explanation was (1-5)."""
    session = await _get_session_or_404(session_id, db)
    await record_feedback_and_evolve(
        session=session,
        explanation_helpful=data.explanation_helpful,
        difficulty_felt=data.difficulty_felt,
        db=db,
    )
    return await _session_to_response(session, db)


@router.get("/detail/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get full session detail with feedback."""
    session = await _get_session_or_404(session_id, db)
    return await _session_to_response(session, db)


# ─── Helpers ────────────────────────────────────────────────────────────────────

async def _get_session_or_404(session_id: str, db: AsyncSession) -> Session:
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


async def _session_to_response(s: Session, db: AsyncSession) -> SessionResponse:
    # Get problem info
    problem_result = await db.execute(select(Problem).where(Problem.id == s.problem_id))
    problem = problem_result.scalar_one_or_none()

    breakdown = None
    if s.score_breakdown:
        try:
            bd = json.loads(s.score_breakdown)
            breakdown = ScoreBreakdown(**bd)
        except (json.JSONDecodeError, ValueError):
            pass

    return SessionResponse(
        id=s.id,
        user_id=s.user_id,
        problem_id=s.problem_id,
        problem_title=problem.title if problem else None,
        problem_topic=problem.topic if problem else None,
        problem_difficulty=problem.difficulty if problem else None,
        user_solution=s.user_solution,
        language=s.language,
        hermes_feedback=s.hermes_feedback,
        score=s.score,
        score_breakdown=breakdown,
        time_taken_minutes=s.time_taken_minutes,
        status=s.status,
        difficulty_felt=s.difficulty_felt,
        explanation_helpful=s.explanation_helpful,
        hints_used=s.hints_used or 0,
        attempt_number=s.attempt_number or 1,
        selected_by_skill_version=s.selected_by_skill_version,
        created_at=s.created_at,
    )
