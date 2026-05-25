"""003_solve_workspace_auth_profile — Local auth, profiles, and custom problems.

Revision ID: 003
Revises: 002
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))
    op.add_column("users", sa.Column("password_salt", sa.String(), nullable=True))
    op.add_column("users", sa.Column("developer_role", sa.String(), server_default="student"))
    op.add_column("users", sa.Column("primary_stack", sa.String(), server_default="python"))
    op.add_column("users", sa.Column("target_track", sa.String(), server_default="interviews"))
    op.add_column("users", sa.Column("assessment_status", sa.String(), server_default="required"))
    op.add_column("users", sa.Column("assessment_completed_sessions", sa.Integer(), server_default="0"))
    op.add_column("users", sa.Column("hermes_level", sa.String(), server_default="uncalibrated"))

    op.add_column("problems", sa.Column("owner_user_id", sa.String(), nullable=True))
    op.add_column("problems", sa.Column("is_custom", sa.Boolean(), server_default=sa.false()))
    op.create_index("ix_problems_owner_user_id", "problems", ["owner_user_id"])


def downgrade():
    op.drop_index("ix_problems_owner_user_id", table_name="problems")
    op.drop_column("problems", "is_custom")
    op.drop_column("problems", "owner_user_id")
    op.drop_column("users", "hermes_level")
    op.drop_column("users", "assessment_completed_sessions")
    op.drop_column("users", "assessment_status")
    op.drop_column("users", "target_track")
    op.drop_column("users", "primary_stack")
    op.drop_column("users", "developer_role")
    op.drop_column("users", "password_salt")
    op.drop_column("users", "password_hash")
