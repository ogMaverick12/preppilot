"""
Hermes Agent — The Core Intelligence Layer of PrepPilot.
=========================================================
Hermes is an AI agent that uses skill files, persistent memory, and an
optional hosted LLM provider to:
  1. Review user solutions (solution_reviewer skill)
  2. Select personalized problems (problem_selector skill)
  3. Build coaching profiles (coaching_profiler skill)
  4. Self-improve its own skill files based on accumulated session data

All intelligence in PrepPilot flows through this module.
The skill files (hermes/skills/*.md) are the agent's instructions —
they are read as system prompts and sent to the LLM alongside user context.
"""
import json
import os
import re
import logging
from datetime import datetime
from typing import Any, Optional

import yaml
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.skill import SkillVersion, CoachingProfile
from backend.models.session import Session
from backend.models.problem import Problem
from backend.models.user import User

logger = logging.getLogger(__name__)

# ─── Configuration ────────────────────────────────────────────────────────────

_config: dict = {}


def load_config() -> dict:
    """Load Hermes configuration from hermes/config/hermes.config.yml."""
    global _config
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "hermes", "config", "hermes.config.yml",
    )
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            _config = yaml.safe_load(f) or {}
        logger.info(f"Hermes config loaded: agent={_config.get('agent', {}).get('name', 'Unknown')}")
    else:
        logger.warning(f"Hermes config not found at {config_path}, using defaults")
        _config = {}
    return _config


def get_config() -> dict:
    """Get the loaded config, loading it if necessary."""
    if not _config:
        load_config()
    return _config


def get_model_name() -> str:
    """Get the configured LLM model name."""
    cfg = get_config()
    return os.getenv("OPENROUTER_MODEL") or cfg.get("model", {}).get("model", "nousresearch/hermes-3-llama-3.1-70b")


def get_api_key() -> str:
    """Get a real OpenRouter API key from environment, ignoring placeholders."""
    key = os.getenv("OPENROUTER_API_KEY", "").strip()
    placeholder_keys = {
        "",
        "your_openrouter_api_key_here",
        "your-openrouter-key",
        "change-me",
        "changeme",
    }
    if key.lower() in placeholder_keys or key.lower().startswith("your_"):
        return ""
    return key


def get_improvement_threshold() -> int:
    """Get the number of sessions before a skill improvement is triggered."""
    cfg = get_config()
    return cfg.get("skills", {}).get("improvement_threshold", 10)


def is_auto_improve_enabled() -> bool:
    """Check if auto-improvement is enabled."""
    cfg = get_config()
    return cfg.get("skills", {}).get("auto_improve", True)


# ─── LLM Call Layer ───────────────────────────────────────────────────────────

async def _call_llm(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 1500,
) -> Optional[str]:
    """
    Call the optional external LLM provider via OpenRouter. This is the single
    point of external model access for PrepPilot.

    Returns the LLM response text, or None if the call fails or no real API key
    is configured. The caller then uses Hermes' local heuristic path.
    """
    api_key = get_api_key()
    if not api_key:
        logger.debug("No real OPENROUTER_API_KEY — using Hermes heuristic mode")
        return None

    import httpx

    model = get_model_name()

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "https://preppilot.dev",
                    "X-Title": "PrepPilot Coach",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        logger.info(f"LLM call success: model={model}, tokens={data.get('usage', {})}")
        return content

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return None


# ─── Skill File Management ────────────────────────────────────────────────────

SKILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "hermes", "skills",
)


