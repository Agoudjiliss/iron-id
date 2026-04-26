"""
IronID — Affiliate Service.

Handles commission calculation, tracking, stats, and PayPal Payouts.

Commission tiers (based on number of active referrals):
  iron     :  0–5  active → 10%
  silver   :  6–20 active → 12%
  gold     : 21–50 active → 15%
  platinum : 50+   active → 20%

Payout delay: J+30 after the transaction (anti-fraud hold).
"""

import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import structlog
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.affiliate import AffiliateCommission
from models.user import User

logger = structlog.get_logger()

COMMISSION_RATES: list[tuple[int, float]] = [
    (50, 0.20),   # platinum : 50+ actifs
    (21, 0.15),   # gold     : 21–50 actifs
    (6,  0.12),   # silver   :  6–20 actifs
    (0,  0.10),   # iron     :  0–5 actifs
]

PAYOUT_DELAY_DAYS = 30  # Anti-fraud hold before payout is released

TIER_NAMES = {0.20: "Platinum", 0.15: "Gold", 0.12: "Silver", 0.10: "Iron"}


# ---- Code generation ----

def generate_affiliate_code(length: int = 8) -> str:
    """
    Generate a short, URL-safe affiliate code.
    Uses uppercase letters and digits, avoiding ambiguous characters (0, O, I, l).
    """
    alphabet = string.ascii_uppercase.replace("O", "").replace("I", "") + string.digits.replace("0", "")
    return "".join(secrets.choice(alphabet) for _ in range(length))


async def get_or_create_affiliate_code(db: AsyncSession, user: User) -> str:
    """
    Return the user's existing affiliate code, or generate and persist a new one.
    Guaranteed unique via retry loop.
    """
    if user.affiliate_code:
        return user.affiliate_code

    for _ in range(10):  # retry on collision
        code = generate_affiliate_code()
        existing = await db.execute(select(User).where(User.affiliate_code == code))
        if not existing.scalar_one_or_none():
            user.affiliate_code = code
            await db.flush()
            logger.info("affiliate_code_generated", user_id=str(user.id), code=code)
            return code

    raise RuntimeError("Failed to generate a unique affiliate code after 10 attempts.")


# ---- Referral attribution ----

async def attribute_referral(
    db: AsyncSession,
    new_user: User,
    ref_code: str,
) -> bool:
    """
    Attribute a new user to the affiliate with the given code.
    Called during Clerk webhook on user.created.

    Returns True if attribution succeeded.
    """
    if new_user.referred_by:
        return False  # Already attributed

    result = await db.execute(select(User).where(User.affiliate_code == ref_code.upper()))
    affiliate = result.scalar_one_or_none()

    if not affiliate or affiliate.id == new_user.id:
        return False  # Code not found or self-referral

    new_user.referred_by = affiliate.id
    logger.info(
        "referral_attributed",
        new_user_id=str(new_user.id),
        affiliate_id=str(affiliate.id),
        code=ref_code,
    )
    return True


# ---- Commission calculation ----

async def count_active_referrals(db: AsyncSession, affiliate_user_id: uuid.UUID) -> int:
    """Count active (paying) referrals for an affiliate."""
    result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(
            User.referred_by == affiliate_user_id,
            User.plan.in_(["payg", "individual", "studio", "enterprise"]),
        )
    )
    return result.scalar_one() or 0


def get_commission_rate(active_count: int) -> float:
    """Return the commission rate based on active referral count."""
    for threshold, rate in COMMISSION_RATES:
        if active_count >= threshold:
            return rate
    return 0.10


def get_tier_name(rate: float) -> str:
    """Return the tier label for a commission rate."""
    return TIER_NAMES.get(rate, "Iron")


async def process_affiliate_commission(
    db: AsyncSession,
    *,
    referred_user_id: uuid.UUID,
    amount_cents: int,
    paypal_capture_id: str | None = None,
) -> AffiliateCommission | None:
    """
    Calculate and persist an affiliate commission for a payment.

    Args:
        referred_user_id: The user who made the payment.
        amount_cents: Payment amount in cents.
        paypal_capture_id: PayPal sale/capture ID.

    Returns:
        The created AffiliateCommission, or None if no affiliate found.
    """
    result = await db.execute(select(User).where(User.id == referred_user_id))
    referred_user = result.scalar_one_or_none()

    if not referred_user or not referred_user.referred_by:
        return None

    affiliate_id = referred_user.referred_by
    active_count = await count_active_referrals(db, affiliate_id)
    rate         = get_commission_rate(active_count)
    commission   = int(amount_cents * rate)

    entry = AffiliateCommission(
        affiliate_user_id=affiliate_id,
        referred_user_id=referred_user_id,
        paypal_capture_id=paypal_capture_id,
        amount_cents=amount_cents,
        commission_cents=commission,
        commission_rate=Decimal(str(rate)),
        status="pending",
    )
    db.add(entry)
    await db.flush()

    logger.info(
        "affiliate_commission_created",
        affiliate_id=str(affiliate_id),
        referred_user=str(referred_user_id),
        amount_cents=amount_cents,
        commission_cents=commission,
        rate=rate,
        tier=get_tier_name(rate),
    )
    return entry


