"""
IronID — PayPal Webhooks Router.

Handles inbound PayPal webhook events.
All events are verified via PayPal's certificate-based signature API before processing.

Handled events:
  BILLING.SUBSCRIPTION.ACTIVATED   → activate user plan
  BILLING.SUBSCRIPTION.CANCELLED   → downgrade to free
  BILLING.SUBSCRIPTION.EXPIRED     → downgrade to free
  PAYMENT.SALE.COMPLETED           → credit signatures, trigger affiliate commission
  CHECKOUT.ORDER.APPROVED          → capture PAYG order
  CHECKOUT.ORDER.COMPLETED         → credit PAYG signatures
"""

import json
import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from fastapi import Depends
from models.user import User
from services.paypal_service import (
    PLAN_TIER,
    PayPalError,
    capture_order,
    verify_webhook_signature,
)
from config import get_settings

settings = get_settings()
logger = structlog.get_logger()
router = APIRouter(prefix="/v1/webhooks", tags=["Webhooks"])


@router.post("/paypal", status_code=status.HTTP_200_OK, summary="PayPal webhook receiver")
async def paypal_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    paypal_transmission_id:   str = Header(..., alias="PAYPAL-TRANSMISSION-ID"),
    paypal_transmission_time: str = Header(..., alias="PAYPAL-TRANSMISSION-TIME"),
    paypal_cert_url:          str = Header(..., alias="PAYPAL-CERT-URL"),
    paypal_auth_algo:         str = Header(..., alias="PAYPAL-AUTH-ALGO"),
    paypal_transmission_sig:  str = Header(..., alias="PAYPAL-TRANSMISSION-SIG"),
) -> dict:
    """
    Receive and process PayPal webhook events.
    Signature is verified before any business logic is executed.
    """
    raw_body = await request.body()

    # Verify signature
    valid = await verify_webhook_signature(
        transmission_id=paypal_transmission_id,
        transmission_time=paypal_transmission_time,
        cert_url=paypal_cert_url,
        auth_algo=paypal_auth_algo,
        transmission_sig=paypal_transmission_sig,
        raw_body=raw_body,
    )
    if not valid:
        logger.warning("paypal_webhook_invalid_signature")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Invalid webhook signature.", "code": "INVALID_SIGNATURE"},
        )

    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail={"error": "Invalid JSON", "code": "INVALID_BODY"})

    event_type = event.get("event_type", "")
    resource   = event.get("resource", {})

    logger.info("paypal_webhook_received", event_type=event_type, event_id=event.get("id"))

    # ---- Dispatch ----
    if event_type == "BILLING.SUBSCRIPTION.ACTIVATED":
        await _handle_subscription_activated(db, resource)

    elif event_type in ("BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.EXPIRED"):
        await _handle_subscription_ended(db, resource)

    elif event_type == "PAYMENT.SALE.COMPLETED":
        await _handle_payment_completed(db, resource)

    elif event_type == "CHECKOUT.ORDER.APPROVED":
        # Capture the approved PAYG order in the background
        order_id = resource.get("id")
        if order_id:
            background_tasks.add_task(_capture_payg_order, order_id, db)

    elif event_type == "CHECKOUT.ORDER.COMPLETED":
        await _handle_payg_order_completed(db, resource)

    else:
        logger.info("paypal_webhook_unhandled_event", event_type=event_type)

    return {"received": True}


# ---- Handlers ----

async def _handle_subscription_activated(db: AsyncSession, resource: dict) -> None:
    """Activate a user's plan when their PayPal subscription is confirmed."""
    subscription_id = resource.get("id")
    plan_id         = resource.get("plan_id", "")
    custom_id       = resource.get("custom_id")  # IronID user UUID

    if not custom_id:
        logger.warning("paypal_subscription_activated_missing_custom_id", sub_id=subscription_id)
        return

    # Resolve PayPal plan ID → IronID tier
    tier = _resolve_tier_from_plan_id(plan_id)

    try:
        user_uuid = uuid.UUID(custom_id)
    except ValueError:
        logger.error("paypal_invalid_custom_id", custom_id=custom_id)
        return

    result = await db.execute(select(User).where(User.id == user_uuid))
    user   = result.scalar_one_or_none()
    if not user:
        logger.warning("paypal_user_not_found", user_id=custom_id)
        return

    user.plan                   = tier
    user.paypal_subscription_id = subscription_id
    user.subscription_status    = "ACTIVE"
    user.monthly_signatures_limit = settings.SIGNATURE_LIMITS.get(tier, 10)

    logger.info("paypal_plan_activated", user_id=custom_id, plan=tier, sub_id=subscription_id)


