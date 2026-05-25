"""User model — stores user profile and coaching preferences."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    # Auth provider fields
    auth_provider = Column(String, default="telegram")  # telegram | github | google | demo | local
    email = Column(String, unique=True, nullable=True, index=True)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    password_salt = Column(String, nullable=True)
    # Telegram-specific (nullable for OAuth users)
    telegram_id = Column(String, unique=True, nullable=True, index=True)
    telegram_username = Column(String, nullable=True)
    # Coaching preferences
    experience_level = Column(String, nullable=False, default="intermediate")
    target_companies = Column(String)   # JSON array string
    weak_areas = Column(String)         # JSON array string
    daily_time_budget = Column(Integer, default=60)
    preferred_time = Column(String, default="08:00")
    timezone = Column(String, default="UTC")
    explanation_style = Column(String, default="balanced")
    notification_preferences = Column(Text, default='{"daily_problems":true,"weekly_reports":true,"streak_alerts":true}')
    developer_role = Column(String, default="student")
    primary_stack = Column(String, default="python")
    target_track = Column(String, default="interviews")
    assessment_status = Column(String, default="required")  # required | in_progress | complete
    assessment_completed_sessions = Column(Integer, default=0)
    hermes_level = Column(String, default="uncalibrated")
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.display_name or self.telegram_username or self.email or self.id[:8]}>"
