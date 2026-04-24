"""
IronID — Authentication Middleware & FastAPI Dependency.

Validates Bearer API keys on every protected route.
Injects (user, api_key) into the request state for downstream handlers.
"""

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.api_key import APIKey
from models.user import User
from services.api_key_service import get_api_key_by_raw

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
