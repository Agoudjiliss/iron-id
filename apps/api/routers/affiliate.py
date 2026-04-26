"""
IronID — Affiliate Router.

Endpoints:
  GET   /v1/affiliate/link           Get or generate referral link
  GET   /v1/affiliate/stats          Full stats dashboard snapshot
  GET   /v1/affiliate/commissions    Paginated commissions list
  POST  /v1/affiliate/payout         Trigger payout for pending commissions (admin)
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from middleware.auth import get_current_user_from_session
from models.user import User
from services.affiliate_service import (
    get_affiliate_stats,
    get_commissions,
    get_or_create_affiliate_code,
    payout_pending_commissions,
)

settings = get_settings()
router = APIRouter(prefix="/v1/affiliate", tags=["Affiliation"])


# ---- Schemas ----

class AffiliateLinkResponse(BaseModel):
    code:           str
    link:           str
    cookie_days:    int = 90
    attribution:    str = "last-click"


class CommissionResponse(BaseModel):
    id:               uuid.UUID
    referred_user_id: uuid.UUID
    amount_cents:     int
    commission_cents: int
    commission_rate:  float
    status:           str
    created_at:       str
    paid_at:          str | None

    model_config = {"from_attributes": True}


class CommissionsListResponse(BaseModel):
    data:       list[CommissionResponse]
    total:      int
    page:       int
    page_size:  int


# ---- Routes ----

@router.get("/link", response_model=AffiliateLinkResponse, summary="Get referral link")
async def get_affiliate_link(
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> AffiliateLinkResponse:
    """
    Return (or generate) the authenticated user's referral link.
    Format: https://ironid.io?ref=<CODE>
    """
    code = await get_or_create_affiliate_code(db, user)
    link = f"{settings.frontend_url}?ref={code}"

    return AffiliateLinkResponse(code=code, link=link)


@router.get("/stats", summary="Affiliate dashboard stats")
async def affiliate_stats(
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Return a full stats snapshot for the affiliate dashboard:
    referral counts, commission totals, tier, next tier progress.
    """
    stats = await get_affiliate_stats(db, user.id)
    return stats


@router.get(
    "/commissions",
    response_model=CommissionsListResponse,
    summary="List commissions",
)
async def list_commissions(
    page:     int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> CommissionsListResponse:
    """Return paginated commission history for the authenticated affiliate."""

    if status_filter and status_filter not in ("pending", "paid", "cancelled"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "status must be pending | paid | cancelled", "code": "INVALID_STATUS"},
        )

    commissions, total = await get_commissions(
        db, user.id, page=page, page_size=page_size, status_filter=status_filter
    )

    return CommissionsListResponse(
        data=[
            CommissionResponse(
                id=c.id,
                referred_user_id=c.referred_user_id,
                amount_cents=c.amount_cents,
                commission_cents=c.commission_cents,
                commission_rate=float(c.commission_rate),
                status=c.status,
                created_at=c.created_at.isoformat(),
                paid_at=c.paid_at.isoformat() if c.paid_at else None,
            )
            for c in commissions
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/payout",
    summary="Trigger affiliate payouts (admin)",
    status_code=status.HTTP_200_OK,
)
async def trigger_payout(
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Trigger PayPal payouts for all pending commissions older than 30 days.
    In production this is called by a scheduled Celery beat task.
    This endpoint is exposed for admin use only — add IP allowlist in production.
    """
    if user.plan != "enterprise":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Admin only.", "code": "FORBIDDEN"},
        )

    result = await payout_pending_commissions(db)
    return result
