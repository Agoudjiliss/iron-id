"""
IronID — Clerk Webhook Router.

Handles Clerk user lifecycle events:
  user.created → create local mirror, attribute referral if ref_code present
  user.updated → sync email / name changes
  user.deleted → soft-delete or anonymise

Webhook signature is verified via svix (Clerk's delivery mechanism).
"""

import uuid

import structlog
from fastapi import APIRouter, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from config import get_settings
from database import get_db
from models.user import User
from services.affiliate_service import attribute_referral

settings = get_settings()
logger = structlog.get_logger()
router = APIRouter(prefix="/v1/webhooks/clerk", tags=["Webhooks"])


async def _verify_clerk_signature(request: Request, svix_id: str, svix_ts: str, svix_sig: str) -> bytes:
    """
    Verify the Clerk webhook signature using svix.
    Raises HTTP 400 if invalid.
    """
    try:
        from svix.webhooks import Webhook, WebhookVerificationError
    except ImportError:
        # svix not installed — skip verification in dev
        logger.warning("svix_not_installed_skipping_clerk_webhook_verification")
        return await request.body()

    body = await request.body()
    wh = Webhook(settings.clerk_webhook_secret)

    try:
        wh.verify(
            body,
            {
                "svix-id":        svix_id,
                "svix-timestamp": svix_ts,
                "svix-signature": svix_sig,
            },
        )
    except Exception as exc:
        logger.warning("clerk_webhook_invalid_signature", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid webhook signature.", "code": "INVALID_SIGNATURE"},
        )

    return body


@router.post("", status_code=status.HTTP_200_OK, summary="Clerk webhook receiver")
async def clerk_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    svix_id:  str = Header(..., alias="svix-id"),
    svix_ts:  str = Header(..., alias="svix-timestamp"),
    svix_sig: str = Header(..., alias="svix-signature"),
) -> dict:
    """Receive Clerk user lifecycle events and sync with IronID database."""
    import json

    body = await _verify_clerk_signature(request, svix_id, svix_ts, svix_sig)

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail={"error": "Invalid JSON", "code": "INVALID_BODY"})

    event_type = event.get("type", "")
    data       = event.get("data", {})

    logger.info("clerk_webhook_received", event_type=event_type)

    if event_type == "user.created":
        await _handle_user_created(db, data)
    elif event_type == "user.updated":
        await _handle_user_updated(db, data)
    elif event_type == "user.deleted":
        await _handle_user_deleted(db, data)

    return {"received": True}


# ---- Handlers ----

async def _handle_user_created(db: AsyncSession, data: dict) -> None:
    """
    Mirror a new Clerk user into the local users table.
    Apply referral attribution if a ref_code is present in public metadata.
    """
    clerk_id = data.get("id")
    email    = _extract_email(data)

    if not clerk_id or not email:
        logger.warning("clerk_user_created_missing_fields", data=str(data)[:200])
        return

    # Idempotency check
    existing = await db.execute(select(User).where(User.clerk_id == clerk_id))
    if existing.scalar_one_or_none():
        logger.info("clerk_user_already_exists", clerk_id=clerk_id)
        return

    user = User(
        clerk_id=clerk_id,
        email=email,
        plan="free",
        monthly_signatures_limit=10,
    )
    db.add(user)
    await db.flush()  # need user.id for referral attribution

    # Attribute referral if present in Clerk public_metadata
    ref_code = (
        data.get("public_metadata", {}).get("ref_code")
        or data.get("unsafe_metadata", {}).get("ref_code")
    )
    if ref_code:
        attributed = await attribute_referral(db, user, str(ref_code))
        if attributed:
            logger.info(
                "referral_attributed_on_signup",
                user_id=str(user.id),
                ref_code=ref_code,
            )

    logger.info("clerk_user_created", user_id=str(user.id), email=email)


async def _handle_user_updated(db: AsyncSession, data: dict) -> None:
    """
    Sync email changes from Clerk.
    Also attribute referral if ref_code appears in unsafeMetadata for the first time
    (set by ReferralTracker on the frontend after sign-up redirect).
    """
    clerk_id = data.get("id")
    email    = _extract_email(data)

    if not clerk_id:
        return

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user   = result.scalar_one_or_none()

    if not user:
        return

    # Sync email
    if email and user.email != email:
        user.email = email
        logger.info("clerk_user_email_updated", clerk_id=clerk_id, new_email=email)

    # Attribute referral on first appearance of ref_code in unsafeMetadata
    ref_code = (
        data.get("unsafe_metadata", {}).get("ref_code")
        or data.get("public_metadata", {}).get("ref_code")
    )
    if ref_code:
        attributed = await attribute_referral(db, user, str(ref_code))
        if attributed:
            logger.info(
                "referral_attributed_on_update",
                user_id=str(user.id),
                ref_code=ref_code,
            )


async def _handle_user_deleted(db: AsyncSession, data: dict) -> None:
    """
    Handle Clerk user deletion.
    We anonymise the email rather than hard-deleting to preserve ledger integrity.
    """
    clerk_id = data.get("id")
    if not clerk_id:
        return

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user   = result.scalar_one_or_none()

    if user:
        user.email   = f"deleted_{user.id}@ironid.deleted"
        user.clerk_id = f"deleted_{user.id}"
        logger.info("clerk_user_anonymised", user_id=str(user.id))


# ---- Helpers ----

def _extract_email(data: dict) -> str | None:
    """Extract the primary email from Clerk user data."""
    emails = data.get("email_addresses", [])
    primary_id = data.get("primary_email_address_id")

    for e in emails:
        if e.get("id") == primary_id:
            return e.get("email_address")

    if emails:
        return emails[0].get("email_address")

    return None
