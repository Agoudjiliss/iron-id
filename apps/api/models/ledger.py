"""
IronID — Ledger Entry model.
Append-only immutable table. No UPDATE or DELETE operations are ever performed.
PostgreSQL Row-Level Security enforces this at the DB level (see migration).
"""

from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from database import Base


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    certification_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("certifications.id"), nullable=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    file_hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv4 or IPv6
    actor_user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # NOTE: No updated_at — this table is immutable by design.

    __table_args__ = (
        CheckConstraint(
            "event_type IN ('certified', 'verified', 'revoked')",
            name="ck_ledger_event_type",
        ),
        Index("idx_ledger_hash", "file_hash_sha256"),
    )

    # Relationships (read-only context)
    certification: Mapped["Certification"] = relationship(  # noqa: F821
        "Certification", back_populates="ledger_entries"
    )
    user: Mapped["User"] = relationship("User", back_populates="ledger_entries")  # noqa: F821

    def __repr__(self) -> str:
        return f"<LedgerEntry id={self.id} event={self.event_type} hash={self.file_hash_sha256[:8]}...>"
