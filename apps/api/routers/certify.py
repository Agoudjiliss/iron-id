"""
IronID — Certification Router.

Endpoints:
  POST  /v1/certify            Submit a file for certification (async)
  GET   /v1/certify/{id}       Poll the status of a certification
  GET   /v1/certifications     List user's certifications (paginated)
"""

import base64
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from middleware.auth import get_current_user
from models.api_key import APIKey
from models.certification import Certification
from models.user import User
from services.file_service import validate_and_read_upload
from services.ledger_service import count_certifications_this_month
from tasks.certify_task import run_certification

settings = get_settings()
router = APIRouter(prefix="/v1", tags=["Certifications"])


# --- Schemas ---

class CertificationStatusResponse(BaseModel):
    id: uuid.UUID
    status: str
    file_hash_sha256: str | None
    file_name: str | None
    file_size_bytes: int | None
    file_mime_type: str | None
    c2pa_manifest: dict | None
    c2pa_signature: str | None
    certified_url: str | None
    verification_url: str | None
    ledger_entry_id: int | None = None
    metadata: dict
    created_at: str
    webhook_url: str | None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, cert: Certification) -> "CertificationStatusResponse":
        return cls(
            id=cert.id,
            status=cert.status,
            file_hash_sha256=cert.file_hash_sha256,
            file_name=cert.file_name,
            file_size_bytes=cert.file_size_bytes,
            file_mime_type=cert.file_mime_type,
            c2pa_manifest=cert.c2pa_manifest,
            c2pa_signature=cert.c2pa_signature,
            certified_url=cert.certified_url,
            verification_url=(
                f"https://ironid.io/verify/{cert.file_hash_sha256}"
                if cert.file_hash_sha256 else None
            ),
            metadata=cert.metadata_ or {},
            created_at=cert.created_at.isoformat(),
            webhook_url=cert.webhook_url,
        )


class CertificationListResponse(BaseModel):
    data: list[CertificationStatusResponse]
    total: int
    page: int
    page_size: int


# --- Routes ---

@router.post(
    "/certify",
    response_model=CertificationStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit a file for certification",
)
async def certify_file(
    request: Request,
    file: UploadFile = File(..., description="File to certify (max 500 MB depending on plan)"),
    metadata: str = Form(default="{}", description="JSON string of custom metadata"),
    webhook_url: str | None = Form(default=None, description="Callback URL for async notification"),
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificationStatusResponse:
    """
    Submit a file for C2PA certification.

    The file is validated synchronously (MIME type, size), then queued for
    async processing (R2 upload, C2PA signing, Ledger write).

    Poll GET /v1/certify/{id} for the result, or provide a webhook_url.
    """
    import json

    user, api_key = auth

    # Parse metadata JSON
    try:
        user_metadata = json.loads(metadata) if metadata else {}
        if not isinstance(user_metadata, dict):
            raise ValueError("metadata must be a JSON object")
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": f"Invalid metadata JSON: {exc}", "code": "INVALID_METADATA"},
        )

    # Check monthly signature quota
    if user.monthly_signatures_limit != -1:
        used = await count_certifications_this_month(db, user.id)
        if used >= user.monthly_signatures_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": (
                        f"Monthly signature limit reached "
                        f"({user.monthly_signatures_limit} for '{user.plan}' plan)."
                    ),
                    "code": "QUOTA_EXCEEDED",
                },
            )

    # Validate file (MIME type + size) and compute SHA-256
    try:
        sha256_hex, file_content, detected_mime = await validate_and_read_upload(
            file, user.plan
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": str(exc), "code": "INVALID_FILE"},
        )

    # Create the Certification record in 'pending' state
    cert = Certification(
        user_id=user.id,
        api_key_id=api_key.id,
        file_hash_sha256=sha256_hex,
        file_name=file.filename or "unknown",
        file_size_bytes=len(file_content),
        file_mime_type=detected_mime,
        status="pending",
        metadata_=user_metadata,
        webhook_url=webhook_url,
    )
    db.add(cert)
    await db.flush()  # get the cert.id

    # Enqueue async Celery task
    run_certification.delay(
        certification_id=str(cert.id),
        file_content_b64=base64.b64encode(file_content).decode(),
        file_name=cert.file_name,
        file_mime_type=detected_mime,
        file_size_bytes=len(file_content),
        user_id=str(user.id),
        user_plan=user.plan,
        metadata=user_metadata,
        webhook_url=webhook_url,
    )

    return CertificationStatusResponse.from_orm(cert)


@router.get(
    "/certify/{certification_id}",
    response_model=CertificationStatusResponse,
    summary="Get certification status",
)
async def get_certification(
    certification_id: uuid.UUID,
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificationStatusResponse:
    """
    Retrieve the current status and result of a certification.
    Only the owner can access their own certifications.
    """
    user, _ = auth

    result = await db.execute(
        select(Certification).where(
            Certification.id == certification_id,
            Certification.user_id == user.id,
        )
    )
    cert = result.scalar_one_or_none()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Certification not found.", "code": "NOT_FOUND"},
        )

    return CertificationStatusResponse.from_orm(cert)


@router.get(
    "/certifications",
    response_model=CertificationListResponse,
    summary="List certifications (paginated)",
)
async def list_certifications(
    page: int = 1,
    page_size: int = 20,
    status_filter: str | None = None,
    auth: tuple[User, APIKey] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CertificationListResponse:
    """
    Return a paginated list of the authenticated user's certifications.

    Query params:
      - page: page number (1-indexed)
      - page_size: results per page (max 100)
      - status_filter: filter by status ('pending', 'certified', 'failed', etc.)
    """
    user, _ = auth
    page_size = min(page_size, 100)
    offset = (page - 1) * page_size

    base_query = select(Certification).where(Certification.user_id == user.id)

    if status_filter and status_filter in ("pending", "processing", "certified", "failed"):
        base_query = base_query.where(Certification.status == status_filter)

    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar_one()

    # Fetch page
    result = await db.execute(
        base_query.order_by(Certification.created_at.desc()).offset(offset).limit(page_size)
    )
    certs = result.scalars().all()

    return CertificationListResponse(
        data=[CertificationStatusResponse.from_orm(c) for c in certs],
        total=total,
        page=page,
        page_size=page_size,
    )
