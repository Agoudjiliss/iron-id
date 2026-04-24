"""
IronID — API Key model.
Keys are hashed with bcrypt before storage; only the prefix is stored in plain text.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g. "iid_live_ab12"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="api_keys")  # noqa: F821
    certifications: Mapped[list["Certification"]] = relationship(  # noqa: F821
        "Certification", back_populates="api_key"
    )

    def __repr__(self) -> str:
        return f"<APIKey id={self.id} prefix={self.key_prefix} active={self.is_active}>"
