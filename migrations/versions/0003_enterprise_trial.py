"""Add enterprise trial support: trial_ends_at on users, feedback table.

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-26
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add trial_ends_at to users
    op.add_column(
        "users",
        sa.Column("trial_ends_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create enterprise_feedback table
    op.create_table(
        "enterprise_feedback",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),          # 1–5
        sa.Column("performance_score", sa.Integer(), nullable=True),  # 1–5
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("use_case", sa.String(100), nullable=True),
        sa.Column("volume_estimate", sa.String(100), nullable=True),
        sa.Column("ready_to_sign", sa.Boolean(), server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index("ix_enterprise_feedback_email", "enterprise_feedback", ["email"])
    op.create_index("ix_enterprise_feedback_created_at", "enterprise_feedback", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_enterprise_feedback_created_at", table_name="enterprise_feedback")
    op.drop_index("ix_enterprise_feedback_email", table_name="enterprise_feedback")
    op.drop_table("enterprise_feedback")
    op.drop_column("users", "trial_ends_at")