async def get_skill_content(skill_name: str, db: AsyncSession) -> tuple[str, str]:
    """
    Get the latest version of a skill file.
    Returns (content, version). Checks DB first, then falls back to disk.
    """
    # Check DB for latest version
    result = await db.execute(
        select(SkillVersion)
        .where(SkillVersion.skill_name == skill_name)
        .order_by(SkillVersion.created_at.desc())
    )
    version = result.scalars().first()
    if version and version.content:
        return version.content, version.version

    # Fallback: read from disk
    skill_path = os.path.join(SKILLS_DIR, f"{skill_name}.md")
    if os.path.exists(skill_path):
        with open(skill_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Parse version from content
        ver = "1.0"
        for line in content.split("\n"):
            if line.strip().startswith("version:"):
                ver = line.split(":", 1)[1].strip()
                break
        return content, ver

    return "", "1.0"


async def save_skill_version(
    skill_name: str,
    version: str,
    content: str,
    improvement_log: str,
    triggered_by: str,
    db: AsyncSession,
) -> SkillVersion:
    """Save a new version of a skill to both DB and disk."""
    sv = SkillVersion(
        skill_name=skill_name,
        version=version,
        content=content,
        improvement_log=improvement_log,
        triggered_by=triggered_by,
    )
    db.add(sv)
    await db.commit()
    await db.refresh(sv)

    # Write to disk
    skill_path = os.path.join(SKILLS_DIR, f"{skill_name}.md")
    os.makedirs(os.path.dirname(skill_path), exist_ok=True)
    with open(skill_path, "w", encoding="utf-8") as f:
        f.write(content)

    logger.info(f"Saved skill {skill_name} v{version}: {triggered_by}")
    return sv


# ─── Core Agent: Execute Skill ────────────────────────────────────────────────

async def execute_skill(
    skill_name: str,
    context: dict[str, Any],
    db: AsyncSession,
) -> Optional[str]:
    """
    Execute a Hermes skill by reading the skill file as the system prompt
    and sending the context as the user prompt to the LLM.

    Args:
        skill_name: One of "solution_reviewer", "problem_selector", "coaching_profiler"
        context: Dict of relevant data (solution, problem, user profile, etc.)
        db: Database session

    Returns:
        LLM response text, or None if LLM unavailable.
    """
    skill_content, skill_version = await get_skill_content(skill_name, db)
    if not skill_content:
        logger.warning(f"Skill {skill_name} has no content, cannot execute")
        return None

    # Build system prompt from skill file
    agent_cfg = get_config().get("agent", {})
    agent_name = agent_cfg.get("name", "PrepPilot Coach")

    system_prompt = (
        f"You are {agent_name}. You are executing the '{skill_name}' skill (v{skill_version}).\n"
        f"Follow the instructions in the skill file below precisely.\n\n"
        f"--- SKILL FILE ---\n{skill_content}\n--- END SKILL FILE ---\n\n"
        f"Execute this skill with the context provided by the user. "
        f"Return your output in the format specified by the skill's output section."
    )

    # Build user prompt from context
    user_prompt = _format_context(context)

    # Determine tokens based on skill type
    max_tokens = 1500
    if skill_name == "solution_reviewer":
        max_tokens = 1200
    elif skill_name == "coaching_profiler":
        max_tokens = 1000

    return await _call_llm(system_prompt, user_prompt, max_tokens=max_tokens)


def _format_context(context: dict[str, Any]) -> str:
    """Format a context dict into a readable prompt string."""
    parts = []
    for key, value in context.items():
        if isinstance(value, str):
            parts.append(f"## {key.replace('_', ' ').title()}\n{value}")
        elif isinstance(value, (dict, list)):
            parts.append(f"## {key.replace('_', ' ').title()}\n```json\n{json.dumps(value, indent=2, default=str)}\n```")
        else:
            parts.append(f"**{key.replace('_', ' ').title()}:** {value}")
    return "\n\n".join(parts)


# ─── Solution Review ──────────────────────────────────────────────────────────

async def review_solution(session: Session, db: AsyncSession) -> dict:
    """
    Review a user's submitted solution using the solution_reviewer skill.
    This is the primary review pipeline — the skill file is the system prompt.
    Falls back to heuristic review if no API key or LLM call fails.
    """
    # Gather context
    p_result = await db.execute(select(Problem).where(Problem.id == session.problem_id))
    problem = p_result.scalar_one_or_none()
    if not problem:
        return _fallback_review()

    u_result = await db.execute(select(User).where(User.id == session.user_id))
    user = u_result.scalar_one_or_none()

    # Get coaching profile for personalization
    profile_data = {}
    if user:
        cp_result = await db.execute(
            select(CoachingProfile).where(CoachingProfile.user_id == user.id)
        )
        profile = cp_result.scalar_one_or_none()
        if profile:
            profile_data = {
                "thinking_patterns": profile.thinking_patterns or "[]",
                "common_mistakes": profile.common_mistakes or "[]",
                "explanation_style_weights": profile.explanation_style_weights or "{}",
                "struggle_patterns": profile.struggle_patterns or "[]",
            }

    # Build context for the skill
    context = {
        "user_solution": session.user_solution or "",
        "language": session.language or "python",
        "problem": json.dumps({
            "title": problem.title,
            "difficulty": problem.difficulty,
            "topic": problem.topic,
            "description": problem.description[:800],
            "time_complexity": problem.time_complexity,
            "space_complexity": problem.space_complexity,
        }),
        "user_profile": json.dumps({
            "experience_level": user.experience_level if user else "intermediate",
            "explanation_style": user.explanation_style if user else "balanced",
        }),
        "coaching_profile": json.dumps(profile_data) if profile_data else "No profile yet — first session.",
        "hints_used": session.hints_used or 0,
    }

    # Execute the solution_reviewer skill via LLM
    llm_response = await execute_skill("solution_reviewer", context, db)

    if llm_response:
        score, breakdown = _parse_scores(llm_response)
        return {"score": score, "breakdown": breakdown, "feedback": llm_response}

    # Fallback: heuristic review
    return _heuristic_review(session, problem, user)


# ─── Problem Selection Reasoning ──────────────────────────────────────────────

async def generate_selection_reason(
    user: User,
    problem: Problem,
    topic_stats: dict,
    db: AsyncSession,
) -> str:
    """
    Generate a personalized reason for why this problem was selected.
    Uses the problem_selector skill to produce the explanation.
    Falls back to template string if LLM unavailable.
    """
    context = {
        "selected_problem": json.dumps({
            "title": problem.title,
            "difficulty": problem.difficulty,
            "topic": problem.topic,
        }),
        "user_profile": json.dumps({
            "experience_level": user.experience_level,
            "weak_areas": user.weak_areas or "[]",
        }),
        "topic_stats": json.dumps({
            topic: {
                "average_score": stat.average_score,
                "attempts": stat.attempts,
                "current_difficulty": stat.current_difficulty,
                "last_practiced": str(stat.last_practiced) if stat.last_practiced else "never",
            }
            for topic, stat in topic_stats.items()
        }) if topic_stats else "No stats yet — first problem.",
        "instruction": (
            "Generate a 1-2 sentence personalized explanation for why this problem "
            "was selected for the user today. Reference their specific data."
        ),
    }

    llm_response = await execute_skill("problem_selector", context, db)
    if llm_response:
        # Extract just the selection reason (LLM may return more)
        lines = llm_response.strip().split("\n")
        # Take first non-empty line or first ~200 chars
        reason = lines[0].strip() if lines else llm_response[:200]
        return reason

    return None  # Caller uses template fallback


# ─── Coaching Profile Analysis ────────────────────────────────────────────────

async def analyze_coaching_profile(
    user_id: str,
    db: AsyncSession,
) -> Optional[dict]:
    """
    Analyze all session data for a user and generate an updated coaching profile.
    Uses the coaching_profiler skill.
    """
    # Gather all sessions for this user
    sessions_result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id)
        .order_by(Session.created_at.desc())
        .limit(20)
    )
    sessions = sessions_result.scalars().all()
    if not sessions:
        return None

    # Get user
    u_result = await db.execute(select(User).where(User.id == user_id))
    user = u_result.scalar_one_or_none()
    if not user:
        return None

    # Get current profile
    cp_result = await db.execute(
        select(CoachingProfile).where(CoachingProfile.user_id == user_id)
    )
    current_profile = cp_result.scalar_one_or_none()

    # Build session summaries
    session_summaries = []
    for s in sessions:
        p_result = await db.execute(select(Problem).where(Problem.id == s.problem_id))
        prob = p_result.scalar_one_or_none()
        session_summaries.append({
            "problem": prob.title if prob else "Unknown",
            "topic": prob.topic if prob else "unknown",
            "difficulty": prob.difficulty if prob else "unknown",
            "score": s.score,
            "status": s.status,
            "hints_used": s.hints_used,
            "explanation_helpful": s.explanation_helpful,
            "language": s.language,
        })

    context = {
        "user_profile": json.dumps({
            "experience_level": user.experience_level,
            "sessions_completed": len(sessions),
        }),
        "session_history": json.dumps(session_summaries),
        "current_profile": json.dumps({
            "thinking_patterns": current_profile.thinking_patterns if current_profile else "[]",
            "common_mistakes": current_profile.common_mistakes if current_profile else "[]",
            "struggle_patterns": current_profile.struggle_patterns if current_profile else "[]",
        }) if current_profile else "No existing profile — first analysis.",
        "instruction": (
            "Analyze the session history and return a JSON object with: "
            "thinking_patterns (array of strings), common_mistakes (array of strings), "
            "preferred_style (string), style_weights (object mapping style→float 1-5), "
            "success_areas (array of strings), struggle_areas (array of strings), "
            "recommendations (array of strings). Be specific and data-driven."
        ),
    }

    llm_response = await execute_skill("coaching_profiler", context, db)
    if not llm_response:
        return None

    # Try to parse JSON from response
    try:
        # Find JSON block in response
        json_match = re.search(r'\{[\s\S]*\}', llm_response)
        if json_match:
            return json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        logger.warning(f"Could not parse coaching profile JSON from LLM response")

    return None


