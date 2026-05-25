"""Hermes connectivity and runtime status router."""
import os
import subprocess

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import DATABASE_URL, get_db
from backend.models.skill import CoachingProfile, SkillVersion, UserTopicStat
from backend.services import hermes_agent

router = APIRouter()


@router.get("/status")
async def hermes_status(db: AsyncSession = Depends(get_db)):
    """Report how this local app is connected to PrepPilot's Hermes layer."""
    app_mode = "local"
    openrouter_connected = bool(hermes_agent.get_api_key())
    telegram_configured = bool(os.getenv("TELEGRAM_BOT_TOKEN", "").strip()) and "your_" not in os.getenv("TELEGRAM_BOT_TOKEN", "")
    wsl_hermes = _get_wsl_hermes_status()

    skill_result = await db.execute(select(SkillVersion).order_by(SkillVersion.created_at.desc()))
    skills = {}
    for skill in skill_result.scalars().all():
        if skill.skill_name not in skills:
            skills[skill.skill_name] = skill.version

    profile_count = (await db.execute(select(func.count()).select_from(CoachingProfile))).scalar() or 0
    topic_stat_count = (await db.execute(select(func.count()).select_from(UserTopicStat))).scalar() or 0

    missing = []
    if not wsl_hermes["connected"]:
        missing.append(wsl_hermes["message"])

    return {
        "mode": app_mode,
        "backend": "connected",
        "database": {
            "url_kind": "sqlite" if DATABASE_URL.startswith("sqlite") else "external",
            "memory_ready": profile_count > 0 or topic_stat_count > 0,
            "coaching_profiles": profile_count,
            "topic_stats": topic_stat_count,
        },
        "skills": skills,
        "hosted_inference": {
            "provider": "openrouter",
            "connected": openrouter_connected,
            "model": hermes_agent.get_model_name(),
            "mode": "hosted_llm" if openrouter_connected else "heuristic",
        },
        "telegram": {
            "configured": telegram_configured,
            "mode": "configured" if telegram_configured else "off_for_event_build",
        },
        "wsl_hermes": wsl_hermes,
        "status": "misconfigured" if missing else "healthy",
        "issues": missing,
    }


def _get_wsl_hermes_status() -> dict:
    """Check the local WSL Hermes CLI without making it required for reviews."""
    distro = os.getenv("HERMES_WSL_DISTRO", "Ubuntu")
    expected_path = os.getenv("HERMES_WSL_COMMAND", "/home/sreej/.local/bin/hermes")
    timeout_seconds = float(os.getenv("HERMES_WSL_TIMEOUT_SECONDS", "30"))
    base = {
        "runtime": "wsl",
        "distro": distro,
        "command_path": expected_path,
        "version": None,
        "connected": False,
        "message": "WSL Hermes CLI is not connected.",
    }

    try:
        result = subprocess.run(
            [
                "wsl.exe",
                "-d",
                distro,
                "--",
                "bash",
                "-lc",
                "command -v hermes && timeout 12s hermes --version 2>/dev/null",
            ],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    except FileNotFoundError:
        base["message"] = "wsl.exe was not found on this machine."
        return base
    except subprocess.TimeoutExpired:
        base["message"] = f"WSL Hermes check timed out for distro {distro} after {timeout_seconds:g}s."
        return base
    except Exception as exc:
        base["message"] = f"WSL Hermes check failed: {exc}"
        return base

    output = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if result.returncode != 0 or not output:
        detail = (result.stderr or result.stdout or "").strip()
        base["message"] = detail or f"Hermes CLI was not found in WSL distro {distro}."
        return base

    command_path = output[0]
    version = next((line for line in output[1:] if "Hermes" in line), output[1] if len(output) > 1 else "Hermes CLI detected")
    base.update(
        {
            "command_path": command_path,
            "version": version,
            "connected": True,
            "message": "WSL Hermes CLI connected.",
        }
    )
    return base
