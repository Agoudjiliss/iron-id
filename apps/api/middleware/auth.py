"""
IronID — Authentication Middleware & FastAPI Dependency.

Two auth modes:
  1. API key (iid_live_/iid_test_) — for external API consumers
  2. Clerk session JWT — for the dashboard frontend
"""

import logging
import time
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.api_key import APIKey
from models.user import User
from services.api_key_service import get_api_key_by_raw

log = logging.getLogger(__name__)
settings = get_settings()

# ---------------------------------------------------------------------------
# Clerk JWT helpers
# ---------------------------------------------------------------------------

_JWKS_CACHE: dict = {}
_JWKS_FETCHED_AT: float = 0.0
_JWKS_TTL = 3600  # refresh JWKS at most once per hour


async def _get_clerk_jwks() -> dict:
    global _JWKS_CACHE, _JWKS_FETCHED_AT
    now = time.monotonic()
    if _JWKS_CACHE and (now - _JWKS_FETCHED_AT) < _JWKS_TTL:
        return _JWKS_CACHE

    # Derive JWKS URL from the publishable key domain
    # pk_live_Y2xlcmsuaXJvbi1pZC5pbyQ → clerk.iron-id.io
    clerk_domain = "clerk.iron-id.io"
    url = f"https://{clerk_domain}/.well-known/jwks.json"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            _JWKS_CACHE = resp.json()
            _JWKS_FETCHED_AT = now
    except Exception as exc:
        log.warning("clerk_jwks_fetch_failed: %s", exc)
        if not _JWKS_CACHE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"error": "Auth service temporarily unavailable.", "code": "AUTH_UNAVAILABLE"},
            )

    return _JWKS_CACHE


async def verify_clerk_token(token: str, db: AsyncSession) -> User:
    """Validate a Clerk session JWT and return the matching local User."""
    jwks = await _get_clerk_jwks()
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        log.debug("clerk_jwt_invalid: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid or expired session token.", "code": "UNAUTHORIZED"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    clerk_id = payload.get("sub")
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid session token.", "code": "UNAUTHORIZED"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "User not found. Please sign up first.", "code": "USER_NOT_FOUND"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)

_AUTH_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={"error": "Invalid or missing API key.", "code": "UNAUTHORIZED"},
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> tuple[User, APIKey]:
    """
    FastAPI dependency: resolve a Bearer token to (User, APIKey).

    Usage in a route:
        @router.get("/protected")
        async def route(auth: tuple[User, APIKey] = Depends(get_current_user)):
            user, api_key = auth
    """
    if not credentials or not credentials.credentials:
        raise _AUTH_ERROR

    raw_key = credentials.credentials

    # Basic format check (avoids DB hit for obviously invalid keys)
    if not (raw_key.startswith("iid_live_") or raw_key.startswith("iid_test_")):
        raise _AUTH_ERROR

    api_key = await get_api_key_by_raw(db, raw_key)
    if not api_key:
        raise _AUTH_ERROR

    # Load the associated user
    result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise _AUTH_ERROR

    # Attach to request state for middleware / logging access
    request.state.user = user
    request.state.api_key = api_key

    return user, api_key


async def require_plan(
    minimum_plan: str,
    auth: tuple[User, APIKey] = Depends(get_current_user),
) -> tuple[User, APIKey]:
    """
    Dependency factory that enforces a minimum subscription plan.

    Example:
        @router.post("/enterprise-only")
        async def route(auth = Depends(require_plan("enterprise"))):
            ...
    """
    plan_order = ["free", "payg", "individual", "studio", "enterprise"]
    user, api_key = auth

    if plan_order.index(user.plan) < plan_order.index(minimum_plan):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": f"This endpoint requires '{minimum_plan}' plan or higher.",
                "code": "PLAN_INSUFFICIENT",
            },
        )
    return auth


async def get_current_user_from_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency for dashboard routes: validate a Clerk session JWT.

    The frontend passes the Clerk session token as:
        Authorization: Bearer <clerk_session_jwt>

    Returns the matching local User record.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Missing session token.", "code": "UNAUTHORIZED"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await verify_clerk_token(credentials.credentials, db)
