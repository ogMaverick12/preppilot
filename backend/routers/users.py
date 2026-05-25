"""Users router — onboarding, profile management, and stats."""
import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.problem import Problem
from backend.models.session import Session
from backend.models.skill import CoachingProfile, SkillVersion, UserTopicStat
from backend.schemas.user import UserCreate, UserUpdate, UserResponse, UserStatsResponse

router = APIRouter()


@router.post("/onboard", response_model=UserResponse)
async def onboard_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user from onboarding (Telegram, GitHub, or Google)."""
    # Check if user already exists by email or telegram_id
    conditions = []
    if data.email:
        conditions.append(User.email == data.email)
    if data.telegram_id:
        conditions.append(User.telegram_id == data.telegram_id)

    if conditions:
        result = await db.execute(select(User).where(or_(*conditions)))
        existing = result.scalar_one_or_none()
        if existing:
            # Return existing user instead of error (re-login)
            return _user_to_response(existing)

    user = User(
        auth_provider=data.auth_provider,
        email=data.email,
        display_name=data.display_name,
        avatar_url=data.avatar_url,
        telegram_id=data.telegram_id,
        telegram_username=data.telegram_username,
        experience_level=data.experience_level,
        target_companies=json.dumps(data.target_companies or []),
        weak_areas=json.dumps(data.weak_areas or []),
        daily_time_budget=data.daily_time_budget,
        preferred_time=data.preferred_time,
        timezone=data.timezone,
        explanation_style=data.explanation_style,
        developer_role=data.developer_role,
        primary_stack=data.primary_stack,
        target_track=data.target_track,
        assessment_status="required",
        assessment_completed_sessions=0,
        hermes_level="uncalibrated",
        onboarding_complete=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return _user_to_response(user)


@router.get("/lookup", response_model=UserResponse)
async def lookup_user(
    telegram_username: Optional[str] = None,
    email: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Look up a user by Telegram username or email (for dashboard login)."""
    if email:
        result = await db.execute(select(User).where(User.email == email))
    elif telegram_username:
        result = await db.execute(select(User).where(User.telegram_username == telegram_username))
    else:
        raise HTTPException(status_code=400, detail="Provide email or telegram_username")

    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_to_response(user)


@router.post("/demo", response_model=UserResponse)
async def ensure_demo_user(db: AsyncSession = Depends(get_db)):
    """Create or refresh the stable seeded demo user."""
    result = await db.execute(select(User).where(User.id == "demo-user"))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id="demo-user",
            auth_provider="demo",
            email="demo@preppilot.local",
            display_name="Aarav Demo",
            telegram_id="demo_preppilot",
            telegram_username="demo_preppilot",
            experience_level="intermediate",
            target_companies=json.dumps(["Google", "Meta", "GSoC"]),
            weak_areas=json.dumps(["graphs", "dp", "systemdesign"]),
            daily_time_budget=45,
            preferred_time="08:00",
            timezone="Asia/Kolkata",
            explanation_style="balanced",
            developer_role="student",
            primary_stack="python",
            target_track="interviews",
            assessment_status="complete",
            assessment_completed_sessions=3,
            hermes_level="interview-ready",
            onboarding_complete=True,
        )
        db.add(user)
    else:
        user.auth_provider = "demo"
        user.email = user.email or "demo@preppilot.local"
        user.display_name = "Aarav Demo"
        user.telegram_username = "demo_preppilot"
        user.assessment_status = "complete"
        user.assessment_completed_sessions = max(user.assessment_completed_sessions or 0, 3)
        user.hermes_level = user.hermes_level if user.hermes_level != "uncalibrated" else "interview-ready"
        user.onboarding_complete = True

    await db.commit()
    await db.refresh(user)

    await _seed_demo_data(user.id, db)
    await db.refresh(user)
    return _user_to_response(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user profile by ID."""
    user = await _get_user_or_404(user_id, db)
    return _user_to_response(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user preferences."""
    user = await _get_user_or_404(user_id, db)

    update_data = data.model_dump(exclude_unset=True)
    if "target_companies" in update_data and update_data["target_companies"] is not None:
        update_data["target_companies"] = json.dumps(update_data["target_companies"])
    if "weak_areas" in update_data and update_data["weak_areas"] is not None:
        update_data["weak_areas"] = json.dumps(update_data["weak_areas"])
    if "notification_preferences" in update_data and update_data["notification_preferences"] is not None:
        update_data["notification_preferences"] = json.dumps(update_data["notification_preferences"])

    for key, value in update_data.items():
        setattr(user, key, value)

    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)

    return _user_to_response(user)


