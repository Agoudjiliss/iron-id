"""
IronID — Enterprise Feedback model.
Stores structured feedback from enterprise trial clients.
"""

from datetime import datetime

import uuid as uuid_module
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class EnterpriseFeedback(Base):
    __tablename__ = "enterprise_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid_module.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)           # 1–5
    performance_score: Mapped[int | None] = mapped_column(Integer, nullable=True) # 1–5
    message: Mapped[str] = mapped_column(Text, nullable=False)
    use_case: Mapped[str | None] = mapped_column(String(100), nullable=True)
    volume_estimate: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ready_to_sign: Mapped[bool] = mapped_column(Boolean, server_default="false")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<EnterpriseFeedback id={self.id} email={self.email}>"
