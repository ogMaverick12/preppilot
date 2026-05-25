"""Dashboard router — all dashboard data in one call."""
import json
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.session import Session
from backend.models.problem import Problem
from backend.models.skill import SkillVersion, UserTopicStat
from backend.services import hermes_agent

router = APIRouter()


@router.get("/{user_id}")
async def get_dashboard(user_id: str, db: AsyncSession = Depends(get_db)):
    """All dashboard data in one call for minimal latency."""
    user = await _get_user(user_id, db)

    radar = await get_radar_data(user_id, db)
    trend = await get_trend_data(user_id, db)
    skills = await get_skills_data(user_id, db)
    week = await _get_week_summary(user_id, db)
    today = await _get_today_problem(user_id, db)

    return {
        "user": {
            "id": user.id,
            "name": user.display_name or user.telegram_username or user.email or "User",
            "timezone": user.timezone,
            "streak": week.get("streak", 0),
        },
        "assessment": {
            "status": user.assessment_status or "required",
            "completed_sessions": user.assessment_completed_sessions or 0,
            "required_sessions": 3,
            "hermes_level": user.hermes_level or "uncalibrated",
        },
        "hermes": {
            "mode": os.getenv("APP_MODE", "local"),
            "backend": "connected",
            "inference_mode": "hosted_llm" if hermes_agent.get_api_key() else "heuristic",
        },
        "week_summary": week,
        "today_problem": today,
        "radar": radar,
        "trend": trend,
        "skills": skills,
    }


@router.get("/{user_id}/radar")
async def get_radar(user_id: str, db: AsyncSession = Depends(get_db)):
    """Skill radar data — 12 topics with 0-100 scores."""
    return await get_radar_data(user_id, db)


@router.get("/{user_id}/trend")
async def get_trend(user_id: str, db: AsyncSession = Depends(get_db)):
    """Score trend over time (last 30 days)."""
    return await get_trend_data(user_id, db)


@router.get("/{user_id}/skills")
async def get_skills(user_id: str, db: AsyncSession = Depends(get_db)):
    """Skill version evolution history."""
    return await get_skills_data(user_id, db)


# ─── Data builders ──────────────────────────────────────────────────────────────

async def get_radar_data(user_id: str, db: AsyncSession) -> list[dict]:
    """Build radar chart data from UserTopicStats."""
    result = await db.execute(
        select(UserTopicStat).where(UserTopicStat.user_id == user_id)
    )
    stats = result.scalars().all()

    TOPICS = [
        "arrays", "linkedlists", "stacks", "trees", "graphs", "dp",
        "binarysearch", "heaps", "backtracking", "greedy", "tries", "bitmanip",
        "backend", "frontend", "fullstack", "web", "aiml", "data",
        "opensource", "systemdesign", "databases", "security",
    ]
    TOPIC_LABELS = {
        "arrays": "Arrays", "linkedlists": "Linked Lists", "stacks": "Stacks",
        "trees": "Trees", "graphs": "Graphs", "dp": "DP",
        "binarysearch": "Binary Search", "heaps": "Heaps",
        "backtracking": "Backtracking", "greedy": "Greedy",
        "tries": "Tries", "bitmanip": "Bit Manip",
        "backend": "Backend", "frontend": "Frontend",
        "fullstack": "Full Stack", "web": "Web",
        "aiml": "AI/ML", "data": "Data",
        "opensource": "Open Source", "systemdesign": "System Design",
        "databases": "Databases", "security": "Security",
    }

    stat_map = {s.topic: s for s in stats}
    radar = []
    for topic in TOPICS:
        s = stat_map.get(topic)
        radar.append({
            "topic": TOPIC_LABELS.get(topic, topic),
            "key": topic,
            "score": round(s.average_score) if s else 0,
            "attempts": s.attempts if s else 0,
            "difficulty": s.current_difficulty if s else "easy",
        })
    return radar


async def get_trend_data(user_id: str, db: AsyncSession) -> list[dict]:
    """Build score trend from last 30 days of sessions."""
    cutoff = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id, Session.created_at >= cutoff)
        .order_by(Session.created_at.asc())
    )
    sessions = result.scalars().all()

    trend = []
    for s in sessions:
        if s.score is not None and s.created_at:
            # Get problem topic
            p_result = await db.execute(select(Problem).where(Problem.id == s.problem_id))
            problem = p_result.scalar_one_or_none()
            trend.append({
                "date": s.created_at.strftime("%b %d"),
                "score": s.score,
                "topic": problem.topic if problem else "unknown",
            })
    return trend


async def get_skills_data(user_id: str, db: AsyncSession) -> list[dict]:
    """Get all skill versions ordered by creation date."""
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    result = await db.execute(
        select(SkillVersion).order_by(SkillVersion.created_at.desc())
    )
    versions = result.scalars().all()
    if not user or user.auth_provider != "demo":
        versions = [v for v in versions if not (v.triggered_by or "").startswith("Demo")]

    return [
        {
            "skill": v.skill_name,
            "version": v.version,
            "date": v.created_at.strftime("%b %d, %Y") if v.created_at else "",
            "summary": (v.improvement_log or "").split("\n")[-1] if v.improvement_log else "",
            "trigger": v.triggered_by or "Initial version",
            "trigger_detail": v.triggered_by or "System initialization",
            "content": v.content,
            "isLatest": False,  # Will be set for first item
        }
        for v in versions
    ]


async def _get_week_summary(user_id: str, db: AsyncSession) -> dict:
    """Build weekly summary stats."""
    week_ago = datetime.utcnow() - timedelta(days=7)
    result = await db.execute(
        select(Session).where(
            Session.user_id == user_id,
            Session.created_at >= week_ago,
        )
    )
    sessions = result.scalars().all()

    scores = [s.score for s in sessions if s.score is not None]
    solved = sum(1 for s in sessions if s.status == "solved")

    # All-time sessions for streak
    all_result = await db.execute(select(Session).where(Session.user_id == user_id))
    all_sessions = all_result.scalars().all()
    dates = sorted(set(
        s.created_at.date() for s in all_sessions
        if s.created_at and s.status in ("solved", "attempted")
    ), reverse=True)
    streak = 0
    if dates:
        streak = 1
        for i in range(1, len(dates)):
            if (dates[i - 1] - dates[i]).days == 1:
                streak += 1
            else:
                break

    return {
        "problems_sent": len(sessions),
        "problems_solved": solved,
        "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "streak": streak,
        "score_delta": 0,
    }


async def _get_today_problem(user_id: str, db: AsyncSession) -> Optional[dict]:
    """Get today's sent problem if any."""
    today = datetime.utcnow().date()
    result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id, Session.status == "sent")
        .order_by(Session.created_at.desc())
    )
    session = result.scalars().first()
    if not session:
        return None

    p_result = await db.execute(select(Problem).where(Problem.id == session.problem_id))
    problem = p_result.scalar_one_or_none()
    if not problem:
        return None

    return {
        "session_id": session.id,
        "id": problem.id,
        "title": problem.title,
        "difficulty": problem.difficulty,
        "topic": problem.topic,
        "sub_topic": problem.sub_topic,
        "description": problem.description,
        "hints": json.loads(problem.hints) if problem.hints else [],
        "estimated_minutes": "30-40",
        "status": session.status,
        "sent_at": session.created_at.strftime("%I:%M %p") if session.created_at else None,
        "selection_reason": f"Focusing on {problem.topic} today.",
        "selected_by_skill_version": session.selected_by_skill_version,
    }


async def _get_user(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
