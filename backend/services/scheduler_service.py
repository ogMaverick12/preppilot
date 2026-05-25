"""
Scheduler Service — APScheduler integration for daily problem delivery
and weekly coaching reports.
"""
import os
import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def send_daily_problem(user_id: str, telegram_id: str):
    """Send today's problem to a user via Telegram."""
    import httpx
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get today's problem
            resp = await client.get(f"{backend_url}/api/v1/problems/today/{user_id}")
            if resp.status_code != 200:
                logger.error(f"Failed to get problem for {user_id}: {resp.status_code}")
                return
            problem = resp.json()

            # Format message
            emoji = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}.get(problem["difficulty"], "🟡")
            message = f"""🎯 *PrepPilot Daily Brief*

{emoji} [{problem['difficulty'].capitalize()}] *{problem['title']}*
📚 Topic: {problem['topic'].replace('_', ' ').title()}
⏱ Est. time: {problem['estimated_minutes']} minutes

_{problem['selection_reason']}_

{problem['description'][:500]}{'...' if len(problem.get('description', '')) > 500 else ''}

When you're done, paste your solution here and I'll review it.

/hint — get a progressive hint
/skip — skip today's problem"""

            # Send via webhook
            await client.post(f"{backend_url}/api/v1/webhooks/send", json={
                "telegram_id": telegram_id,
                "message": message,
                "parse_mode": "Markdown",
            })
            logger.info(f"Daily problem sent to {telegram_id}")

    except Exception as e:
        logger.error(f"Failed to send daily problem: {e}")


async def send_weekly_report(user_id: str, telegram_id: str):
    """Send weekly coaching report on Sundays."""
    import httpx
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{backend_url}/api/v1/users/{user_id}/stats")
            if resp.status_code != 200:
                return
            stats = resp.json()

            message = f"""📊 *PrepPilot Weekly Report*
_Week of {datetime.utcnow().strftime('%B %d, %Y')}_

*Sessions:* {stats.get('problems_this_week', 0)} problems this week
*Solved:* {stats.get('total_solved', 0)} total
*Average Score:* {stats.get('avg_score_this_week', 0)}/100
*Streak:* {stats.get('current_streak', 0)} days 🔥

*Strongest:* {stats.get('best_topic', 'N/A')}
*Focus Area:* {stats.get('weakest_topic', 'N/A')}

Keep up the momentum! Your consistency is building real skill. 💪

_View your full dashboard: /dashboard_"""

            await client.post(f"{backend_url}/api/v1/webhooks/send", json={
                "telegram_id": telegram_id,
                "message": message,
                "parse_mode": "Markdown",
            })
            logger.info(f"Weekly report sent to {telegram_id}")

    except Exception as e:
        logger.error(f"Failed to send weekly report: {e}")


def start_scheduler():
    """Start the APScheduler with configured jobs."""
    # Weekly report: Sundays at 9 AM UTC
    scheduler.add_job(
        _run_weekly_reports,
        CronTrigger(day_of_week="sun", hour=9, minute=0),
        id="weekly_report",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started with weekly report job")


async def _run_weekly_reports():
    """Iterate all users and send weekly reports."""
    from backend.database import async_session
    from backend.models.user import User
    from sqlalchemy import select

    async with async_session() as db:
        result = await db.execute(select(User).where(User.onboarding_complete == True))
        users = result.scalars().all()
        for user in users:
            await send_weekly_report(user.id, user.telegram_id)
