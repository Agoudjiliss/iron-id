"""Replace Stripe billing columns with PayPal equivalents.

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-24
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename stripe_* columns to paypal_*
    op.alter_column("users", "stripe_customer_id",     new_column_name="paypal_customer_id")
    op.alter_column("users", "stripe_subscription_id", new_column_name="paypal_subscription_id")

    # Add PayPal-specific columns for billing state tracking
    op.add_column(
        "users",
        sa.Column("paypal_plan_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("subscription_status", sa.String(50), nullable=True),
    )

    # Add billing_period_end for subscription expiry tracking
    op.add_column(
        "users",
        sa.Column(
            "billing_period_end",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Update affiliate_commissions: rename stripe_payment_id → paypal_capture_id
    op.alter_column(
        "affiliate_commissions",
        "stripe_payment_id",
        new_column_name="paypal_capture_id",
    )


def downgrade() -> None:
    op.alter_column("affiliate_commissions", "paypal_capture_id", new_column_name="stripe_payment_id")
    op.drop_column("users", "billing_period_end")
    op.drop_column("users", "subscription_status")
    op.drop_column("users", "paypal_plan_id")
    op.alter_column("users", "paypal_subscription_id", new_column_name="stripe_subscription_id")
    op.alter_column("users", "paypal_customer_id",     new_column_name="stripe_customer_id")
