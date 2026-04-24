"""
IronID — PayPal Service.

Wraps the PayPal REST API v2 using httpx (async).
Covers:
  - OAuth 2.0 token management (cached, auto-refreshed)
  - Subscriptions API : create, retrieve, cancel
  - Orders API       : create and capture (PAYG per-signature billing)
  - Webhook verification (HMAC-based PayPal signature check)

PayPal API docs: https://developer.paypal.com/docs/api/
"""

import base64
import hashlib
import hmac
import time
from datetime import datetime, timezone
from typing import Any

import httpx
import structlog

from config import get_settings

settings = get_settings()
logger = structlog.get_logger()

# ---- Token cache ----
_token_cache: dict[str, Any] = {"access_token": None, "expires_at": 0}


async def _get_access_token() -> str:
    """
    Obtain a PayPal OAuth 2.0 access token.
    Caches the token until 60 seconds before expiry.
    """
    now = time.time()
    if _token_cache["access_token"] and now < _token_cache["expires_at"]:
        return _token_cache["access_token"]

    credentials = base64.b64encode(
        f"{settings.paypal_client_id}:{settings.paypal_client_secret}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.paypal_api_base}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type":  "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"]   = now + data["expires_in"] - 60

    logger.info("paypal_token_refreshed", expires_in=data["expires_in"])
    return _token_cache["access_token"]


async def _paypal_request(
    method: str,
    path: str,
    *,
    json: dict | None = None,
    params: dict | None = None,
) -> dict:
    """Base authenticated PayPal API request."""
    token = await _get_access_token()
    url   = f"{settings.paypal_api_base}{path}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.request(
            method,
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type":  "application/json",
                "Prefer":        "return=representation",
            },
            json=json,
            params=params,
        )

    if not resp.is_success:
        logger.error(
            "paypal_api_error",
            method=method,
            path=path,
            status=resp.status_code,
            body=resp.text[:500],
        )
        raise PayPalError(
            f"PayPal API {method} {path} → {resp.status_code}",
            status_code=resp.status_code,
            detail=resp.text,
        )

    return resp.json() if resp.content else {}


class PayPalError(Exception):
    def __init__(self, message: str, status_code: int = 0, detail: str = ""):
        super().__init__(message)
        self.status_code = status_code
        self.detail      = detail


# ---- Subscriptions API ----

PLAN_MAP: dict[str, str] = {
    "individual_monthly": "paypal_plan_individual_monthly",
    "individual_yearly":  "paypal_plan_individual_yearly",
    "studio_monthly":     "paypal_plan_studio_monthly",
    "studio_yearly":      "paypal_plan_studio_yearly",
    "enterprise_monthly": "paypal_plan_enterprise_monthly",
    "enterprise_yearly":  "paypal_plan_enterprise_yearly",
}

# Plan → IronID tier
PLAN_TIER: dict[str, str] = {
    "individual_monthly": "individual",
    "individual_yearly":  "individual",
    "studio_monthly":     "studio",
    "studio_yearly":      "studio",
    "enterprise_monthly": "enterprise",
    "enterprise_yearly":  "enterprise",
}


def get_plan_id(plan_key: str) -> str:
    """Resolve a plan key (e.g. 'individual_monthly') to its PayPal Plan ID."""
    attr = PLAN_MAP.get(plan_key)
    if not attr:
        raise ValueError(f"Unknown plan key: {plan_key!r}")
    plan_id = getattr(settings, attr, "")
    if not plan_id:
        raise ValueError(
            f"PayPal Plan ID for '{plan_key}' is not configured. "
            f"Set {attr.upper()} in your .env."
        )
    return plan_id


