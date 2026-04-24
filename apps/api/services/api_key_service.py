"""
IronID — API Key Service.

Handles secure generation, hashing (bcrypt), and verification of API keys.
Keys follow the format: iid_live_<32 random chars> (production)
                         iid_test_<32 random chars> (test/dev)

The full key is shown ONCE at creation time. Only a bcrypt hash is persisted.
"""

import secrets
import uuid
from datetime import datetime

import bcrypt
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.api_key import APIKey
from models.user import User


# --- Constants ---
KEY_PREFIX_LIVE = "iid_live_"
KEY_PREFIX_TEST = "iid_test_"
KEY_RANDOM_BYTES = 24  # 24 bytes → 48 hex chars; total key ≈ 57 chars


def generate_raw_key(is_production: bool = True) -> str:
    """
    Generate a cryptographically secure API key.
    Returns the full raw key — this is the ONLY time it is visible.
    """
    prefix = KEY_PREFIX_LIVE if is_production else KEY_PREFIX_TEST
    random_part = secrets.token_urlsafe(KEY_RANDOM_BYTES)
    return f"{prefix}{random_part}"


def hash_key(raw_key: str) -> str:
    """
    Hash an API key with bcrypt (cost=12).
    Returns the hash as a UTF-8 string for storage.
    """
    return bcrypt.hashpw(raw_key.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_key(raw_key: str, stored_hash: str) -> bool:
    """
    Verify a raw API key against its stored bcrypt hash.
    Constant-time comparison via bcrypt.checkpw.
    """
    try:
        return bcrypt.checkpw(raw_key.encode("utf-8"), stored_hash.encode("utf-8"))
    except Exception:
        return False


def get_display_prefix(raw_key: str) -> str:
    """
    Return a safe display prefix for the key (e.g. 'iid_live_Ab1c').
    Shows the scheme prefix + first 4 random characters only.
    """
    parts = raw_key.split("_", 2)  # ['iid', 'live', 'randompart']
    if len(parts) == 3:
        return f"iid_{parts[1]}_{parts[2][:4]}..."
    return raw_key[:12] + "..."


async def create_api_key(
    db: AsyncSession,
    user_id: uuid.UUID,
    name: str,
    is_production: bool = True,
) -> tuple[APIKey, str]:
    """
    Create and persist a new API key for a user.

    Returns:
        (APIKey ORM object, raw_key string)
        The raw_key must be shown to the user immediately — it cannot be recovered later.
    """
    raw_key = generate_raw_key(is_production)
    key_hash = hash_key(raw_key)
    key_prefix = get_display_prefix(raw_key)

    api_key = APIKey(
        user_id=user_id,
        name=name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        is_active=True,
    )
    db.add(api_key)
    await db.flush()  # get the id without committing
    return api_key, raw_key


async def get_api_key_by_raw(db: AsyncSession, raw_key: str) -> APIKey | None:
    """
    Look up and verify an API key from a raw bearer token.
    Updates last_used_at on successful match.

    This performs a full-table scan filtered by key_prefix for efficiency,
    then bcrypt-verifies the match (O(n) where n is keys sharing the same prefix — usually 1).
    """
    prefix = get_display_prefix(raw_key)

    result = await db.execute(
        select(APIKey).where(
            APIKey.key_prefix == prefix,
            APIKey.is_active == True,  # noqa: E712
        )
    )
    candidates = result.scalars().all()

    for candidate in candidates:
        if verify_key(raw_key, candidate.key_hash):
            # Update last_used_at without triggering full object reload
            await db.execute(
                update(APIKey)
                .where(APIKey.id == candidate.id)
                .values(last_used_at=datetime.utcnow())
            )
            return candidate

    return None


async def revoke_api_key(
    db: AsyncSession, key_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """
    Revoke an API key. Returns True if the key was found and owned by user_id.
    """
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.user_id == user_id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        return False

    api_key.is_active = False
    return True


async def list_user_keys(db: AsyncSession, user_id: uuid.UUID) -> list[APIKey]:
    """Return all API keys for a user, ordered by creation date descending."""
    result = await db.execute(
        select(APIKey)
        .where(APIKey.user_id == user_id)
        .order_by(APIKey.created_at.desc())
    )
    return list(result.scalars().all())
