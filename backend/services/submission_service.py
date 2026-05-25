"""Shared solution submission and feedback pipeline for PrepPilot."""
import json
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.problem import Problem
from backend.models.session import Session
from backend.models.skill import SkillVersion
from backend.models.user import User
from backend.services import hermes_agent
from backend.services.coaching_service import update_coaching_profile, update_topic_stats
from backend.services.review_service import review_solution


async def get_active_session(user_id: str, db: AsyncSession) -> Optional[Session]:
    """Return the latest unresolved PrepPilot session for a user."""
    result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id, Session.status == "sent")
        .order_by(Session.created_at.desc())
    )
    return result.scalars().first()


async def submit_solution_to_hermes(
    session: Session,
    user_solution: str,
    language: str,
    db: AsyncSession,
    time_taken_minutes: Optional[int] = None,
    source: str = "dashboard",
) -> dict:
    """Review and persist a submitted solution through the PrepPilot Hermes layer."""
    if session.status not in ("sent", "attempted", "solved"):
        raise ValueError("Session already resolved")

    if session.user_solution:
        session.attempt_number = (session.attempt_number or 1) + 1

    session.user_solution = user_solution
    session.language = language or "python"
    session.time_taken_minutes = time_taken_minutes
    session.explanation_helpful = None
    session.difficulty_felt = None

    user = await _get_user(session.user_id, db)
    if user and user.auth_provider == "demo":
        review_result = await _demo_review(session, db, source)
    else:
        review_result = await review_solution(session, db)

    session.hermes_feedback = review_result["feedback"]
    session.score = review_result["score"]
    session.score_breakdown = json.dumps(review_result["breakdown"])
    session.status = "solved" if review_result["score"] >= 70 else "attempted"

    await db.commit()
    await db.refresh(session)

    await update_topic_stats(session.user_id, session, db)
    await update_coaching_profile(session.user_id, session, db)
    await _update_assessment_progress(session.user_id, db)

    return review_result


async def record_feedback_and_evolve(
    session: Session,
    explanation_helpful: int,
    db: AsyncSession,
    difficulty_felt: Optional[str] = None,
) -> list[str]:
    """Persist helpfulness feedback, update the user model, and evolve skills if due."""
    session.explanation_helpful = explanation_helpful
    if difficulty_felt:
        session.difficulty_felt = difficulty_felt
    await db.commit()
    await db.refresh(session)

    await update_coaching_profile(session.user_id, session, db)

    user = await _get_user(session.user_id, db)
    if user and user.auth_provider == "demo":
        improved = await _ensure_demo_skill_update(session.user_id, db)
        return ["solution_reviewer"] if improved else []

    return await hermes_agent.check_and_improve(session.user_id, db)


async def _get_user(user_id: str, db: AsyncSession) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def _update_assessment_progress(user_id: str, db: AsyncSession) -> None:
    user = await _get_user(user_id, db)
    if not user or (user.assessment_status or "required") == "complete":
        return

    result = await db.execute(
        select(Session)
        .where(
            Session.user_id == user_id,
            Session.status.in_(("attempted", "solved")),
        )
        .order_by(Session.created_at.asc())
    )
    reviewed_sessions = result.scalars().all()
    completed = min(3, len(reviewed_sessions))
    user.assessment_completed_sessions = completed
    user.assessment_status = "complete" if completed >= 3 else "in_progress"

    if completed >= 3:
        scores = [s.score or 0 for s in reviewed_sessions[:3]]
        avg = sum(scores) / len(scores) if scores else 0
        if avg >= 82:
            user.hermes_level = "advanced"
        elif avg >= 65:
            user.hermes_level = "interview-ready"
        else:
            user.hermes_level = "foundation"

    await db.commit()


async def _demo_review(session: Session, db: AsyncSession, source: str) -> dict:
    p_result = await db.execute(select(Problem).where(Problem.id == session.problem_id))
    problem = p_result.scalar_one_or_none()
    topic = problem.topic if problem else "problem solving"
    title = problem.title if problem else "today's challenge"
    difficulty = problem.difficulty if problem else "medium"

    base = 78
    if difficulty == "easy":
        base += 8
    elif difficulty == "hard":
        base -= 6
    if "edge" in (session.user_solution or "").lower() or "if not" in (session.user_solution or "").lower():
        base += 5
    if source == "telegram":
        base += 1
    score = max(45, min(96, base))

    correctness = min(40, max(18, round(score * 0.40)))
    complexity = min(30, max(14, round(score * 0.30)))
    edge_cases = min(20, max(8, round(score * 0.20)))
    style = min(10, max(4, score - correctness - complexity - edge_cases))
    breakdown = {
        "correctness": correctness,
        "complexity": complexity,
        "edge_cases": edge_cases,
        "style": style,
    }

    feedback = (
        f"Score: {score}/100\n\n"
        f"Correctness: {correctness}/40 -- Solid simulated coverage for {title}.\n"
        f"Complexity: {complexity}/30 -- Your approach is close to the expected {topic} pattern.\n"
        f"Edge Cases: {edge_cases}/20 -- Add one explicit boundary check before final submission.\n"
        f"Style: {style}/10 -- Clear enough for an interview walkthrough.\n\n"
        f"Demo Hermes review: this is a deterministic simulation, so no hosted LLM was called.\n\n"
        f"Most important improvement: state the invariant before coding.\n"
        f"Next step: solve one adjacent {topic} problem and compare the tradeoffs."
    )
    return {"score": score, "breakdown": breakdown, "feedback": feedback}


async def _ensure_demo_skill_update(user_id: str, db: AsyncSession) -> bool:
    content = (
        "# skill: solution_reviewer\n"
        "version: 1.3-demo\n"
        f"last_improved: {datetime.utcnow().date().isoformat()}\n\n"
        "## purpose\n"
        "Simulate visible Hermes learning for demo users without external model calls.\n\n"
        "## review_process\n"
        "Prefer invariant-first feedback, edge-case nudges, and concise next steps.\n\n"
        "## improvement_log\n"
        "v1.3-demo: Demo helpfulness feedback reinforced invariant-first coaching."
    )
    result = await db.execute(
        select(SkillVersion).where(
            SkillVersion.skill_name == "solution_reviewer",
            SkillVersion.version == "1.3-demo",
            SkillVersion.triggered_by == f"Demo feedback for user {user_id}",
        )
    )
    if result.scalar_one_or_none():
        return False
    db.add(
        SkillVersion(
            skill_name="solution_reviewer",
            version="1.3-demo",
            content=content,
            improvement_log="v1.3-demo: Demo helpfulness feedback reinforced invariant-first coaching.",
            triggered_by=f"Demo feedback for user {user_id}",
        )
    )
    await db.commit()
    return True
