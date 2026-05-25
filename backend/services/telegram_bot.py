"""
Telegram Bot Service — Complete conversation flow handler.
States: ONBOARDING, IDLE, PROBLEM_SENT, REVIEWING, FEEDBACK_REQUESTED
"""
import json
import logging
import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User
from backend.models.session import Session
from backend.models.problem import Problem
from backend.services.submission_service import (
    get_active_session,
    record_feedback_and_evolve,
    submit_solution_to_hermes,
)

logger = logging.getLogger(__name__)
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:3000")

# In-memory conversation state (would use Redis in production)
conversation_states: dict[str, dict] = {}


async def handle_telegram_update(
    chat_id: str, text: str, username: str | None, db: AsyncSession
):
    """Route incoming Telegram messages based on conversation state."""
    text = text.strip()

    # Check if user exists
    result = await db.execute(select(User).where(User.telegram_id == chat_id))
    user = result.scalar_one_or_none()

    # Handle commands first
    if text.startswith("/"):
        await _handle_command(chat_id, text, username, user, db)
        return

    state = conversation_states.get(chat_id, {})
    current_state = state.get("state", "IDLE")

    if not user or not user.onboarding_complete:
        await _handle_onboarding(chat_id, text, username, state, db)
    elif current_state == "PROBLEM_SENT":
        await _handle_solution_submission(chat_id, text, user, state, db)
    elif current_state == "FEEDBACK_REQUESTED":
        await _handle_feedback(chat_id, text, user, state, db)
    else:
        recovered = await _recover_active_state(chat_id, user, db)
        if recovered:
            await _handle_solution_submission(chat_id, text, user, recovered, db)
        else:
            await _send(
                chat_id,
                "I don't see an active PrepPilot problem for this chat. Send /problem first, or solve one from your dashboard.",
            )


async def _handle_command(
    chat_id: str, text: str, username: str | None,
    user: User | None, db: AsyncSession
):
    """Handle bot commands."""
    cmd = text.split()[0].lower()

    if cmd == "/start":
        if user and user.onboarding_complete:
            await _send(chat_id, f"""👋 Welcome back{', ' + user.telegram_username if user.telegram_username else ''}!

🎯 Send /problem to get today's challenge
📊 Send /stats for a quick summary
🌐 [View Dashboard]({DASHBOARD_URL}/dashboard)""")
        else:
            conversation_states[chat_id] = {"state": "ONBOARDING", "step": 0, "data": {"username": username}}
            await _send(chat_id, """🚀 *Welcome to PrepPilot!*

I'm your AI interview coach. I get smarter the more you practice.

Let's set up your profile (4 quick questions).

*What's your experience level?*
Reply: `beginner`, `intermediate`, or `advanced`""")

    elif cmd == "/hint":
        await _handle_hint(chat_id, user, db)

    elif cmd == "/skip":
        await _handle_skip(chat_id, user, db)

    elif cmd == "/stats":
        await _handle_stats(chat_id, user, db)

    elif cmd == "/problem":
        await _handle_get_problem(chat_id, user, db)

    elif cmd == "/dashboard":
        await _send(chat_id, f"🌐 [Open your Dashboard]({DASHBOARD_URL}/dashboard)")

    else:
        await _send(chat_id, "Unknown command. Try /problem, /hint, /skip, /stats, or /dashboard")