# ---- Stats ----

async def get_affiliate_stats(
    db: AsyncSession,
    affiliate_user_id: uuid.UUID,
) -> dict:
    """
    Return a full stats snapshot for an affiliate's dashboard.
    """
    # Total referrals
    total_res = await db.execute(
        select(func.count()).select_from(User).where(User.referred_by == affiliate_user_id)
    )
    total_referrals = total_res.scalar_one() or 0

    # Active referrals (paying plans)
    active_count = await count_active_referrals(db, affiliate_user_id)

    # Commission totals
    commission_res = await db.execute(
        select(
            func.sum(AffiliateCommission.commission_cents).label("total"),
            func.sum(
                AffiliateCommission.commission_cents
            ).filter(AffiliateCommission.status == "paid").label("paid"),
            func.sum(
                AffiliateCommission.commission_cents
            ).filter(AffiliateCommission.status == "pending").label("pending"),
        ).where(AffiliateCommission.affiliate_user_id == affiliate_user_id)
    )
    row = commission_res.one()
    total_cents   = row.total   or 0
    paid_cents    = row.paid    or 0
    pending_cents = row.pending or 0

    rate      = get_commission_rate(active_count)
    tier_name = get_tier_name(rate)
    next_tier = _next_tier(active_count)

    return {
        "total_referrals":     total_referrals,
        "active_referrals":    active_count,
        "tier":                tier_name,
        "commission_rate":     rate,
        "next_tier":           next_tier,
        "total_earned_cents":  total_cents,
        "paid_cents":          paid_cents,
        "pending_cents":       pending_cents,
    }


def _next_tier(active_count: int) -> dict | None:
    """Return info about the next commission tier, or None if already at max."""
    thresholds = [(50, 0.20, "Platinum"), (21, 0.15, "Gold"), (6, 0.12, "Silver")]
    for threshold, rate, name in thresholds:
        if active_count < threshold:
            return {
                "name":      name,
                "rate":      rate,
                "required":  threshold,
            }
    return None


async def get_commissions(
    db: AsyncSession,
    affiliate_user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    status_filter: str | None = None,
) -> tuple[list[AffiliateCommission], int]:
    """Return paginated commissions for an affiliate."""
    base = select(AffiliateCommission).where(
        AffiliateCommission.affiliate_user_id == affiliate_user_id
    )
    if status_filter:
        base = base.where(AffiliateCommission.status == status_filter)

    count_res = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_res.scalar_one() or 0

    result = await db.execute(
        base.order_by(AffiliateCommission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(result.scalars().all()), total


# ---- PayPal Payouts ----

async def payout_pending_commissions(db: AsyncSession) -> dict:
    """
    Send pending commissions (≥ J+30) to affiliates via PayPal Payouts.
    Called by a scheduled task or admin endpoint.

    Returns a summary of paid/failed payouts.
    """
    from services.paypal_service import send_paypal_payout

    cutoff = datetime.now(tz=timezone.utc) - timedelta(days=PAYOUT_DELAY_DAYS)

    # Group pending commissions by affiliate (sum amounts)
    result = await db.execute(
        select(
            AffiliateCommission.affiliate_user_id,
            func.sum(AffiliateCommission.commission_cents).label("total"),
        )
        .where(
            AffiliateCommission.status == "pending",
            AffiliateCommission.created_at <= cutoff,
        )
        .group_by(AffiliateCommission.affiliate_user_id)
    )
    payouts = result.all()

    paid_count = 0
    failed_count = 0
    errors: list[str] = []

    for affiliate_id, total_cents in payouts:
        if total_cents < 100:  # Minimum $1.00 payout
            continue

        # Get affiliate's email
        user_res = await db.execute(select(User).where(User.id == affiliate_id))
        affiliate = user_res.scalar_one_or_none()
        if not affiliate:
            continue

        total_usd = f"{total_cents / 100:.2f}"
        try:
            await send_paypal_payout(
                receiver_email=affiliate.email,
                amount_usd=total_usd,
                note=f"IronID Affiliate Commission — {datetime.now().strftime('%B %Y')}",
            )
            # Mark commissions as paid
            await db.execute(
                update(AffiliateCommission)
                .where(
                    AffiliateCommission.affiliate_user_id == affiliate_id,
                    AffiliateCommission.status == "pending",
                    AffiliateCommission.created_at <= cutoff,
                )
                .values(status="paid", paid_at=datetime.now(tz=timezone.utc))
            )
            paid_count += 1
            logger.info(
                "affiliate_payout_sent",
                affiliate_id=str(affiliate_id),
                amount_usd=total_usd,
            )
        except Exception as exc:
            failed_count += 1
            errors.append(f"{affiliate_id}: {exc}")
            logger.error("affiliate_payout_failed", affiliate_id=str(affiliate_id), error=str(exc))

    return {"paid": paid_count, "failed": failed_count, "errors": errors}
