"""Add coupons and coupon_redemptions tables.

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-28
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "coupons",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("code", sa.String(50), nullable=False, unique=True),
        # Plan to grant when coupon is redeemed
        sa.Column("plan", sa.String(50), nullable=False, server_default="individual"),
        # Extra monthly signatures granted (on top of plan default). -1 = unlimited.
        sa.Column("signatures_bonus", sa.Integer(), nullable=False, server_default="0"),
        # How many days the plan grant lasts (NULL = permanent)
        sa.Column("duration_days", sa.Integer(), nullable=True),
        # Maximum number of times this coupon can be redeemed (NULL = unlimited)
        sa.Column("max_uses", sa.Integer(), nullable=True),
        # Optional expiry for the coupon itself
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_coupons_code", "coupons", ["code"], unique=True)
    op.create_index("ix_coupons_is_active", "coupons", ["is_active"])

    op.create_table(
        "coupon_redemptions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "coupon_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("coupons.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "redeemed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        # Plan granted, stored so it survives coupon edits
        sa.Column("plan_granted", sa.String(50), nullable=False),
        sa.Column("grant_expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_coupon_redemptions_coupon_id", "coupon_redemptions", ["coupon_id"]
    )
    op.create_index(
        "ix_coupon_redemptions_user_id", "coupon_redemptions", ["user_id"]
    )
    # Prevent a user from redeeming the same coupon twice
    op.create_unique_constraint(
        "uq_coupon_redemptions_coupon_user",
        "coupon_redemptions",
        ["coupon_id", "user_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_coupon_redemptions_coupon_user", "coupon_redemptions", type_="unique"
    )
    op.drop_index("ix_coupon_redemptions_user_id", table_name="coupon_redemptions")
    op.drop_index("ix_coupon_redemptions_coupon_id", table_name="coupon_redemptions")
    op.drop_table("coupon_redemptions")

    op.drop_index("ix_coupons_is_active", table_name="coupons")
    op.drop_index("ix_coupons_code", table_name="coupons")
    op.drop_table("coupons")
