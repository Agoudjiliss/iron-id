"""
IronID — Stats Router.

Endpoints:
  GET /v1/usage   Monthly usage stats + daily signature chart data
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import cast, Date, extract, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user_from_session
from models.certification import Certification
from models.user import User

router = APIRouter(prefix="/v1", tags=["Stats"])


@router.get("/usage", summary="Monthly usage stats")
async def get_usage(
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Return the authenticated user's monthly quota and daily certification counts.
    Used by the Usage dashboard page.
    """
    now = datetime.now(timezone.utc)

    # Daily certification counts for the current month
    daily_result = await db.execute(
        select(
            cast(Certification.created_at, Date).label("day"),
            func.count().label("count"),
        )
        .where(
            Certification.user_id == user.id,
            extract("year", Certification.created_at) == now.year,
            extract("month", Certification.created_at) == now.month,
        )
        .group_by(cast(Certification.created_at, Date))
        .order_by(cast(Certification.created_at, Date))
    )
    daily = [{"date": str(row.day), "count": row.count} for row in daily_result]

    trial_ends_at = None
    trial_active  = False
    if user.trial_ends_at is not None:
        from datetime import timezone as _tz
        trial_ts = user.trial_ends_at
        if trial_ts.tzinfo is None:
            trial_ts = trial_ts.replace(tzinfo=_tz.utc)
        trial_ends_at = trial_ts.isoformat()
        trial_active  = now.replace(tzinfo=_tz.utc) < trial_ts

    return {
        "plan": user.plan,
        "used": user.monthly_signatures_used,
        "limit": user.monthly_signatures_limit,
        "daily": daily,
        "trial_ends_at": trial_ends_at,
        "trial_active":  trial_active,
    }