@router.get("/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get aggregated stats for a user."""
    await _get_user_or_404(user_id, db)

    # Count sessions by status
    sessions_result = await db.execute(
        select(Session).where(Session.user_id == user_id)
    )
    all_sessions = sessions_result.scalars().all()

    total = len(all_sessions)
    solved = sum(1 for s in all_sessions if s.status == "solved")
    attempted = sum(1 for s in all_sessions if s.status == "attempted")
    skipped = sum(1 for s in all_sessions if s.status == "skipped")
    scores = [s.score for s in all_sessions if s.score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    best_score = max(scores) if scores else 0

    # This week's stats
    week_ago = datetime.utcnow() - timedelta(days=7)
    week_sessions = [s for s in all_sessions if s.created_at and s.created_at >= week_ago]
    week_scores = [s.score for s in week_sessions if s.score is not None]

    # Calculate streak
    streak = _calculate_streak(all_sessions)

    # Topic stats
    topic_result = await db.execute(
        select(UserTopicStat).where(UserTopicStat.user_id == user_id)
    )
    topic_stats = topic_result.scalars().all()
    best_topic = max(topic_stats, key=lambda t: t.average_score).topic if topic_stats else None
    weakest_topic = min(topic_stats, key=lambda t: t.average_score).topic if topic_stats else None

    # Improvement
    if len(scores) >= 5:
        first_5 = sum(scores[:5]) / 5
        last_5 = sum(scores[-5:]) / 5
        improvement = last_5 - first_5
    else:
        improvement = 0

    return UserStatsResponse(
        total_sessions=total,
        total_solved=solved,
        total_attempted=attempted,
        total_skipped=skipped,
        average_score=round(avg_score, 1),
        best_score=best_score,
        current_streak=streak,
        longest_streak=streak,
        improvement_since_start=round(improvement, 1),
        best_topic=best_topic,
        weakest_topic=weakest_topic,
        problems_this_week=len(week_sessions),
        avg_score_this_week=round(sum(week_scores) / len(week_scores), 1) if week_scores else 0,
    )


# ─── Helpers ────────────────────────────────────────────────────────────────────

async def _get_user_or_404(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _user_to_response(user: User) -> UserResponse:
    notif_prefs = None
    if user.notification_preferences:
        try:
            notif_prefs = json.loads(user.notification_preferences) if isinstance(user.notification_preferences, str) else user.notification_preferences
        except (json.JSONDecodeError, TypeError):
            notif_prefs = {"daily_problems": True, "weekly_reports": True, "streak_alerts": True}

    return UserResponse(
        id=user.id,
        auth_provider=user.auth_provider or "telegram",
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


def _calculate_streak(sessions: list) -> int:
    """Calculate current daily streak from session history."""
    if not sessions:
        return 0
    dates = sorted(set(
        s.created_at.date() for s in sessions
        if s.created_at and s.status in ("solved", "attempted")
    ), reverse=True)
    if not dates:
        return 0
    streak = 1
    for i in range(1, len(dates)):
        if (dates[i - 1] - dates[i]).days == 1:
            streak += 1
        else:
            break
    return streak


async def _seed_demo_data(user_id: str, db: AsyncSession):
    """Seed realistic deterministic demo sessions, stats, profile, and skill versions."""
    existing_sessions = await db.execute(select(Session).where(Session.user_id == user_id))
    if not existing_sessions.scalars().first():
        wanted_slugs = [
            "two-sum",
            "coin-change",
            "course-schedule",
            "binary-tree-level-order",
            "search-rotated-sorted-array",
            "implement-trie",
        ]
        result = await db.execute(select(Problem).where(Problem.slug.in_(wanted_slugs)))
        problems = {p.slug: p for p in result.scalars().all()}
        if len(problems) < 3:
            fallback = await db.execute(select(Problem).limit(6))
            problems = {p.slug: p for p in fallback.scalars().all()}

        ordered = list(problems.values())[:6]
        now = datetime.utcnow()
        demo_scores = [92, 61, 68, 84, 88]
        for index, problem in enumerate(ordered[:5]):
            score = demo_scores[index % len(demo_scores)]
            session = Session(
                user_id=user_id,
                problem_id=problem.id,
                user_solution="def solve(...):\n    # demo solution with edge case notes\n    pass",
                language="python",
                hermes_feedback=(
                    f"Score: {score}/100\n\n"
                    f"Correctness: {min(40, round(score * 0.4))}/40 -- Demo review for {problem.title}.\n"
                    f"Complexity: {min(30, round(score * 0.3))}/30 -- Matches the expected pattern.\n"
                    f"Edge Cases: {min(20, round(score * 0.2))}/20 -- One boundary case to tighten.\n"
                    f"Style: {min(10, score - min(40, round(score * 0.4)) - min(30, round(score * 0.3)) - min(20, round(score * 0.2)))}/10 -- Clear interview narration."
                ),
                score=score,
                score_breakdown=json.dumps({
                    "correctness": min(40, round(score * 0.4)),
                    "complexity": min(30, round(score * 0.3)),
                    "edge_cases": min(20, round(score * 0.2)),
                    "style": min(10, score - min(40, round(score * 0.4)) - min(30, round(score * 0.3)) - min(20, round(score * 0.2))),
                }),
                status="solved" if score >= 70 else "attempted",
                explanation_helpful=4 if score >= 70 else 3,
                selected_by_skill_version="1.2-demo",
                created_at=now - timedelta(days=5 - index),
            )
            db.add(session)

        if ordered:
            active_problem = ordered[-1]
            db.add(Session(
                user_id=user_id,
                problem_id=active_problem.id,
                status="sent",
                selected_by_skill_version="1.2-demo",
                created_at=now,
            ))

    active_result = await db.execute(
        select(Session).where(Session.user_id == user_id, Session.status == "sent")
    )
    if not active_result.scalars().first():
        problem_result = await db.execute(select(Problem).limit(1))
        problem = problem_result.scalar_one_or_none()
        if problem:
            db.add(Session(
                user_id=user_id,
                problem_id=problem.id,
                status="sent",
                selected_by_skill_version="1.2-demo",
            ))

    topic_scores = {
        "arrays": 86, "linkedlists": 72, "stacks": 78, "trees": 80,
        "graphs": 62, "dp": 55, "binarysearch": 88, "heaps": 66,
        "backtracking": 58, "greedy": 74, "tries": 49, "bitmanip": 70,
        "backend": 76, "frontend": 68, "aiml": 61, "systemdesign": 57,
    }
    for topic, score in topic_scores.items():
        stat_result = await db.execute(
            select(UserTopicStat).where(UserTopicStat.user_id == user_id, UserTopicStat.topic == topic)
        )
        if not stat_result.scalar_one_or_none():
            db.add(UserTopicStat(
                user_id=user_id,
                topic=topic,
                attempts=4,
                solved=2 if score >= 70 else 1,
                average_score=score,
                current_difficulty="medium" if score >= 60 else "easy",
                improvement_rate=4.5,
                last_practiced=datetime.utcnow() - timedelta(days=1),
                next_review=datetime.utcnow() + timedelta(days=3),
            ))

    profile_result = await db.execute(select(CoachingProfile).where(CoachingProfile.user_id == user_id))
    if not profile_result.scalar_one_or_none():
        db.add(CoachingProfile(
            user_id=user_id,
            thinking_patterns=json.dumps(["Strong binary-search invariants", "Needs slower graph cycle tracing"]),
            common_mistakes=json.dumps(["Skips empty-input guards", "Explains DP state after code instead of before"]),
            explanation_style_weights=json.dumps({"balanced": 4.2, "code-first": 3.8, "visual": 3.5}),
            successful_problem_types=json.dumps(["binary search", "array hashing", "tree BFS"]),
            struggle_patterns=json.dumps(["graph recursion depth", "DP base-case initialization"]),
        ))

    demo_versions = [
        ("problem_selector", "1.2-demo", "Added career-track weighting and stale-topic recovery."),
        ("solution_reviewer", "1.2-demo", "Added invariant-first feedback for dashboard submissions."),
        ("coaching_profiler", "1.1-demo", "Detected explanation preferences from simulated helpfulness ratings."),
    ]
    for skill_name, version, log in demo_versions:
        sv_result = await db.execute(
            select(SkillVersion).where(
                SkillVersion.skill_name == skill_name,
                SkillVersion.version == version,
                SkillVersion.triggered_by == "Demo simulation seed",
            )
        )
        if not sv_result.scalar_one_or_none():
            db.add(SkillVersion(
                skill_name=skill_name,
                version=version,
                content=(
                    f"# skill: {skill_name}\n"
                    f"version: {version}\n"
                    "created: 2026-05-21\n\n"
                    "## purpose\n"
                    "Demonstrate visible PrepPilot Hermes evolution in demo mode.\n\n"
                    "## improvement_log\n"
                    f"{version}: {log}"
                ),
                improvement_log=f"{version}: {log}",
                triggered_by="Demo simulation seed",
            ))

    await db.commit()
