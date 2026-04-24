"""
IronID — Billing Router.

Endpoints:
  POST  /v1/billing/subscribe           Create a PayPal subscription (redirect)
  POST  /v1/billing/payg                Create a PAYG order for N signatures
  GET   /v1/billing/subscription        Get current subscription status
  POST  /v1/billing/cancel              Cancel active subscription
  GET   /v1/billing/plans               List available plans with prices
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from middleware.auth import get_current_user
from models.api_key import APIKey
from models.user import User
from services.paypal_service import (
    PLAN_TIER,
    PayPalError,
    cancel_subscription,
    create_payg_order,
    create_subscription,
    get_subscription,
)

settings = get_settings()
router = APIRouter(prefix="/v1/billing", tags=["Billing"])


# ---- Static plan catalogue ----

PLAN_CATALOGUE = {
    "individual_monthly": {
        "tier":        "individual",
        "label":       "Individual",
        "interval":    "monthly",
        "price_usd":   29.00,
        "price_label": "$29 / mois",
        "yearly_save": None,
        "signatures":  10_000,
        "features": [
            "10 000 signatures / mois",
            "Fichiers jusqu'à 200 MB",
            "API REST complète",
            "Manifest C2PA signé",
            "Historique 30 jours",
            "Support email",
        ],
    },
    "individual_yearly": {
        "tier":        "individual",
        "label":       "Individual",
        "interval":    "yearly",
        "price_usd":   232.00,
        "price_label": "$232 / an",
        "yearly_save": "Économisez 20%",
        "signatures":  10_000,
        "features": [
            "10 000 signatures / mois",
            "Fichiers jusqu'à 200 MB",
            "API REST complète",
            "Manifest C2PA signé",
            "Historique 30 jours",
            "Support email",
        ],
    },
    "studio_monthly": {
        "tier":        "studio",
        "label":       "Studio",
        "interval":    "monthly",
        "price_usd":   199.00,
        "price_label": "$199 / mois",
        "yearly_save": None,
        "signatures":  100_000,
        "features": [
            "100 000 signatures / mois",
            "Fichiers jusqu'à 500 MB",
            "API REST + SDK",
            "Webhooks illimités",
            "Historique 30 jours",
            "Support prioritaire",
            "Dashboard d'équipe",
        ],
    },
    "studio_yearly": {
        "tier":        "studio",
        "label":       "Studio",
        "interval":    "yearly",
        "price_usd":   1908.00,
        "price_label": "$1 908 / an",
        "yearly_save": "Économisez 20%",
        "signatures":  100_000,
        "features": [
            "100 000 signatures / mois",
            "Fichiers jusqu'à 500 MB",
            "API REST + SDK",
            "Webhooks illimités",
            "Historique 30 jours",
            "Support prioritaire",
            "Dashboard d'équipe",
        ],
    },
    "enterprise_monthly": {
        "tier":        "enterprise",
        "label":       "Enterprise",
        "interval":    "monthly",
        "price_usd":   1200.00,
        "price_label": "$1 200 / mois",
        "yearly_save": None,
        "signatures":  -1,
        "features": [
            "Signatures illimitées",
            "Fichiers jusqu'à 500 MB",
            "API REST + SDK",
            "SLA 99.9%",
            "Déploiement VPS dédié",
            "Historique illimité",
            "Support dédié 24/7",
            "RGPD — données EU",
        ],
    },
    "enterprise_yearly": {
        "tier":        "enterprise",
        "label":       "Enterprise",
        "interval":    "yearly",
        "price_usd":   11520.00,
        "price_label": "$11 520 / an",
        "yearly_save": "Économisez 20%",
        "signatures":  -1,
        "features": [
            "Signatures illimitées",
            "Fichiers jusqu'à 500 MB",
            "API REST + SDK",
            "SLA 99.9%",
            "Déploiement VPS dédié",
            "Historique illimité",
            "Support dédié 24/7",
            "RGPD — données EU",
        ],
    },
}


# ---- Schemas ----

class SubscribeRequest(BaseModel):
    plan_key: str = Field(
        ...,
        description="Plan key: individual_monthly | individual_yearly | studio_monthly | studio_yearly | enterprise_monthly | enterprise_yearly",
    )
    return_url: str = Field(default="http://localhost:3000/billing?success=1")
    cancel_url: str = Field(default="http://localhost:3000/billing?cancelled=1")


class PayGRequest(BaseModel):
    signature_count: int = Field(..., ge=1, le=10_000, description="Number of signatures to purchase")
    return_url: str = Field(default="http://localhost:3000/billing?payg=success")
    cancel_url: str = Field(default="http://localhost:3000/billing?payg=cancelled")


# ---- Routes ----

@router.get("/plans", summary="List available subscription plans")
async def list_plans() -> dict:
    """Return the full plan catalogue (public — no auth required)."""
    return {
        "payg": {
            "label":       "Pay-as-you-go",
            "price_label": "$0.10 / signature",
            "price_usd":   0.10,
            "signatures":  -1,
            "features": [
                "Aucun abonnement",
                "Facturation à la signature",
                "Fichiers jusqu'à 100 MB",
                "API REST complète",
            ],
        },
        **PLAN_CATALOGUE,
    }


@router.post("/subscribe", summary="Create a PayPal subscription")
async def subscribe(
    body: SubscribeRequest,
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Create a PayPal Subscription for the authenticated user.

    Returns the PayPal subscription object including the approval link
    (redirect the user to `approval_url` to complete payment).
    """
    user, _ = auth

    if body.plan_key not in PLAN_CATALOGUE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": f"Unknown plan '{body.plan_key}'.", "code": "INVALID_PLAN"},
        )

    # Cancel existing subscription first (plan change)
    if user.paypal_subscription_id:
        try:
            await cancel_subscription(user.paypal_subscription_id, reason="Plan upgrade/change")
        except PayPalError:
            pass  # Proceed even if cancellation fails

    subscriber_name = user.email.split("@")[0]

    try:
        sub = await create_subscription(
            plan_key=body.plan_key,
            subscriber_email=user.email,
            subscriber_name=subscriber_name,
            return_url=body.return_url,
            cancel_url=body.cancel_url,
            custom_id=str(user.id),
        )
    except (PayPalError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": str(exc), "code": "PAYPAL_ERROR"},
        )

    # Extract the approval URL for redirect
    approval_url = next(
        (link["href"] for link in sub.get("links", []) if link.get("rel") == "approve"),
        None,
    )

    return {
        "subscription_id": sub["id"],
        "status":          sub.get("status"),
        "approval_url":    approval_url,
        "plan_key":        body.plan_key,
    }


