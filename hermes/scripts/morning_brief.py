"""
Morning Brief Script — Called by Hermes cron every morning per user.
Fetches today's problem from the backend API and sends it via Telegram.
"""
import asyncio
import os
import httpx

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def send_morning_brief(user_id: str, telegram_id: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Get today's problem from backend (uses problem_selector skill)
        response = await client.get(f"{BACKEND_URL}/api/v1/problems/today/{user_id}")
        if response.status_code != 200:
            print(f"Failed to get problem for {user_id}: {response.status_code}")
            return
        problem = response.json()

        # Format and send via Telegram
        message = format_problem_message(problem)
        await client.post(f"{BACKEND_URL}/api/v1/webhooks/send", json={
            "telegram_id": telegram_id,
            "message": message,
        })
        print(f"Morning brief sent to {telegram_id}")


def format_problem_message(problem: dict) -> str:
    difficulty_emoji = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}
    desc = problem.get("description", "")
    return f"""🎯 PrepPilot Daily Brief

{difficulty_emoji.get(problem['difficulty'], '🟡')} [{problem['difficulty'].capitalize()}] {problem['title']}
📚 Topic: {problem['topic'].replace('_', ' ').title()}
⏱ Est. time: {problem.get('estimated_minutes', '30')} minutes

_{problem.get('selection_reason', '')}_

{desc[:500]}{'...' if len(desc) > 500 else ''}

When you're done, paste your solution here and I'll review it.

/hint — get a progressive hint
/skip — skip today's problem"""


if __name__ == "__main__":
    asyncio.run(send_morning_brief(
        user_id=os.getenv("USER_ID", ""),
        telegram_id=os.getenv("TELEGRAM_ID", ""),
    ))
