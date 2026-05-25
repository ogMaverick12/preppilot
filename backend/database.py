"""
PrepPilot — Async database engine and session factory.
Uses SQLite with aiosqlite for local development.
"""
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATABASE_DIR, exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{os.path.join(DATABASE_DIR, 'prep_pilot.db')}"
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables. Called once on startup."""
    async with engine.begin() as conn:
        from backend.models import user, problem, session, skill  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
        if DATABASE_URL.startswith("sqlite"):
            await _ensure_sqlite_schema(conn)


async def _ensure_sqlite_schema(conn):
    """Patch older local SQLite DBs created before local auth/profile fields existed."""
    result = await conn.execute(text("PRAGMA table_info(users)"))
    existing = {row[1] for row in result.fetchall()}
    columns = {
        "auth_provider": "VARCHAR DEFAULT 'telegram'",
        "email": "VARCHAR",
        "display_name": "VARCHAR",
        "avatar_url": "VARCHAR",
        "password_hash": "VARCHAR",
        "password_salt": "VARCHAR",
        "notification_preferences": "TEXT DEFAULT '{\"daily_problems\":true,\"weekly_reports\":true,\"streak_alerts\":true}'",
        "developer_role": "VARCHAR DEFAULT 'student'",
        "primary_stack": "VARCHAR DEFAULT 'python'",
        "target_track": "VARCHAR DEFAULT 'interviews'",
        "assessment_status": "VARCHAR DEFAULT 'required'",
        "assessment_completed_sessions": "INTEGER DEFAULT 0",
        "hermes_level": "VARCHAR DEFAULT 'uncalibrated'",
    }
    for name, definition in columns.items():
        if name not in existing:
            await conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {name} {definition}")

    await conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)")
    await conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_users_telegram_id ON users (telegram_id)")

    result = await conn.execute(text("PRAGMA table_info(problems)"))
    problem_existing = {row[1] for row in result.fetchall()}
    problem_columns = {
        "owner_user_id": "VARCHAR",
        "is_custom": "BOOLEAN DEFAULT 0",
    }
    for name, definition in problem_columns.items():
        if name not in problem_existing:
            await conn.exec_driver_sql(f"ALTER TABLE problems ADD COLUMN {name} {definition}")

    await conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_problems_owner_user_id ON problems (owner_user_id)")
