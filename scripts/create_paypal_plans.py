"""
IronID — Create PayPal Subscription Plans.

Run this script ONCE to create the 4 subscription plans in PayPal.
It outputs the Plan IDs to paste into Railway env vars.

Usage:
    python scripts/create_paypal_plans.py
"""

import base64
import json
import sys
import urllib.request
import urllib.error

# ---- CONFIG — paste your credentials here ----
CLIENT_ID     = "ARBwNFVc5fW_9FmsNmDev3e_s-wBFWQ8dEW-n46azKPsWutAsP8iR3cG01Vet7kWiHDIwlRWBP_fH9t0"
CLIENT_SECRET = "EAn7AhGP6tXCa-En6LBHm_8S2gtM7EyszNVSTFOuSFklo-Atr4yVo9e5qumNRzx8ms-IKwKa6HgUGVMO"
MODE          = "live"   # "sandbox" or "live"
# --------------------------------------------------

BASE = "https://api-m.paypal.com" if MODE == "live" else "https://api-m.sandbox.paypal.com"


def paypal_post(path: str, body: dict, token: str) -> dict:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"\n  ERROR {e.code}: {e.read().decode()}")
        sys.exit(1)


def get_token() -> str:
    creds = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    data = b"grant_type=client_credentials"
    req = urllib.request.Request(
        f"{BASE}/v1/oauth2/token",
        data=data,
        headers={
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["access_token"]


def main():
    print(f"\n{'='*60}")
    print(f"  IronID — PayPal Plan Setup ({MODE.upper()})")
    print(f"{'='*60}\n")

    print("1. Getting access token...")
    token = get_token()
    print("   ✓ Authenticated\n")

    # ---- Step 1: Create the Product ----
    print("2. Creating PayPal Product (IronID)...")
    product = paypal_post(
        "/v1/catalogs/products",
        {
            "name": "IronID",
            "description": "C2PA digital certification & provenance ledger",
            "type": "SERVICE",
            "category": "SOFTWARE",
        },
        token,
    )
    product_id = product["id"]
    print(f"   ✓ Product ID: {product_id}\n")

    # ---- Step 2: Create Plans ----
    plans_config = [
        {
            "env_key": "PAYPAL_PLAN_INDIVIDUAL_MONTHLY",
            "name": "IronID Individual — Monthly",
            "amount": "29.00",
            "interval_unit": "MONTH",
            "interval_count": 1,
        },
        {
            "env_key": "PAYPAL_PLAN_INDIVIDUAL_YEARLY",
            "name": "IronID Individual — Yearly",
            "amount": "232.00",
            "interval_unit": "YEAR",
            "interval_count": 1,
        },
        {
            "env_key": "PAYPAL_PLAN_STUDIO_MONTHLY",
            "name": "IronID Studio — Monthly",
            "amount": "199.00",
            "interval_unit": "MONTH",
            "interval_count": 1,
        },
        {
            "env_key": "PAYPAL_PLAN_STUDIO_YEARLY",
            "name": "IronID Studio — Yearly",
            "amount": "1908.00",
            "interval_unit": "YEAR",
            "interval_count": 1,
        },
    ]

    print("3. Creating subscription plans...\n")
    results = []

    for cfg in plans_config:
        print(f"   Creating: {cfg['name']}...")
        plan = paypal_post(
            "/v1/billing/plans",
            {
                "product_id": product_id,
                "name": cfg["name"],
                "description": cfg["name"],
                "status": "ACTIVE",
                "billing_cycles": [
                    {
                        "frequency": {
                            "interval_unit": cfg["interval_unit"],
                            "interval_count": cfg["interval_count"],
                        },
                        "tenure_type": "REGULAR",
                        "sequence": 1,
                        "total_cycles": 0,  # 0 = infinite
                        "pricing_scheme": {
                            "fixed_price": {
                                "value": cfg["amount"],
                                "currency_code": "USD",
                            }
                        },
                    }
                ],
                "payment_preferences": {
                    "auto_bill_outstanding": True,
                    "payment_failure_threshold": 3,
                },
            },
            token,
        )
        plan_id = plan["id"]
        results.append({"env_key": cfg["env_key"], "plan_id": plan_id})
        print(f"   ✓ {plan_id}\n")

    # ---- Output ----
    print(f"\n{'='*60}")
    print("  Add these to Railway (API service → Variables):")
    print(f"{'='*60}\n")
    for r in results:
        print(f"  {r['env_key']}={r['plan_id']}")
    print()


if __name__ == "__main__":
    main()
