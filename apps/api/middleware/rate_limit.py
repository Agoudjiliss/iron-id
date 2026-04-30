"""
IronID — Rate Limiting Middleware.

Per-plan rate limits enforced via Redis sliding window counters.
Limits are applied per API key (not per IP) for authenticated routes.
Public routes use per-IP limiting.
"""

import asyncio
import logging
import time
from typing import Callable

import redis.asyncio as aioredis
from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

from config import get_settings

log = logging.getLogger(__name__)

settings = get_settings()

# Lazy Redis client — initialized once on first request
_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def check_rate_limit(
    identifier: str,
    plan: str,
    window_seconds: int = 60,
) -> tuple[bool, int, int]:
    """
    Sliding window rate limiter using Redis.

    Args:
        identifier: Unique key (e.g. api_key_id or IP address)
        plan: User's subscription plan
        window_seconds: Time window in seconds (default: 60s)

    Returns:
        (allowed: bool, current_count: int, limit: int)
    """
    limit = settings.RATE_LIMITS.get(plan, settings.RATE_LIMITS["free"])
    redis = await get_redis()
    now = int(time.time())

    redis_key = f"rate_limit:{identifier}:{now // window_seconds}"

    pipe = redis.pipeline()
    pipe.incr(redis_key)
    pipe.expire(redis_key, window_seconds + 1)
    results = await pipe.execute()

    current_count = results[0]
    allowed = current_count <= limit

    return allowed, current_count, limit


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Starlette middleware that applies rate limiting on all /v1/ routes.
    Uses plan-based limits for authenticated requests, IP-based for public routes.
    """

    EXEMPT_PATHS = {"/health", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # Skip rate limiting for CORS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip rate limiting for exempt paths
        if path in self.EXEMPT_PATHS or not path.startswith("/v1/"):
            return await call_next(request)

        # Determine identifier and plan
        user = getattr(request.state, "user", None)
        api_key = getattr(request.state, "api_key", None)

        if user and api_key:
            identifier = str(api_key.id)
            plan = user.plan
        else:
            # Public endpoint: use client IP
            identifier = request.client.host if request.client else "unknown"
            plan = "free"

        try:
            allowed, current, limit = await asyncio.wait_for(
                check_rate_limit(identifier, plan),
                timeout=1.5,
            )
        except Exception as exc:
            # Redis unavailable or timed out — fail open so app stays responsive
            log.warning("rate_limit_skip: %s", type(exc).__name__)
            global _redis
            _redis = None  # reset client so next request gets a fresh connection
            return await call_next(request)

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": f"Rate limit exceeded. Max {limit} requests/minute for '{plan}' plan.",
                    "code": "RATE_LIMIT_EXCEEDED",
                },
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": "60",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
        return response
