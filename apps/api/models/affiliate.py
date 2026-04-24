"""
IronID — Affiliate Commission model.
Tracks referral commissions with status lifecycle (pending → paid).
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class AffiliateCommission(Base):
    __tablename__ = "affiliate_commissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    affiliate_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    referred_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    paypal_capture_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    commission_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    commission_rate: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending", nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'paid', 'cancelled')",
            name="ck_affiliate_commissions_status",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<AffiliateCommission id={self.id} "
            f"amount={self.commission_cents}c status={self.status}>"
        )
