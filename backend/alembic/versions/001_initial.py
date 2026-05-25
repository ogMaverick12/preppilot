"""001_initial — Create all PrepPilot tables.

Revision ID: 001
Create Date: 2026-05-18
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("telegram_id", sa.String(), unique=True, nullable=False),
        sa.Column("telegram_username", sa.String()),
        sa.Column("experience_level", sa.String(), nullable=False),
        sa.Column("target_companies", sa.String()),
        sa.Column("weak_areas", sa.String()),
        sa.Column("daily_time_budget", sa.Integer(), default=60),
        sa.Column("preferred_time", sa.String(), default="08:00"),
        sa.Column("timezone", sa.String(), default="UTC"),
        sa.Column("explanation_style", sa.String(), default="balanced"),
        sa.Column("onboarding_complete", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime()),
        sa.Column("updated_at", sa.DateTime()),
    )

    op.create_table(
        "problems",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("external_id", sa.String()),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), unique=True, nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("sub_topic", sa.String()),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("examples", sa.Text()),
        sa.Column("constraints", sa.Text()),
        sa.Column("hints", sa.Text()),
        sa.Column("solution_approach", sa.Text()),
        sa.Column("time_complexity", sa.String()),
        sa.Column("space_complexity", sa.String()),
        sa.Column("source_url", sa.String()),
        sa.Column("tags", sa.Text()),
        sa.Column("created_at", sa.DateTime()),
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("problem_id", sa.String(), sa.ForeignKey("problems.id"), nullable=False),
        sa.Column("user_solution", sa.Text()),
        sa.Column("language", sa.String()),
        sa.Column("hermes_feedback", sa.Text()),
        sa.Column("score", sa.Integer()),
        sa.Column("score_breakdown", sa.String()),
        sa.Column("time_taken_minutes", sa.Integer()),
        sa.Column("status", sa.String(), default="sent"),
        sa.Column("difficulty_felt", sa.String()),
        sa.Column("explanation_helpful", sa.Integer()),
        sa.Column("hints_used", sa.Integer(), default=0),
        sa.Column("attempt_number", sa.Integer(), default=1),
        sa.Column("selected_by_skill_version", sa.String()),
        sa.Column("created_at", sa.DateTime()),
    )

    op.create_table(
        "skill_versions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("skill_name", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("improvement_log", sa.Text()),
        sa.Column("triggered_by", sa.String()),
        sa.Column("created_at", sa.DateTime()),
    )

    op.create_table(
        "coaching_profiles",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), unique=True, nullable=False),
        sa.Column("thinking_patterns", sa.Text()),
        sa.Column("common_mistakes", sa.Text()),
        sa.Column("explanation_style_weights", sa.Text()),
        sa.Column("successful_problem_types", sa.Text()),
        sa.Column("struggle_patterns", sa.Text()),
        sa.Column("last_updated", sa.DateTime()),
    )

    op.create_table(
        "user_topic_stats",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("attempts", sa.Integer(), default=0),
        sa.Column("solved", sa.Integer(), default=0),
        sa.Column("skipped", sa.Integer(), default=0),
        sa.Column("average_score", sa.Float(), default=0),
        sa.Column("current_difficulty", sa.String(), default="easy"),
        sa.Column("improvement_rate", sa.Float(), default=0),
        sa.Column("last_practiced", sa.DateTime()),
        sa.Column("next_review", sa.DateTime()),
    )


def downgrade():
    op.drop_table("user_topic_stats")
    op.drop_table("coaching_profiles")
    op.drop_table("skill_versions")
    op.drop_table("sessions")
    op.drop_table("problems")
    op.drop_table("users")
