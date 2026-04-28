"""
IronID — User model.
Mirror of Clerk users with plan and billing information.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def is_trial_active(trial_ends_at: datetime | None) -> bool:
    """Return True if the trial has not yet expired."""
    if trial_ends_at is None:
        return False
    from datetime import timezone
    return datetime.now(timezone.utc) < trial_ends_at


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    clerk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="free",
        server_default="free",
    )
    paypal_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    paypal_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    affiliate_code: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    referred_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    monthly_signatures_used: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    monthly_signatures_limit: Mapped[int] = mapped_column(Integer, default=10, server_default="10")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    trial_ends_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "plan IN ('free', 'payg', 'individual', 'studio', 'enterprise')",
            name="ck_users_plan",
        ),
    )

    # Relationships
    api_keys: Mapped[list["APIKey"]] = relationship(  # noqa: F821
        "APIKey", back_populates="user", cascade="all, delete-orphan"
    )
    certifications: Mapped[list["Certification"]] = relationship(  # noqa: F821
        "Certification", back_populates="user"
    )
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(  # noqa: F821
        "LedgerEntry", back_populates="user"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} plan={self.plan}>"
