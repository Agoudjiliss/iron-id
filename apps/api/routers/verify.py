"""
IronID — Verification Router.

Endpoints (all public — no auth required):
  POST  /v1/verify            Verify a file by upload (extracts hash server-side)
  GET   /v1/verify/{hash}     Lookup certification by SHA-256 hash
"""

import hashlib
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.certification import Certification
from services.ledger_service import lookup_by_hash, record_verified

settings = get_settings()
router = APIRouter(prefix="/v1", tags=["Verification"])


# --- Schemas ---

class VerificationResponse(BaseModel):
    is_certified: bool
    file_hash_sha256: str
    certification_id: uuid.UUID | None = None
    certified_at: str | None = None
    file_name: str | None = None
    file_mime_type: str | None = None
    verification_url: str | None = None
    c2pa_manifest: dict | None = None
    ledger_history_count: int = 0


def _build_verification_response(
    sha256_hex: str,
    cert: Certification | None,
    ledger_count: int = 0,
) -> VerificationResponse:
    if not cert:
        return VerificationResponse(
            is_certified=False,
            file_hash_sha256=sha256_hex,
        )

    return VerificationResponse(
        is_certified=True,
        file_hash_sha256=sha256_hex,
        certification_id=cert.id,
        certified_at=cert.created_at.isoformat(),
        file_name=cert.file_name,
        file_mime_type=cert.file_mime_type,
        verification_url=f"https://ironid.io/verify/{sha256_hex}",
        c2pa_manifest=cert.c2pa_manifest,
        ledger_history_count=ledger_count,
    )


def _get_actor_info(request: Request) -> tuple[str | None, str | None]:
    """Extract IP and User-Agent from request for ledger audit trail."""
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    return ip, ua


# --- Routes ---

@router.post(
    "/verify",
    response_model=VerificationResponse,
    summary="Verify a file by uploading it",
)
async def verify_by_upload(
    request: Request,
    file: UploadFile = File(..., description="File to verify"),
    db: AsyncSession = Depends(get_db),
) -> VerificationResponse:
    """
    Compute the SHA-256 hash of the uploaded file server-side,
    then look it up in the IronID ledger.

    No authentication required — this endpoint is public.
    """
    # Stream file and compute hash
    hasher = hashlib.sha256()
    total = 0
    max_size = 500 * 1024 * 1024  # 500 MB hard cap for public endpoint

    await file.seek(0)
    while chunk := await file.read(65536):
        total += len(chunk)
        if total > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={"error": "File exceeds 500 MB limit.", "code": "FILE_TOO_LARGE"},
            )
        hasher.update(chunk)

    sha256_hex = hasher.hexdigest()

    # Lookup in Ledger
    cert = await lookup_by_hash(db, sha256_hex)
    actor_ip, actor_ua = _get_actor_info(request)

    # Record verification event
    await record_verified(
        db,
        file_hash_sha256=sha256_hex,
        certification_id=cert.id if cert else None,
        actor_ip=actor_ip,
        actor_user_agent=actor_ua,
    )

    return _build_verification_response(sha256_hex, cert)


@router.get(
    "/verify/{file_hash}",
    response_model=VerificationResponse,
    summary="Lookup certification by SHA-256 hash (public)",
)
async def verify_by_hash(
    file_hash: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> VerificationResponse:
    """
    Public endpoint: look up any file's certification status by its SHA-256 hash.
    No authentication required.

    Also records a 'verified' event in the immutable ledger for auditability.
    """
    # Validate hash format (64 hex chars)
    if len(file_hash) != 64 or not all(c in "0123456789abcdefABCDEF" for c in file_hash):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "Invalid SHA-256 hash format.", "code": "INVALID_HASH"},
        )

    sha256_hex = file_hash.lower()
    cert = await lookup_by_hash(db, sha256_hex)
    actor_ip, actor_ua = _get_actor_info(request)

    # Record verification event in Ledger (even for uncertified files)
    await record_verified(
        db,
        file_hash_sha256=sha256_hex,
        certification_id=cert.id if cert else None,
        actor_ip=actor_ip,
        actor_user_agent=actor_ua,
    )

    if not cert:
        # Return 200 with is_certified=False (not a 404 — the hash is valid, just not certified)
        return VerificationResponse(
            is_certified=False,
            file_hash_sha256=sha256_hex,
        )

    return _build_verification_response(sha256_hex, cert)