async def create_subscription(
    plan_key: str,
    subscriber_email: str,
    subscriber_name: str,
    return_url: str,
    cancel_url: str,
    custom_id: str,           # IronID user UUID — echoed back in webhooks
) -> dict:
    """
    Create a PayPal Subscription for a given plan.

    Returns:
        PayPal subscription object, including 'id' and approval 'links'.
    """
    plan_id = get_plan_id(plan_key)

    payload = {
        "plan_id": plan_id,
        "custom_id": custom_id,
        "subscriber": {
            "name":          {"given_name": subscriber_name.split()[0], "surname": subscriber_name.split()[-1]},
            "email_address": subscriber_email,
        },
        "application_context": {
            "brand_name":          "IronID",
            "locale":              "fr-FR",
            "shipping_preference": "NO_SHIPPING",
            "user_action":         "SUBSCRIBE_NOW",
            "payment_method": {
                "payer_selected":   "PAYPAL",
                "payee_preferred":  "IMMEDIATE_PAYMENT_REQUIRED",
            },
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }

    sub = await _paypal_request("POST", "/v1/billing/subscriptions", json=payload)
    logger.info(
        "paypal_subscription_created",
        subscription_id=sub.get("id"),
        plan_key=plan_key,
        user=custom_id,
    )
    return sub


async def get_subscription(subscription_id: str) -> dict:
    """Retrieve a PayPal subscription by ID."""
    return await _paypal_request("GET", f"/v1/billing/subscriptions/{subscription_id}")


async def cancel_subscription(subscription_id: str, reason: str = "User cancelled") -> None:
    """Cancel an active PayPal subscription."""
    await _paypal_request(
        "POST",
        f"/v1/billing/subscriptions/{subscription_id}/cancel",
        json={"reason": reason},
    )
    logger.info("paypal_subscription_cancelled", subscription_id=subscription_id)


# ---- Orders API (PAYG per-signature billing) ----

async def create_payg_order(
    signature_count: int,
    return_url: str,
    cancel_url: str,
    custom_id: str,
) -> dict:
    """
    Create a PayPal Order for pay-as-you-go signature billing.
    Price: $0.10 per signature.

    Returns:
        PayPal Order object with 'id' and approval 'links'.
    """
    total_usd = f"{signature_count * settings.PAYG_PRICE_CENTS / 100:.2f}"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "custom_id": custom_id,
                "description": f"IronID — {signature_count} signature{'s' if signature_count > 1 else ''}",
                "amount": {
                    "currency_code": "USD",
                    "value": total_usd,
                },
            }
        ],
        "application_context": {
            "brand_name":          "IronID",
            "shipping_preference": "NO_SHIPPING",
            "user_action":         "PAY_NOW",
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }

    order = await _paypal_request("POST", "/v2/checkout/orders", json=payload)
    logger.info(
        "paypal_order_created",
        order_id=order.get("id"),
        amount_usd=total_usd,
        signatures=signature_count,
    )
    return order


async def capture_order(order_id: str) -> dict:
    """Capture an approved PayPal Order."""
    result = await _paypal_request("POST", f"/v2/checkout/orders/{order_id}/capture")
    logger.info("paypal_order_captured", order_id=order_id, status=result.get("status"))
    return result


# ---- Webhook Verification ----

async def verify_webhook_signature(
    *,
    transmission_id:   str,
    transmission_time: str,
    cert_url:          str,
    auth_algo:         str,
    transmission_sig:  str,
    raw_body:          bytes,
) -> bool:
    """
    Verify a PayPal webhook event using PayPal's certificate-based verification API.

    This calls the PayPal /v1/notifications/verify-webhook-signature endpoint,
    which is the recommended approach for server-side verification.

    Returns True if the signature is valid.
    """
    if not settings.paypal_webhook_id:
        logger.warning("paypal_webhook_id_not_set_skipping_verification")
        return True  # dev fallback

    import json

    try:
        body_dict = json.loads(raw_body)
    except Exception:
        return False

    payload = {
        "transmission_id":   transmission_id,
        "transmission_time": transmission_time,
        "cert_url":          cert_url,
        "auth_algo":         auth_algo,
        "transmission_sig":  transmission_sig,
        "webhook_id":        settings.paypal_webhook_id,
        "webhook_event":     body_dict,
    }

    try:
        result = await _paypal_request(
            "POST",
            "/v1/notifications/verify-webhook-signature",
            json=payload,
        )
        valid = result.get("verification_status") == "SUCCESS"
        if not valid:
            logger.warning("paypal_webhook_signature_invalid", status=result.get("verification_status"))
        return valid
    except PayPalError as exc:
        logger.error("paypal_webhook_verification_failed", error=str(exc))
        return False


