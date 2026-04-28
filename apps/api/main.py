"""
IronID API — Application Entry Point.
FastAPI app with CORS, rate limiting, structured logging, and Sentry.
"""

import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from database import close_db, init_db
from middleware.rate_limit import RateLimitMiddleware
from routers import admin, affiliate, billing, certify, clerk_webhook, feedback, keys, stats, verify, webhooks

settings = get_settings()

# --- Structured Logging ---
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
)
logger = structlog.get_logger()


# --- Sentry (production only) ---
if settings.sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.app_env,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.2,
    )


# --- Application Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ironid_startup", env=settings.app_env)
    yield
    await close_db()
    logger.info("ironid_shutdown")


# --- FastAPI App ---
app = FastAPI(
    title="IronID API",
    description="The Gold Standard for Digital Truth — C2PA certification & provenance ledger.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Admin-Key"],
)

# --- Rate Limiting ---
app.add_middleware(RateLimitMiddleware)


# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error.", "code": "INTERNAL_ERROR"},
    )


# --- Health Check ---
@app.get("/health", tags=["System"])
async def health() -> dict:
    """Quick liveness probe for load balancers and Docker healthchecks."""
    return {"status": "ok", "version": "1.0.0", "env": settings.app_env}


# --- Routers ---
app.include_router(keys.router)
app.include_router(stats.router)
app.include_router(certify.router)
app.include_router(verify.router)
app.include_router(billing.router)
app.include_router(webhooks.router)
app.include_router(affiliate.router)
app.include_router(clerk_webhook.router)
app.include_router(feedback.router)
app.include_router(admin.router)   # /v1/admin/* — secured by X-Admin-Key
