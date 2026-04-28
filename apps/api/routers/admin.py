"""
IronID — Admin Router.

Private endpoints secured by X-Admin-Key header.
Never expose these to end users.

Endpoints:
  GET  /v1/admin/stats              Platform-wide stats
  GET  /v1/admin/users              List all users (paginated)
  PATCH /v1/admin/users/{user_id}   Update a user's plan / limit
  POST /v1/admin/grant-trial        Grant enterprise trial
  GET  /v1/admin/trial-status       Check trial status for an email
  GET  /v1/admin/feedback           List enterprise feedback
  POST /v1/admin/coupons            Create a coupon
  GET  /v1/admin/coupons            List all coupons with usage
  PATCH /v1/admin/coupons/{code}    Toggle coupon active state
  DELETE /v1/admin/coupons/{code}   Delete a coupon
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.certification import Certification
from models.coupon import Coupon, CouponRedemption
from models.enterprise_feedback import EnterpriseFeedback
from models.user import User

settings = get_settings()
router = APIRouter(prefix="/v1/admin", tags=["Admin"])

TRIAL_DAYS = 30


# ─── Auth ────────────────────────────────────────────────────────────────────

def _require_admin(x_admin_key: str = Header(..., alias="X-Admin-Key")) -> None:
    """Verify the X-Admin-Key header matches the configured secret."""
    configured = settings.admin_secret_key
    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "Admin key not configured.", "code": "ADMIN_NOT_CONFIGURED"},
        )
    if x_admin_key != configured:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Invalid admin key.", "code": "UNAUTHORIZED"},
        )


# ─── Schemas ─────────────────────────────────────────────────────────────────

class GrantTrialRequest(BaseModel):
    email: EmailStr
    days: int = Field(default=TRIAL_DAYS, ge=1, le=365)
    note: str = ""


class TrialResponse(BaseModel):
    email: str
    plan: str
    monthly_signatures_limit: int
    trial_ends_at: str | None
    trial_active: bool


class FeedbackListResponse(BaseModel):
    total: int
    data: list[dict]


class UpdateUserRequest(BaseModel):
    plan: str | None = Field(
        default=None,
        pattern="^(free|payg|individual|studio|enterprise)$",
    )
    monthly_signatures_limit: int | None = Field(default=None, ge=-1)
    trial_ends_at: str | None = None  # ISO datetime string or null to clear


class CreateCouponRequest(BaseModel):
    code: str = Field(min_length=3, max_length=50, pattern="^[A-Z0-9_\\-]+$")
    plan: str = Field(
        default="individual",
        pattern="^(free|payg|individual|studio|enterprise)$",
    )
    signatures_bonus: int = Field(default=0, ge=-1)
    duration_days: int | None = Field(default=None, ge=1, le=3650)
    max_uses: int | None = Field(default=None, ge=1)
    expires_at: str | None = None  # ISO datetime string
    description: str | None = None


class PatchCouponRequest(BaseModel):
    is_active: bool | None = None
    max_uses: int | None = Field(default=None, ge=1)
    description: str | None = None


# ─── Stats ───────────────────────────────────────────────────────────────────

@router.get(
    "/stats",
    summary="Platform-wide stats",
    dependencies=[Depends(_require_admin)],
)
async def get_stats(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Return aggregate counts for the admin overview."""
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    users_today = (
        await db.execute(
            select(func.count()).select_from(User).where(User.created_at >= day_ago)
        )
    ).scalar_one()
    users_week = (
        await db.execute(
            select(func.count()).select_from(User).where(User.created_at >= week_ago)
        )
    ).scalar_one()

    total_certs = (
        await db.execute(select(func.count()).select_from(Certification))
    ).scalar_one()
    certs_today = (
        await db.execute(
            select(func.count())
            .select_from(Certification)
            .where(Certification.created_at >= day_ago)
        )
    ).scalar_one()
    certs_week = (
        await db.execute(
            select(func.count())
            .select_from(Certification)
            .where(Certification.created_at >= week_ago)
        )
    ).scalar_one()
    certs_month = (
        await db.execute(
            select(func.count())
            .select_from(Certification)
            .where(Certification.created_at >= month_ago)
        )
    ).scalar_one()

    # Plan breakdown
    plan_rows = (
        await db.execute(
            select(User.plan, func.count().label("count"))
            .group_by(User.plan)
        )
    ).all()
    plans = {row.plan: row.count for row in plan_rows}

    # Active trials
    active_trials = (
        await db.execute(
            select(func.count())
            .select_from(User)
            .where(User.trial_ends_at > now)
        )
    ).scalar_one()

    return {
        "users": {
            "total": total_users,
            "today": users_today,
            "this_week": users_week,
        },
        "certifications": {
            "total": total_certs,
            "today": certs_today,
            "this_week": certs_week,
            "this_month": certs_month,
        },
        "plans": plans,
        "active_trials": active_trials,
    }


