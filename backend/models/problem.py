"""Problem model — the full problem bank with progressive hints."""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, ForeignKey, String, Text, DateTime

from backend.database import Base


class Problem(Base):
    __tablename__ = "problems"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    external_id = Column(String)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    difficulty = Column(String, nullable=False)  # easy | medium | hard
    topic = Column(String, nullable=False, index=True)
    sub_topic = Column(String)
    description = Column(Text, nullable=False)
    examples = Column(Text)        # JSON string
    constraints = Column(Text)     # JSON string
    hints = Column(Text)           # JSON array — progressive hints
    solution_approach = Column(Text)
    time_complexity = Column(String)
    space_complexity = Column(String)
    source_url = Column(String)
    tags = Column(Text)            # JSON string
    owner_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Problem {self.title} [{self.difficulty}]>"
