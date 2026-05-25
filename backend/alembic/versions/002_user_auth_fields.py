"""002_user_auth_fields — Add OAuth/demo user fields.

Revision ID: 002
Revises: 001
Create Date: 2026-05-21
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("auth_provider", sa.String(), server_default="telegram"))
    op.add_column("users", sa.Column("email", sa.String(), nullable=True))
    op.add_column("users", sa.Column("display_name", sa.String(), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "notification_preferences",
            sa.Text(),
            server_default='{"daily_problems":true,"weekly_reports":true,"streak_alerts":true}',
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)


def downgrade():
    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "notification_preferences")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "display_name")
    op.drop_column("users", "email")
    op.drop_column("users", "auth_provider")