# ─── Users ───────────────────────────────────────────────────────────────────

@router.get(
    "/users",
    summary="List all users",
    dependencies=[Depends(_require_admin)],
)
async def list_users(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    plan: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> dict[str, Any]:
    query = select(User).order_by(User.created_at.desc())

    if plan:
        query = query.where(User.plan == plan)
    if search:
        query = query.where(User.email.ilike(f"%{search}%"))

    total_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(total_query)).scalar_one()

    offset = (page - 1) * page_size
    users_result = await db.execute(query.offset(offset).limit(page_size))
    users = users_result.scalars().all()

    now = datetime.now(timezone.utc)

    def _user_dict(u: User) -> dict:
        trial_ends = u.trial_ends_at
        if trial_ends and trial_ends.tzinfo is None:
            trial_ends = trial_ends.replace(tzinfo=timezone.utc)
        return {
            "id": str(u.id),
            "email": u.email,
            "plan": u.plan,
            "monthly_signatures_used": u.monthly_signatures_used,
            "monthly_signatures_limit": u.monthly_signatures_limit,
            "trial_ends_at": trial_ends.isoformat() if trial_ends else None,
            "trial_active": trial_ends is not None and trial_ends > now,
            "created_at": u.created_at.isoformat(),
        }

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": [_user_dict(u) for u in users],
    }


@router.patch(
    "/users/{user_id}",
    summary="Update a user's plan or limit",
    dependencies=[Depends(_require_admin)],
)
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "User not found.", "code": "USER_NOT_FOUND"},
        )

    if body.plan is not None:
        user.plan = body.plan
    if body.monthly_signatures_limit is not None:
        user.monthly_signatures_limit = body.monthly_signatures_limit
    if body.trial_ends_at is not None:
        try:
            user.trial_ends_at = datetime.fromisoformat(body.trial_ends_at)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invalid trial_ends_at format.", "code": "INVALID_BODY"},
            )
    elif "trial_ends_at" in body.model_fields_set:
        # Explicitly set to null
        user.trial_ends_at = None

    await db.flush()
    return {"ok": True, "user_id": user_id, "plan": user.plan}


# ─── Enterprise Trial ─────────────────────────────────────────────────────────

@router.post(
    "/grant-trial",
    response_model=TrialResponse,
    summary="Grant enterprise trial to a user",
    dependencies=[Depends(_require_admin)],
)
async def grant_trial(
    body: GrantTrialRequest,
    db: AsyncSession = Depends(get_db),
) -> TrialResponse:
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"User '{body.email}' not found.", "code": "USER_NOT_FOUND"},
        )

    now = datetime.now(timezone.utc)
    user.plan = "enterprise"
    user.monthly_signatures_limit = -1
    user.trial_ends_at = now + timedelta(days=body.days)

    await db.flush()

    return TrialResponse(
        email=user.email,
        plan=user.plan,
        monthly_signatures_limit=user.monthly_signatures_limit,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        trial_active=True,
    )


@router.get(
    "/trial-status",
    response_model=TrialResponse,
    summary="Check enterprise trial status for a user",
    dependencies=[Depends(_require_admin)],
)
async def trial_status(
    email: str,
    db: AsyncSession = Depends(get_db),
) -> TrialResponse:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"User '{email}' not found.", "code": "USER_NOT_FOUND"},
        )

    now = datetime.now(timezone.utc)
    trial_active = (
        user.trial_ends_at is not None
        and user.trial_ends_at.replace(tzinfo=timezone.utc) > now
    )

    return TrialResponse(
        email=user.email,
        plan=user.plan,
        monthly_signatures_limit=user.monthly_signatures_limit,
        trial_ends_at=user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        trial_active=trial_active,
    )