# ─── Self-Improvement Loop ────────────────────────────────────────────────────

async def check_and_improve(user_id: str, db: AsyncSession) -> list[str]:
    """
    Check if any skills should be improved based on session count.
    If threshold is met, trigger LLM-powered skill rewrite.

    Returns list of skill names that were improved.
    """
    if not is_auto_improve_enabled():
        return []

    if not get_api_key():
        return []

    threshold = get_improvement_threshold()

    # Count total sessions
    count_result = await db.execute(
        select(func.count(Session.id)).where(Session.user_id == user_id)
    )
    total_sessions = count_result.scalar() or 0

    if total_sessions == 0 or total_sessions % threshold != 0:
        return []

    trigger_prefix = f"Auto-improvement at {total_sessions} sessions (user {user_id[:8]})"
    existing_result = await db.execute(
        select(SkillVersion).where(SkillVersion.triggered_by == trigger_prefix)
    )
    if existing_result.scalars().first():
        logger.info(f"Improvement already recorded for {trigger_prefix}")
        return []

    logger.info(f"Improvement trigger at {total_sessions} sessions for user {user_id}")

    improved = []
    skill_names = ["solution_reviewer", "coaching_profiler", "problem_selector"]

    for skill_name in skill_names:
        success = await improve_skill(skill_name, user_id, db)
        if success:
            improved.append(skill_name)

    return improved