async def _handle_subscription_ended(db: AsyncSession, resource: dict) -> None:
    """Downgrade user to free when subscription is cancelled or expired."""
    subscription_id = resource.get("id")

    result = await db.execute(
        select(User).where(User.paypal_subscription_id == subscription_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("paypal_subscription_ended_user_not_found", sub_id=subscription_id)
        return

    user.plan                     = "free"
    user.paypal_subscription_id   = None
    user.subscription_status      = "CANCELLED"
    user.monthly_signatures_limit = settings.SIGNATURE_LIMITS["free"]

    logger.info("paypal_plan_downgraded_to_free", user_id=str(user.id), sub_id=subscription_id)


async def _handle_payment_completed(db: AsyncSession, resource: dict) -> None:
    """
    Called when a subscription payment is collected.
    Triggers affiliate commission calculation.
    """
    from services.affiliate_service import process_affiliate_commission

    subscription_id = resource.get("billing_agreement_id")
    amount_str      = resource.get("amount", {}).get("total", "0")
    amount_cents    = int(float(amount_str) * 100)
    paypal_sale_id  = resource.get("id")

    if not subscription_id:
        return

    result = await db.execute(
        select(User).where(User.paypal_subscription_id == subscription_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return

    logger.info(
        "paypal_payment_completed",
        user_id=str(user.id),
        amount_cents=amount_cents,
        sale_id=paypal_sale_id,
    )

    # Trigger affiliate commission if user was referred
    if user.referred_by:
        await process_affiliate_commission(
            db,
            referred_user_id=user.id,
            amount_cents=amount_cents,
            paypal_capture_id=paypal_sale_id,
        )


async def _capture_payg_order(order_id: str, db: AsyncSession) -> None:
    """Capture a PAYG PayPal Order after buyer approval."""
    try:
        result = await capture_order(order_id)
        logger.info("paypal_payg_order_captured", order_id=order_id, status=result.get("status"))
    except PayPalError as exc:
        logger.error("paypal_payg_capture_failed", order_id=order_id, error=str(exc))


async def _handle_payg_order_completed(db: AsyncSession, resource: dict) -> None:
    """Credit PAYG signatures after successful order capture."""
    custom_id = resource.get("purchase_units", [{}])[0].get("custom_id")
    if not custom_id:
        return

    # custom_id format: "{user_id}:{signature_count}"
    try:
        user_id_str, count_str = custom_id.split(":")
        user_uuid = uuid.UUID(user_id_str)
        count     = int(count_str)
    except (ValueError, AttributeError):
        logger.error("paypal_payg_invalid_custom_id", custom_id=custom_id)
        return

    result = await db.execute(select(User).where(User.id == user_uuid))
    user   = result.scalar_one_or_none()
    if user:
        user.monthly_signatures_used = max(0, user.monthly_signatures_used - count)
        logger.info("paypal_payg_signatures_credited", user_id=str(user.id), count=count)


# ---- Helpers ----

def _resolve_tier_from_plan_id(plan_id: str) -> str:
    """Map a PayPal Plan ID to an IronID tier string."""
    mapping = {
        settings.paypal_plan_individual_monthly: "individual",
        settings.paypal_plan_individual_yearly:  "individual",
        settings.paypal_plan_studio_monthly:     "studio",
        settings.paypal_plan_studio_yearly:      "studio",
        settings.paypal_plan_enterprise_monthly: "enterprise",
        settings.paypal_plan_enterprise_yearly:  "enterprise",
    }
    return mapping.get(plan_id, "free")
