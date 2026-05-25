"""Skill models — Hermes skill versioning, coaching profiles, and per-topic stats."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey

from backend.database import Base


class SkillVersion(Base):
    """Tracks every version of every Hermes skill file."""
    __tablename__ = "skill_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    skill_name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    improvement_log = Column(Text)
    triggered_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SkillVersion {self.skill_name} v{self.version}>"


class CoachingProfile(Base):
    """Deepening model of the user's thinking patterns built by Hermes."""
    __tablename__ = "coaching_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    thinking_patterns = Column(Text)            # JSON
    common_mistakes = Column(Text)              # JSON
    explanation_style_weights = Column(Text)    # JSON
    successful_problem_types = Column(Text)     # JSON
    struggle_patterns = Column(Text)            # JSON
    last_updated = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CoachingProfile user={self.user_id[:8]}>"


class UserTopicStat(Base):
    """Per-topic performance statistics for spaced repetition and problem selection."""
    __tablename__ = "user_topic_stats"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    topic = Column(String, nullable=False)
    attempts = Column(Integer, default=0)
    solved = Column(Integer, default=0)
    skipped = Column(Integer, default=0)
    average_score = Column(Float, default=0)
    current_difficulty = Column(String, default="easy")
    improvement_rate = Column(Float, default=0)
    last_practiced = Column(DateTime)
    next_review = Column(DateTime)

    def __repr__(self):
        return f"<UserTopicStat {self.topic} avg={self.average_score}>"