async def improve_skill(
    skill_name: str,
    user_id: str,
    db: AsyncSession,
) -> bool:
    """
    Self-improvement: Use the LLM to rewrite a skill file based on
    accumulated session performance data.

    The LLM reads the current skill, sees what worked and what didn't,
    and produces an improved version.
    """
    # Get current skill
    current_content, current_version = await get_skill_content(skill_name, db)
    if not current_content:
        logger.warning(f"Cannot improve {skill_name}: no content found")
        return False

    # Gather performance data
    sessions_result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id)
        .order_by(Session.created_at.desc())
        .limit(30)
    )
    sessions = sessions_result.scalars().all()

    # Build performance summary
    scores = [s.score for s in sessions if s.score is not None]
    ratings = [s.explanation_helpful for s in sessions if s.explanation_helpful is not None]
    statuses = [s.status for s in sessions]

    performance = {
        "total_sessions": len(sessions),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "score_trend": scores[:5] if scores else [],
        "average_helpfulness_rating": round(sum(ratings) / len(ratings), 1) if ratings else 0,
        "solve_rate": round(statuses.count("solved") / len(statuses) * 100, 1) if statuses else 0,
        "skip_rate": round(statuses.count("skipped") / len(statuses) * 100, 1) if statuses else 0,
        "low_score_count": sum(1 for s in scores if s < 50),
        "high_score_count": sum(1 for s in scores if s >= 80),
    }

    # Meta-prompt: ask LLM to rewrite the skill
    system_prompt = (
        "You are a skill improvement engine for PrepPilot, an AI interview coaching system.\n"
        "Your job is to analyze a skill file and its performance data, then produce an improved version.\n\n"
        "Rules:\n"
        "1. Keep the same markdown structure and sections\n"
        "2. Increment the version number (e.g., 1.0 → 1.1)\n"
        "3. Add a new entry to the improvement_log section\n"
        "4. Make specific, data-driven improvements based on the performance data\n"
        "5. Do NOT change the skill name or purpose\n"
        "6. Return ONLY the complete updated skill file in markdown"
    )

    user_prompt = (
        f"## Current Skill File (v{current_version})\n"
        f"```markdown\n{current_content}\n```\n\n"
        f"## Performance Data Since Last Improvement\n"
        f"```json\n{json.dumps(performance, indent=2)}\n```\n\n"
        f"## Task\n"
        f"Analyze the performance data and improve this skill file. "
        f"Focus on areas where the data shows weakness:\n"
        f"- If solve_rate is low, improve the evaluation criteria\n"
        f"- If helpfulness ratings are low, improve the feedback generation\n"
        f"- If there are many low scores, adjust the scoring rubric\n"
        f"- If skip_rate is high, improve problem engagement\n\n"
        f"Return the complete updated skill file."
    )

    improved_content = await _call_llm(system_prompt, user_prompt, temperature=0.4, max_tokens=2000)
    if not improved_content:
        return False

    # Clean up: extract markdown content if wrapped in code blocks
    improved_content = improved_content.strip()
    if improved_content.startswith("```markdown"):
        improved_content = improved_content[len("```markdown"):].strip()
    if improved_content.startswith("```"):
        improved_content = improved_content[3:].strip()
    if improved_content.endswith("```"):
        improved_content = improved_content[:-3].strip()

    # Determine new version
    try:
        major, minor = current_version.split(".")
        new_version = f"{major}.{int(minor) + 1}"
    except (ValueError, IndexError):
        new_version = f"{current_version}.1"

    # Build improvement log entry
    improvement_log = (
        f"v{new_version}: Auto-improved based on {performance['total_sessions']} sessions. "
        f"Avg score: {performance['average_score']}, "
        f"Solve rate: {performance['solve_rate']}%, "
        f"Helpfulness: {performance['average_helpfulness_rating']}/5."
    )

    triggered_by = f"Auto-improvement at {performance['total_sessions']} sessions (user {user_id[:8]})"

    await save_skill_version(
        skill_name=skill_name,
        version=new_version,
        content=improved_content,
        improvement_log=improvement_log,
        triggered_by=triggered_by,
        db=db,
    )

    logger.info(f"🧠 Skill {skill_name} improved: v{current_version} → v{new_version}")
    return True


