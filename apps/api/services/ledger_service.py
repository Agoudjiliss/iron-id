"""
IronID — Ledger Service.

Manages the append-only provenance ledger.
This table is immutable by design: no UPDATE or DELETE operations are ever issued.
PostgreSQL RLS enforces this at the database level (see migration 0001).

Event types:
  - 'certified' : A file was successfully certified.
  - 'verified'  : A file's certification was looked up (by anyone).
  - 'revoked'   : A certification was administratively revoked.
"""

import uuid
from datetime import datetime

import structlog
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.certification import Certification
from models.ledger import LedgerEntry

logger = structlog.get_logger()


async def record_certified(
    db: AsyncSession,
    *,
    certification_id: uuid.UUID,
    user_id: uuid.UUID,
    file_hash_sha256: str,
    actor_ip: str | None = None,
    actor_user_agent: str | None = None,
    payload: dict | None = None,
) -> LedgerEntry:
    """
    Append a 'certified' event to the ledger.
    Called when a certification successfully completes.
    """
    entry = LedgerEntry(
        certification_id=certification_id,
        user_id=user_id,
        file_hash_sha256=file_hash_sha256,
        event_type="certified",
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent,
        payload=payload or {},
    )
    db.add(entry)
    await db.flush()

    logger.info(
        "ledger_certified",
        entry_id=entry.id,
        certification_id=str(certification_id),
        hash=file_hash_sha256[:16],
    )
    return entry


async def record_verified(
    db: AsyncSession,
    *,
    file_hash_sha256: str,
    certification_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    actor_ip: str | None = None,
    actor_user_agent: str | None = None,
) -> LedgerEntry:
    """
    Append a 'verified' event to the ledger.
    Called on every public lookup — enables audit trail of who verified what and when.
    """
    entry = LedgerEntry(
        certification_id=certification_id,
        user_id=user_id,
        file_hash_sha256=file_hash_sha256,
        event_type="verified",
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent,
        payload={"source": "api"},
    )
    db.add(entry)
    await db.flush()

    logger.info(
        "ledger_verified",
        entry_id=entry.id,
        hash=file_hash_sha256[:16],
        ip=actor_ip,
    )
    return entry


async def lookup_by_hash(
    db: AsyncSession,
    file_hash_sha256: str,
) -> Certification | None:
    """
    Look up the latest certified certification for a given SHA-256 hash.

    Returns:
        The Certification ORM object if found and certified, None otherwise.
    """
    result = await db.execute(
        select(Certification)
        .where(
            Certification.file_hash_sha256 == file_hash_sha256,
            Certification.status == "certified",
        )
        .order_by(Certification.created_at.asc())  # first certification wins
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_ledger_history(
    db: AsyncSession,
    file_hash_sha256: str,
    limit: int = 50,
) -> list[LedgerEntry]:
    """
    Return the full ledger history for a given file hash (all events).
    Ordered chronologically.
    """
    result = await db.execute(
        select(LedgerEntry)
        .where(LedgerEntry.file_hash_sha256 == file_hash_sha256)
        .order_by(LedgerEntry.id.asc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_certifications_this_month(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> int:
    """Count how many certifications the user has made in the current calendar month."""
    result = await db.execute(
        select(func.count())
        .select_from(LedgerEntry)
        .where(
            LedgerEntry.user_id == user_id,
            LedgerEntry.event_type == "certified",
            func.date_trunc("month", LedgerEntry.created_at)
            == func.date_trunc("month", func.now()),
        )
    )
    return result.scalar_one() or 0
