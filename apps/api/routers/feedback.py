"""
IronID — Enterprise Feedback Router.

Endpoints:
  POST /v1/feedback    Submit trial feedback (requires auth)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_user_from_session
from models.enterprise_feedback import EnterpriseFeedback
from models.user import User

router = APIRouter(prefix="/v1", tags=["Feedback"])


class FeedbackRequest(BaseModel):
    company: str = Field(default="", max_length=255)
    rating: int = Field(..., ge=1, le=5, description="Overall experience 1–5")
    performance_score: int = Field(..., ge=1, le=5, description="API performance 1–5")
    message: str = Field(..., min_length=10, max_length=5000)
    use_case: str = Field(default="", max_length=100)
    volume_estimate: str = Field(
        default="",
        max_length=100,
        description="Estimated monthly certifications in production",
    )
    ready_to_sign: bool = Field(default=False, description="Ready to sign a commercial agreement")

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty.")
        return v.strip()


class FeedbackResponse(BaseModel):
    id: int
    message: str


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit enterprise trial feedback",
)
async def submit_feedback(
    body: FeedbackRequest,
    user: User = Depends(get_current_user_from_session),
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponse:
    """
    Submit structured feedback after an enterprise trial.
    Only authenticated users can submit feedback (session token required).
    """
    entry = EnterpriseFeedback(
        user_id=user.id,
        email=user.email,
        company=body.company or None,
        rating=body.rating,
        performance_score=body.performance_score,
        message=body.message,
        use_case=body.use_case or None,
        volume_estimate=body.volume_estimate or None,
        ready_to_sign=body.ready_to_sign,
    )
    db.add(entry)
    await db.flush()

    return FeedbackResponse(
        id=entry.id,
        message="Feedback received — thank you. Our team will follow up within 48 hours.",
    )