@router.post("/payg", summary="Create a PAYG order")
async def create_payg(
    body: PayGRequest,
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Create a PayPal Order for pay-as-you-go signature credits.
    Price: $0.10 per signature.

    Returns the PayPal Order object including the approval link.
    """
    user, _ = auth

    if user.plan not in ("payg", "free"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "PAYG billing is only for free/payg plan users. Subscription plans include signatures.",
                "code": "NOT_PAYG_USER",
            },
        )

    custom_id = f"{user.id}:{body.signature_count}"

    try:
        order = await create_payg_order(
            signature_count=body.signature_count,
            return_url=body.return_url,
            cancel_url=body.cancel_url,
            custom_id=custom_id,
        )
    except PayPalError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": str(exc), "code": "PAYPAL_ERROR"},
        )

    approval_url = next(
        (link["href"] for link in order.get("links", []) if link.get("rel") == "approve"),
        None,
    )

    total_usd = body.signature_count * settings.PAYG_PRICE_CENTS / 100

    return {
        "order_id":       order["id"],
        "approval_url":   approval_url,
        "signature_count": body.signature_count,
        "total_usd":      total_usd,
    }


@router.get("/subscription", summary="Get current subscription status")
async def get_subscription_status(
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return the current billing status for the authenticated user."""
    user, _ = auth

    base = {
        "plan":                    user.plan,
        "paypal_subscription_id":  user.paypal_subscription_id,
        "subscription_status":     getattr(user, "subscription_status", None),
        "monthly_signatures_used": user.monthly_signatures_used,
        "monthly_signatures_limit": user.monthly_signatures_limit,
    }

    # Fetch live status from PayPal if subscription exists
    if user.paypal_subscription_id:
        try:
            sub = await get_subscription(user.paypal_subscription_id)
            base["paypal_status"]   = sub.get("status")
            base["next_billing"]    = sub.get("billing_info", {}).get("next_billing_time")
            base["last_payment"]    = sub.get("billing_info", {}).get("last_payment", {})
        except PayPalError:
            pass  # Return local data if PayPal API is unavailable

    return base


@router.post("/cancel", summary="Cancel subscription", status_code=status.HTTP_200_OK)
async def cancel_user_subscription(
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Cancel the authenticated user's active PayPal subscription.
    The plan will be downgraded to 'free' by the webhook handler.
    """
    user, _ = auth

    if not user.paypal_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "No active subscription to cancel.", "code": "NO_SUBSCRIPTION"},
        )

    try:
        await cancel_subscription(user.paypal_subscription_id, reason="User initiated cancellation")
    except PayPalError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": str(exc), "code": "PAYPAL_ERROR"},
        )

    return {"cancelled": True, "message": "Your subscription has been cancelled."}