async def _handle_onboarding(
    chat_id: str, text: str, username: str | None,
    state: dict, db: AsyncSession
):
    """Multi-step onboarding conversation."""
    step = state.get("step", 0)
    data = state.get("data", {"username": username})

    if step == 0:
        # Expecting experience level
        level = text.lower().strip()
        if level not in ("beginner", "intermediate", "advanced"):
            await _send(chat_id, "Please reply `beginner`, `intermediate`, or `advanced`.")
            return
        data["experience_level"] = level
        conversation_states[chat_id] = {"state": "ONBOARDING", "step": 1, "data": data}
        await _send(chat_id, """✅ Got it!

*Which companies are you targeting?*
Reply with company names separated by commas (or `skip`).
Example: `Google, Meta, Amazon`""")

    elif step == 1:
        # Expecting target companies
        if text.lower() != "skip":
            data["target_companies"] = [c.strip() for c in text.split(",")]
        conversation_states[chat_id] = {"state": "ONBOARDING", "step": 2, "data": data}
        await _send(chat_id, """*What topics do you find hardest?*
Reply with topics separated by commas (or `skip`).
Options: `arrays, trees, graphs, dp, backtracking, linked lists`""")

    elif step == 2:
        # Expecting weak areas
        if text.lower() != "skip":
            data["weak_areas"] = [w.strip() for w in text.split(",")]
        conversation_states[chat_id] = {"state": "ONBOARDING", "step": 3, "data": data}
        await _send(chat_id, """*What time should I send your daily problem?*
Reply with a time like `08:00` or `09:30` (24h format, or `skip` for 8 AM).""")

    elif step == 3:
        # Expecting preferred time
        time_str = "08:00"
        if text.lower() != "skip":
            time_str = text.strip()
        data["preferred_time"] = time_str

        # Create user
        user = User(
            telegram_id=chat_id,
            telegram_username=data.get("username"),
            experience_level=data["experience_level"],
            target_companies=json.dumps(data.get("target_companies", [])),
            weak_areas=json.dumps(data.get("weak_areas", [])),
            preferred_time=data["preferred_time"],
            onboarding_complete=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        conversation_states[chat_id] = {"state": "IDLE"}
        await _send(chat_id, f"""🎉 *You're all set!*

📱 Experience: {data['experience_level']}
⏰ Daily problem at: {data['preferred_time']}

Send /problem to get your first challenge now!
📊 [View your Dashboard]({DASHBOARD_URL}/dashboard)""")


async def _handle_get_problem(chat_id: str, user: User | None, db: AsyncSession):
    """Send today's problem to the user."""
    if not user:
        await _send(chat_id, "Please run /start first to set up your profile.")
        return

    from backend.services.problem_service import select_todays_problem
    try:
        problem = await select_todays_problem(user.id, db)
    except ValueError as e:
        await _send(chat_id, f"⚠️ {str(e)}")
        return

    emoji = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}.get(problem.difficulty, "🟡")

    # Create session
    session = Session(
        user_id=user.id, problem_id=problem.id, status="sent",
        selected_by_skill_version=problem.selected_by_skill_version,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    conversation_states[chat_id] = {
        "state": "PROBLEM_SENT",
        "session_id": session.id,
        "problem_id": problem.id,
        "hints_used": 0,
    }

    desc = problem.description[:600] + ("..." if len(problem.description) > 600 else "")
    await _send(chat_id, f"""🎯 *PrepPilot Daily Challenge*

{emoji} [{problem.difficulty.capitalize()}] *{problem.title}*
📚 Topic: {problem.topic.replace('_', ' ').title()}
⏱ Est. time: {problem.estimated_minutes} min

_{problem.selection_reason}_

{desc}

Paste your solution when ready. I'll review it.

/hint — progressive hint
/skip — skip this problem""")


async def _handle_hint(chat_id: str, user: User | None, db: AsyncSession):
    """Provide next progressive hint."""
    state = conversation_states.get(chat_id, {})
    if state.get("state") != "PROBLEM_SENT":
        if user:
            state = await _recover_active_state(chat_id, user, db) or {}
        if state.get("state") != "PROBLEM_SENT":
            await _send(chat_id, "No active problem. Send /problem first.")
            return

    problem_id = state.get("problem_id")
    hints_used = state.get("hints_used", 0)

    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem or not problem.hints:
        await _send(chat_id, "No hints available for this problem.")
        return

    hints = json.loads(problem.hints) if isinstance(problem.hints, str) else problem.hints
    if hints_used >= len(hints):
        await _send(chat_id, "You've used all available hints!")
        return

    hint = hints[hints_used]
    state["hints_used"] = hints_used + 1
    conversation_states[chat_id] = state
    session_id = state.get("session_id")
    if session_id:
        session_result = await db.execute(select(Session).where(Session.id == session_id))
        session = session_result.scalar_one_or_none()
        if session:
            session.hints_used = hints_used + 1
            await db.commit()

    remaining = len(hints) - hints_used - 1
    await _send(chat_id, f"💡 *Hint {hints_used + 1}/{len(hints)}:*\n\n{hint}\n\n_{remaining} hint{'s' if remaining != 1 else ''} remaining_")


async def _handle_skip(chat_id: str, user: User | None, db: AsyncSession):
    """Skip the current problem."""
    state = conversation_states.get(chat_id, {})
    if state.get("state") != "PROBLEM_SENT":
        if user:
            state = await _recover_active_state(chat_id, user, db) or {}
        if state.get("state") != "PROBLEM_SENT":
            await _send(chat_id, "No active problem to skip.")
            return

    session_id = state.get("session_id")
    if session_id:
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if session:
            session.status = "skipped"
            await db.commit()

    conversation_states[chat_id] = {"state": "IDLE"}
    await _send(chat_id, "⏭ Problem skipped. Send /problem for a new one!")


async def _handle_solution_submission(
    chat_id: str, text: str, user: User, state: dict, db: AsyncSession
):
    """Process a submitted solution."""
    session_id = state.get("session_id")
    if not session_id:
        await _send(chat_id, "No active session. Send /problem first.")
        return

    await _send(chat_id, "🔍 *Reviewing your solution...* (this takes about 15 seconds)")

    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        await _send(chat_id, "Session not found. Send /problem for a new one.")
        return

    try:
        review = await submit_solution_to_hermes(
            session=session,
            user_solution=text,
            language=_detect_language(text),
            db=db,
            source="telegram",
        )
    except ValueError as exc:
        await _send(chat_id, f"⚠️ {str(exc)}")
        conversation_states[chat_id] = {"state": "IDLE"}
        return

    # Send review
    await _send(chat_id, review["feedback"])

    # Ask for feedback rating
    conversation_states[chat_id] = {
        "state": "FEEDBACK_REQUESTED",
        "session_id": session_id,
    }
    await _send(chat_id, "Was this explanation helpful? Reply *1-5* (1=not helpful, 5=very helpful)")


async def _handle_feedback(
    chat_id: str, text: str, user: User, state: dict, db: AsyncSession
):
    """Handle feedback rating."""
    try:
        rating = int(text.strip())
        if rating < 1 or rating > 5:
            raise ValueError
    except ValueError:
        await _send(chat_id, "Please reply with a number 1-5.")
        return

    session_id = state.get("session_id")
    if session_id:
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if session:
            improved_skills = await record_feedback_and_evolve(
                session=session,
                explanation_helpful=rating,
                db=db,
            )
            if improved_skills:
                skill_list = ", ".join(improved_skills)
                await _send(
                    chat_id,
                    f"🧠 *Hermes has evolved!*\n\n"
                    f"My coaching skills just got an upgrade based on our sessions together.\n"
                    f"Improved: _{skill_list}_\n\n"
                    f"Check the Skill Evolution panel on your dashboard to see what changed!"
                )

    conversation_states[chat_id] = {"state": "IDLE"}
    emoji = ["", "😔", "🤔", "👍", "😊", "🎉"][rating]
    await _send(chat_id, f"{emoji} Thanks for the feedback! Send /problem for your next challenge.")


async def _handle_stats(chat_id: str, user: User | None, db: AsyncSession):
    """Show quick stats in Telegram."""
    if not user:
        await _send(chat_id, "Please run /start first.")
        return

    result = await db.execute(select(Session).where(Session.user_id == user.id))
    sessions = result.scalars().all()
    total = len(sessions)
    solved = sum(1 for s in sessions if s.status == "solved")
    scores = [s.score for s in sessions if s.score]
    avg = round(sum(scores) / len(scores), 1) if scores else 0

    await _send(chat_id, f"""📊 *Your PrepPilot Stats*

📝 Sessions: {total}
✅ Solved: {solved}
📈 Average Score: {avg}/100

🌐 [Full Dashboard]({DASHBOARD_URL}/dashboard)""")


def _detect_language(code: str) -> str:
    """Simple language detection from code."""
    if "def " in code or "import " in code:
        return "python"
    elif "function " in code or "const " in code or "=>" in code:
        return "javascript"
    elif "public static" in code or "System.out" in code:
        return "java"
    elif "#include" in code or "int main" in code:
        return "cpp"
    return "python"


async def _send(chat_id: str, message: str):
    """Send a message via Telegram API."""
    import httpx
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not token:
        logger.warning(f"No bot token — would send to {chat_id}: {message[:50]}...")
        return

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": message, "parse_mode": "Markdown"},
            )
    except Exception as e:
        logger.error(f"Telegram send error: {e}")


async def _recover_active_state(chat_id: str, user: User, db: AsyncSession) -> dict | None:
    """Recover a PrepPilot active session after process restart or memory loss."""
    session = await get_active_session(user.id, db)
    if not session:
        return None
    state = {
        "state": "PROBLEM_SENT",
        "session_id": session.id,
        "problem_id": session.problem_id,
        "hints_used": session.hints_used or 0,
    }
    conversation_states[chat_id] = state
    return state