# ─── Heuristic Fallbacks ──────────────────────────────────────────────────────

def _heuristic_review(session: Session, problem: Problem, user: Optional[User]) -> dict:
    """Heuristic review when LLM is unavailable. Basic pattern-matching scorer."""
    solution = session.user_solution or ""
    lines = solution.strip().split("\n")

    correctness = 28
    complexity = 20
    edge_cases = 12
    style = 6

    if len(lines) < 3:
        correctness = 10
    if any(kw in solution.lower() for kw in ["if not", "if len", "is none", "== 0"]):
        edge_cases = 16
    if any(l.strip().startswith("#") or l.strip().startswith("//") for l in lines):
        style = 8

    diff_bonus = {"easy": 10, "medium": 5, "hard": 0}.get(problem.difficulty, 5)
    correctness = min(40, correctness + diff_bonus)
    total = correctness + complexity + edge_cases + style

    breakdown = {"correctness": correctness, "complexity": complexity, "edge_cases": edge_cases, "style": style}

    c_ok = "✅" if correctness >= 30 else "⚠️"
    e_ok = "✅" if edge_cases >= 15 else "⚠️"
    quality = "solid" if total >= 70 else "developing"

    feedback = (
        f"Score: {total}/100\n\n"
        f"{c_ok} Correctness: {correctness}/40 — {'Good coverage' if correctness >= 30 else 'Some cases may fail'}\n"
        f"📈 Complexity: {complexity}/30 — Target: {problem.time_complexity or 'N/A'}\n"
        f"{e_ok} Edge Cases: {edge_cases}/20 — {'Edge checks detected' if edge_cases >= 15 else 'Add edge case checks'}\n"
        f"✨ Style: {style}/10 — {'Clean code' if style >= 7 else 'Add comments and descriptive names'}\n\n"
        f"Your solution shows a {quality} understanding of {problem.topic}.\n\n"
        f"Next step: {'Try a harder variant.' if total >= 70 else 'Focus on edge case handling.'}"
    )

    return {"score": total, "breakdown": breakdown, "feedback": feedback}


