"""
Weekly Report Script — Generates and sends a weekly coaching report
every Sunday morning via Telegram.
"""
import asyncio
import os
from datetime import datetime
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def send_weekly_report(user_id: str, telegram_id: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(f"{BACKEND_URL}/api/v1/users/{user_id}/stats")
        if resp.status_code != 200:
            print(f"Failed to get stats for {user_id}")
            return
        stats = resp.json()

        message = format_weekly_report(stats)
        await client.post(f"{BACKEND_URL}/api/v1/webhooks/send", json={
            "telegram_id": telegram_id,
            "message": message,
        })
        print(f"Weekly report sent to {telegram_id}")


def format_weekly_report(stats: dict) -> str:
    return f"""📊 *PrepPilot Weekly Report*
_Week of {datetime.utcnow().strftime('%B %d, %Y')}_

*This Week:*
📝 Problems attempted: {stats.get('problems_this_week', 0)}
✅ Total solved: {stats.get('total_solved', 0)}
📈 Average score: {stats.get('avg_score_this_week', 0)}/100
🔥 Current streak: {stats.get('current_streak', 0)} days

*Performance:*
🏆 Best topic: {stats.get('best_topic', 'N/A')}
🎯 Focus area: {stats.get('weakest_topic', 'N/A')}
📊 Overall improvement: {stats.get('improvement_since_start', 0):+.1f} points

Your consistency is building real skill. Keep it up! 💪

_See full dashboard: /dashboard_"""


if __name__ == "__main__":
    asyncio.run(send_weekly_report(
        user_id=os.getenv("USER_ID", ""),
        telegram_id=os.getenv("TELEGRAM_ID", ""),
    ))
