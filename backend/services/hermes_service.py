"""
Hermes Service — Backward-compatible wrapper around hermes_agent.
=================================================================
All actual agent logic now lives in hermes_agent.py.
This module exists for backward compatibility with any code that imports from it.
"""
from backend.services.hermes_agent import (
    get_skill_content as get_current_skill_version_content,
    save_skill_version,
    check_and_improve as check_improvement_trigger_and_improve,
    initialize as initialize_skills_from_agent,
)
from backend.services import hermes_agent

# Re-export for backward compatibility
get_current_skill_version = hermes_agent.get_skill_content
initialize_skills = hermes_agent.initialize
