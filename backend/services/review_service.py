"""
Review Service — Delegates solution review to the Hermes Agent.
================================================================
This service is now a thin wrapper that routes review requests
through hermes_agent.execute_skill("solution_reviewer").
The skill file content becomes the system prompt for the LLM.
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.session import Session
from backend.services import hermes_agent

logger = logging.getLogger(__name__)


async def review_solution(session: Session, db: AsyncSession) -> dict:
    """
    Review a user's submitted solution.
    All intelligence is delegated to the Hermes Agent.
    """
    return await hermes_agent.review_solution(session, db)
