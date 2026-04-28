"""
IronID — Coupon and CouponRedemption models.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), nullable=False, default="individual")
    # Extra signatures granted; -1 = unlimited
    signatures_bonus: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Duration in days (None = permanent)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Max total redemptions (None = unlimited)
    max_uses: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    redemptions: Mapped[list["CouponRedemption"]] = relationship(
        "CouponRedemption", back_populates="coupon", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Coupon code={self.code} plan={self.plan}>"


class CouponRedemption(Base):
    __tablename__ = "coupon_redemptions"
    __table_args__ = (
        UniqueConstraint("coupon_id", "user_id", name="uq_coupon_redemptions_coupon_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    coupon_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("coupons.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    redeemed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    plan_granted: Mapped[str] = mapped_column(String(50), nullable=False)
    grant_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    coupon: Mapped["Coupon"] = relationship("Coupon", back_populates="redemptions")
    user: Mapped["User"] = relationship("User")  # noqa: F821

    def __repr__(self) -> str:
        return f"<CouponRedemption coupon={self.coupon_id} user={self.user_id}>"
