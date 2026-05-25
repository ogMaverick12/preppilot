"""
Coaching Service — Manages coaching profiles and user modeling via Hermes Agent.
================================================================================
After each session, the Hermes Agent analyzes accumulated data using the
coaching_profiler skill to build a deepening model of the user's thinking
patterns, common mistakes, and explanation preferences.
"""
import json
import logging
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.skill import CoachingProfile, UserTopicStat
from backend.models.session import Session
from backend.models.problem import Problem
from backend.services import hermes_agent

logger = logging.getLogger(__name__)


async def update_coaching_profile(user_id: str, session: Session, db: AsyncSession):
    """
    Update the coaching profile after a session is reviewed.
    Uses the Hermes Agent (coaching_profiler skill) for deep analysis
    every 5 sessions, with lightweight accumulation in between.
    """
    result = await db.execute(
        select(CoachingProfile).where(CoachingProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = CoachingProfile(user_id=user_id)
        db.add(profile)

    # Always do lightweight accumulation
    await _lightweight_update(profile, session, db)

    # Every 5 sessions, do a deep LLM-powered analysis
    session_count_result = await db.execute(
        select(Session).where(Session.user_id == user_id)
    )
    total_sessions = len(session_count_result.scalars().all())

    if total_sessions > 0 and total_sessions % 5 == 0:
        logger.info(f"Deep coaching analysis for user {user_id} at {total_sessions} sessions")
        await _deep_analysis(profile, user_id, db)

    profile.last_updated = datetime.utcnow()
    await db.commit()


async def _lightweight_update(
    profile: CoachingProfile, session: Session, db: AsyncSession
):
    """Quick accumulation of struggle patterns and style weights (no LLM call)."""
    # Parse existing data
    mistakes = json.loads(profile.common_mistakes) if profile.common_mistakes else []
    struggles = json.loads(profile.struggle_patterns) if profile.struggle_patterns else []

    # Track struggles from low scores
    if session.score is not None and session.score < 50:
        p_result = await db.execute(select(Problem).where(Problem.id == session.problem_id))
        problem = p_result.scalar_one_or_none()
        if problem:
            struggles.append({
                "topic": problem.topic,
                "difficulty": problem.difficulty,
                "score": session.score,
                "date": datetime.utcnow().isoformat(),
            })
            struggles = struggles[-20:]  # Keep last 20

    # Update style weights based on helpfulness ratings
    if session.explanation_helpful is not None:
        weights = json.loads(profile.explanation_style_weights) if profile.explanation_style_weights else {}
        current_style = "balanced"
        weights[current_style] = weights.get(current_style, 3.0)
        weights[current_style] = round(weights[current_style] * 0.8 + session.explanation_helpful * 0.2, 2)
        profile.explanation_style_weights = json.dumps(weights)

    profile.common_mistakes = json.dumps(mistakes[-20:])
    profile.struggle_patterns = json.dumps(struggles)


async def _deep_analysis(
    profile: CoachingProfile, user_id: str, db: AsyncSession
):
    """
    Full LLM-powered coaching profile analysis via the Hermes Agent.
    The coaching_profiler skill analyzes all session data to identify
    thinking patterns, common mistakes, and personalized recommendations.
    """
    analysis = await hermes_agent.analyze_coaching_profile(user_id, db)
    if not analysis:
        logger.debug(f"No LLM analysis available for user {user_id}")
        return

    # Update profile with LLM-generated insights
    if "thinking_patterns" in analysis:
        profile.thinking_patterns = json.dumps(
            analysis["thinking_patterns"] if isinstance(analysis["thinking_patterns"], list)
            else [analysis["thinking_patterns"]]
        )
    if "common_mistakes" in analysis:
        profile.common_mistakes = json.dumps(
            analysis["common_mistakes"] if isinstance(analysis["common_mistakes"], list)
            else [analysis["common_mistakes"]]
        )
    if "struggle_areas" in analysis:
        profile.struggle_patterns = json.dumps(
            analysis["struggle_areas"] if isinstance(analysis["struggle_areas"], list)
            else [analysis["struggle_areas"]]
        )
    if "success_areas" in analysis:
        profile.successful_problem_types = json.dumps(
            analysis["success_areas"] if isinstance(analysis["success_areas"], list)
            else [analysis["success_areas"]]
        )
    if "style_weights" in analysis:
        profile.explanation_style_weights = json.dumps(analysis["style_weights"])

    logger.info(f"Deep coaching profile updated for user {user_id}")


async def update_topic_stats(user_id: str, session: Session, db: AsyncSession):
    """Update per-topic stats after a session."""
    # Get problem topic
    p_result = await db.execute(select(Problem).where(Problem.id == session.problem_id))
    problem = p_result.scalar_one_or_none()
    if not problem:
        return

    topic = problem.topic

    # Get or create topic stat
    result = await db.execute(
        select(UserTopicStat).where(
            UserTopicStat.user_id == user_id,
            UserTopicStat.topic == topic,
        )
    )
    stat = result.scalar_one_or_none()

    if not stat:
        stat = UserTopicStat(user_id=user_id, topic=topic)
        db.add(stat)

    stat.attempts = (stat.attempts or 0) + 1
    if session.status == "solved":
        stat.solved = (stat.solved or 0) + 1
    elif session.status == "skipped":
        stat.skipped = (stat.skipped or 0) + 1

    # Update average score
    current_average = stat.average_score or 0
    if session.score is not None:
        if current_average == 0:
            stat.average_score = float(session.score)
        else:
            stat.average_score = round(current_average * 0.7 + session.score * 0.3, 1)

    # Update difficulty calibration
    if session.score and session.score > 80:
        current_difficulty = stat.current_difficulty or "easy"
        stat.current_difficulty = {"easy": "medium", "medium": "hard"}.get(current_difficulty, "hard")
    elif session.score and session.score < 40:
        current_difficulty = stat.current_difficulty or "easy"
        stat.current_difficulty = {"hard": "medium", "medium": "easy"}.get(current_difficulty, "easy")

    stat.last_practiced = datetime.utcnow()

    # Spaced repetition: set next review
    if session.score and session.score < 50:
        stat.next_review = datetime.utcnow() + timedelta(days=1)
    elif session.score and session.score < 70:
        stat.next_review = datetime.utcnow() + timedelta(days=3)
    else:
        stat.next_review = datetime.utcnow() + timedelta(days=7)

    await db.commit()