# ─── Feedback ─────────────────────────────────────────────────────────────────

@router.get(
    "/feedback",
    response_model=FeedbackListResponse,
    summary="List all enterprise feedback",
    dependencies=[Depends(_require_admin)],
)
async def list_feedback(db: AsyncSession = Depends(get_db)) -> FeedbackListResponse:
    result = await db.execute(
        select(EnterpriseFeedback).order_by(EnterpriseFeedback.created_at.desc())
    )
    entries = result.scalars().all()

    return FeedbackListResponse(
        total=len(entries),
        data=[
            {
                "id": e.id,
                "email": e.email,
                "company": e.company,
                "rating": e.rating,
                "performance_score": e.performance_score,
                "message": e.message,
                "use_case": e.use_case,
                "volume_estimate": e.volume_estimate,
                "ready_to_sign": e.ready_to_sign,
                "created_at": e.created_at.isoformat(),
            }
            for e in entries
        ],
    )


# ─── Coupons ──────────────────────────────────────────────────────────────────

@router.post(
    "/coupons",
    summary="Create a coupon",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(_require_admin)],
)
async def create_coupon(
    body: CreateCouponRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Check uniqueness
    existing = (
        await db.execute(select(Coupon).where(Coupon.code == body.code.upper()))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": f"Coupon code '{body.code}' already exists.", "code": "CONFLICT"},
        )

    expires_at = None
    if body.expires_at:
        try:
            expires_at = datetime.fromisoformat(body.expires_at)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Invalid expires_at format.", "code": "INVALID_BODY"},
            )

    coupon = Coupon(
        code=body.code.upper(),
        plan=body.plan,
        signatures_bonus=body.signatures_bonus,
        duration_days=body.duration_days,
        max_uses=body.max_uses,
        expires_at=expires_at,
        description=body.description,
        is_active=True,
    )
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)

    return {
        "id": str(coupon.id),
        "code": coupon.code,
        "plan": coupon.plan,
        "signatures_bonus": coupon.signatures_bonus,
        "duration_days": coupon.duration_days,
        "max_uses": coupon.max_uses,
        "expires_at": coupon.expires_at.isoformat() if coupon.expires_at else None,
        "description": coupon.description,
        "is_active": coupon.is_active,
        "created_at": coupon.created_at.isoformat(),
        "redemptions_count": 0,
    }


@router.get(
    "/coupons",
    summary="List all coupons with usage",
    dependencies=[Depends(_require_admin)],
)
async def list_coupons(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    coupons = result.scalars().all()

    # Redemption counts per coupon
    counts_result = await db.execute(
        select(
            CouponRedemption.coupon_id,
            func.count().label("cnt"),
        ).group_by(CouponRedemption.coupon_id)
    )
    counts = {str(row.coupon_id): row.cnt for row in counts_result.all()}

    data = []
    for c in coupons:
        redemptions_count = counts.get(str(c.id), 0)
        data.append(
            {
                "id": str(c.id),
                "code": c.code,
                "plan": c.plan,
                "signatures_bonus": c.signatures_bonus,
                "duration_days": c.duration_days,
                "max_uses": c.max_uses,
                "expires_at": c.expires_at.isoformat() if c.expires_at else None,
                "description": c.description,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat(),
                "redemptions_count": redemptions_count,
            }
        )

    return {"total": len(data), "data": data}


@router.patch(
    "/coupons/{code}",
    summary="Update a coupon",
    dependencies=[Depends(_require_admin)],
)
async def patch_coupon(
    code: str,
    body: PatchCouponRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    result = await db.execute(
        select(Coupon).where(Coupon.code == code.upper())
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Coupon not found.", "code": "NOT_FOUND"},
        )

    if body.is_active is not None:
        coupon.is_active = body.is_active
    if body.max_uses is not None:
        coupon.max_uses = body.max_uses
    if body.description is not None:
        coupon.description = body.description

    await db.flush()
    return {"ok": True, "code": coupon.code, "is_active": coupon.is_active}


@router.delete(
    "/coupons/{code}",
    summary="Delete a coupon",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(_require_admin)],
)
async def delete_coupon(
    code: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(Coupon).where(Coupon.code == code.upper())
    )
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Coupon not found.", "code": "NOT_FOUND"},
        )
    await db.delete(coupon)
    await db.flush()
