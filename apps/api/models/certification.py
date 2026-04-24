"""
IronID — Certification model.
Represents a file certification request and its lifecycle.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    api_key_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=True
    )
    file_hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    file_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    file_mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    c2pa_manifest: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    c2pa_signature: Mapped[str | None] = mapped_column(String(500), nullable=True)
    certified_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending", nullable=False
    )
    metadata_: Mapped[dict] = mapped_column(
        "metadata", JSONB, default=dict, server_default="{}"
    )
    webhook_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    webhook_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'processing', 'certified', 'failed')",
            name="ck_certifications_status",
        ),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="certifications")  # noqa: F821
    api_key: Mapped["APIKey"] = relationship("APIKey", back_populates="certifications")  # noqa: F821
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship(  # noqa: F821
        "LedgerEntry", back_populates="certification"
    )
    webhook_logs: Mapped[list["WebhookLog"]] = relationship(  # noqa: F821
        "WebhookLog", back_populates="certification"
    )

    def __repr__(self) -> str:
        return f"<Certification id={self.id} status={self.status} hash={self.file_hash_sha256[:8]}...>"