def _parse_scores(feedback: str) -> tuple[int, dict]:
    """Parse scores from formatted AI feedback."""
    breakdown = {"correctness": 25, "complexity": 20, "edge_cases": 12, "style": 6}
    patterns = {
        "correctness": r"Correctness:?\s*(\d+)/40",
        "complexity": r"Complexity:?\s*(\d+)/30",
        "edge_cases": r"Edge Cases:?\s*(\d+)/20",
        "style": r"Style:?\s*(\d+)/10",
    }
    for key, pattern in patterns.items():
        match = re.search(pattern, feedback, re.IGNORECASE)
        if match:
            breakdown[key] = int(match.group(1))

    total = sum(breakdown.values())
    total_match = re.search(r"Score:?\s*(\d+)/100", feedback, re.IGNORECASE)
    if total_match:
        total = int(total_match.group(1))
    return total, breakdown


def _fallback_review() -> dict:
    """Absolute fallback when even the problem can't be found."""
    return {
        "score": 50,
        "breakdown": {"correctness": 20, "complexity": 15, "edge_cases": 10, "style": 5},
        "feedback": "Score: 50/100\n\nUnable to fully review. Please try again.",
    }


# ─── Initialization ──────────────────────────────────────────────────────────

async def initialize(db: AsyncSession):
    """
    Initialize Hermes Agent on startup:
    - Load config
    - Ensure all skill files have at least v1.0 in the database
    """
    load_config()

    skill_names = ["problem_selector", "solution_reviewer", "coaching_profiler"]
    for skill_name in skill_names:
        result = await db.execute(
            select(SkillVersion).where(SkillVersion.skill_name == skill_name)
        )
        existing = result.scalars().first()
        if not existing:
            content, version = await get_skill_content(skill_name, db)
            if content:
                await save_skill_version(
                    skill_name=skill_name,
                    version=version,
                    content=content,
                    improvement_log=f"v{version}: Initial version loaded from disk.",
                    triggered_by="System initialization",
                    db=db,
                )

    api_status = "hosted LLM connected" if get_api_key() else "Hermes heuristic mode (no hosted LLM key)"
    logger.info(f"Hermes Agent initialized: model={get_model_name()}, llm={api_status}")