# ---- Plan creation helpers (run once during setup) ----

PAYPAL_PRODUCTS: dict[str, dict] = {
    "individual": {
        "monthly_price": "29.00",
        "yearly_price":  "232.00",
        "description":   "IronID Individual — 10 000 signatures/month",
    },
    "studio": {
        "monthly_price": "199.00",
        "yearly_price":  "1908.00",
        "description":   "IronID Studio — 100 000 signatures/month",
    },
    "enterprise": {
        "monthly_price": "1200.00",
        "yearly_price":  "11520.00",
        "description":   "IronID Enterprise — Unlimited signatures",
    },
}


async def create_paypal_product(name: str, description: str) -> str:
    """Create a PayPal Product (catalog item). Returns the product ID."""
    result = await _paypal_request(
        "POST",
        "/v1/catalogs/products",
        json={
            "name":        name,
            "description": description,
            "type":        "SERVICE",
            "category":    "SOFTWARE",
        },
    )
    product_id = result["id"]
    logger.info("paypal_product_created", product_id=product_id, name=name)
    return product_id


async def send_paypal_payout(
    receiver_email: str,
    amount_usd: str,
    note: str = "IronID Affiliate Commission",
    currency: str = "USD",
) -> dict:
    """
    Send a single payout to an affiliate via the PayPal Payouts API.

    Requires the Payouts permission enabled in your PayPal app settings.
    Docs: https://developer.paypal.com/docs/api/payments.payouts-batch/v1/

    Args:
        receiver_email: The affiliate's PayPal email address.
        amount_usd: Amount as a string with 2 decimal places, e.g. "19.90".
        note: Optional note shown on the PayPal receipt.

    Returns:
        PayPal Payout Batch object.
    """
    import time

    payload = {
        "sender_batch_header": {
            "sender_batch_id": f"ironid_affiliate_{int(time.time())}",
            "email_subject":   "IronID — Votre commission d'affiliation",
            "email_message":   "Merci pour vos recommandations ! Voici votre commission IronID.",
        },
        "items": [
            {
                "recipient_type": "EMAIL",
                "amount":         {"value": amount_usd, "currency": currency},
                "note":           note,
                "receiver":       receiver_email,
                "sender_item_id": f"commission_{int(time.time())}",
            }
        ],
    }

    result = await _paypal_request("POST", "/v1/payments/payouts", json=payload)
    logger.info(
        "paypal_payout_sent",
        receiver=receiver_email,
        amount=amount_usd,
        batch_id=result.get("batch_header", {}).get("payout_batch_id"),
    )
    return result


async def create_paypal_billing_plan(
    product_id: str,
    name: str,
    price_usd: str,
    interval_unit: str = "MONTH",  # "MONTH" | "YEAR"
) -> str:
    """Create a PayPal Billing Plan for a subscription tier. Returns the plan ID."""
    result = await _paypal_request(
        "POST",
        "/v1/billing/plans",
        json={
            "product_id": product_id,
            "name": name,
            "status": "ACTIVE",
            "billing_cycles": [
                {
                    "frequency": {"interval_unit": interval_unit, "interval_count": 1},
                    "tenure_type": "REGULAR",
                    "sequence": 1,
                    "total_cycles": 0,  # 0 = infinite
                    "pricing_scheme": {
                        "fixed_price": {"value": price_usd, "currency_code": "USD"}
                    },
                }
            ],
            "payment_preferences": {
                "auto_bill_outstanding": True,
                "setup_fee_failure_action": "CONTINUE",
                "payment_failure_threshold": 3,
            },
        },
    )
    plan_id = result["id"]
    logger.info("paypal_plan_created", plan_id=plan_id, name=name, price=price_usd)
    return plan_id
