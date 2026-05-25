"""Session model — tracks every practice session between user and problem."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey

from backend.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    problem_id = Column(String, ForeignKey("problems.id"), nullable=False)
    user_solution = Column(Text)
    language = Column(String)
    hermes_feedback = Column(Text)
    score = Column(Integer)
    score_breakdown = Column(String)   # JSON: {correctness, complexity, style, edge_cases}
    time_taken_minutes = Column(Integer)
    status = Column(String, default="sent")  # sent | attempted | solved | skipped
    difficulty_felt = Column(String)   # too_easy | right | too_hard
    explanation_helpful = Column(Integer)  # 1-5
    hints_used = Column(Integer, default=0)
    attempt_number = Column(Integer, default=1)
    selected_by_skill_version = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Session {self.id[:8]} score={self.score} status={self.status}>"
