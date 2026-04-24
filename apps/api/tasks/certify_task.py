"""
IronID — Celery Task: Certification Pipeline.

This task handles the full certification workflow asynchronously:
  1. Mark certification as 'processing'
  2. Upload original file to Cloudflare R2
  3. Build & sign C2PA manifest
  4. Write 'certified' event to the immutable Ledger
  5. Mark certification as 'certified'
  6. Trigger webhook notification (if configured)

Triggered by POST /v1/certify after the initial DB record is created.
"""

import asyncio
import uuid
from datetime import datetime, timezone

import structlog
from celery import Task

from tasks.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    bind=True,
    name="tasks.certify_task.run_certification",
    max_retries=3,
    default_retry_delay=10,
    acks_late=True,
)
def run_certification(
    self: Task,
    certification_id: str,
    file_content_b64: str,  # base64-encoded file bytes
    file_name: str,
    file_mime_type: str,
    file_size_bytes: int,
    user_id: str,
    user_plan: str,
    metadata: dict,
    webhook_url: str | None,
) -> dict:
    """
    Main certification pipeline task.

    Args:
        certification_id: UUID of the Certification record (already created).
        file_content_b64: Base64-encoded raw file bytes.
        file_name: Original filename.
        file_mime_type: Detected MIME type.
        file_size_bytes: File size in bytes.
        user_id: UUID of the owning user.
        user_plan: User's subscription plan.
        metadata: Custom metadata dict from the API request.
        webhook_url: Optional callback URL.

    Returns:
        Dict with certification result (certified_url, ledger_entry_id).
    """
    import base64

    cert_uuid = uuid.UUID(certification_id)
    user_uuid = uuid.UUID(user_id)
    file_content = base64.b64decode(file_content_b64)

    logger.info("certify_task_started", certification_id=certification_id)

    try:
        result = _run_async(
            _certify_pipeline(
                certification_id=cert_uuid,
                file_content=file_content,
                file_name=file_name,
                file_mime_type=file_mime_type,
                file_size_bytes=file_size_bytes,
                user_id=user_uuid,
                user_plan=user_plan,
                metadata=metadata,
                webhook_url=webhook_url,
            )
        )
        logger.info("certify_task_completed", certification_id=certification_id)
        return result

    except Exception as exc:
        logger.error(
            "certify_task_failed",
            certification_id=certification_id,
            error=str(exc),
            exc_info=True,
        )
        # Mark certification as failed in DB
        _run_async(_mark_failed(cert_uuid, str(exc)))

        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=10 * (2 ** self.request.retries))


async def _certify_pipeline(
    *,
    certification_id: uuid.UUID,
    file_content: bytes,
    file_name: str,
    file_mime_type: str,
    file_size_bytes: int,
    user_id: uuid.UUID,
    user_plan: str,
    metadata: dict,
    webhook_url: str | None,
) -> dict:
    """Async pipeline: R2 upload → C2PA sign → Ledger write → DB update."""
    from database import AsyncSessionLocal
    from models.certification import Certification
    from services.c2pa_service import certify_file
    from services.file_service import build_r2_key, upload_to_r2
    from services.ledger_service import record_certified
    import hashlib

    # Recompute hash from content (source of truth)
    file_hash_sha256 = hashlib.sha256(file_content).hexdigest()

    async with AsyncSessionLocal() as db:
        # 1. Mark as processing
        cert = await db.get(Certification, certification_id)
        if not cert:
            raise ValueError(f"Certification {certification_id} not found.")
        cert.status = "processing"
        await db.flush()

        # 2. Upload to R2
        r2_key = build_r2_key(certification_id, file_name, stage="certified")
        certified_url = await upload_to_r2(
            content=file_content,
            object_key=r2_key,
            mime_type=file_mime_type,
            metadata={
                "certification_id": str(certification_id),
                "user_id": str(user_id),
                "sha256": file_hash_sha256,
            },
        )

        # 3. Build & sign C2PA manifest
        manifest, signature = certify_file(
            file_hash_sha256=file_hash_sha256,
            file_name=file_name,
            file_mime_type=file_mime_type,
            file_size_bytes=file_size_bytes,
            certification_id=certification_id,
            user_metadata=metadata,
        )

        # 4. Write to immutable Ledger
        ledger_entry = await record_certified(
            db,
            certification_id=certification_id,
            user_id=user_id,
            file_hash_sha256=file_hash_sha256,
            payload={
                "file_name": file_name,
                "mime_type": file_mime_type,
                "size_bytes": file_size_bytes,
                "plan": user_plan,
            },
        )

        # 5. Update Certification record
        cert.status = "certified"
        cert.c2pa_manifest = manifest
        cert.c2pa_signature = signature
        cert.certified_url = certified_url
        cert.file_hash_sha256 = file_hash_sha256

        await db.commit()

        logger.info(
            "certification_complete",
            certification_id=str(certification_id),
            ledger_entry_id=ledger_entry.id,
            url=certified_url,
        )

    # 6. Fire webhook (outside the DB transaction)
    if webhook_url:
        await _send_webhook(
            webhook_url=webhook_url,
            certification_id=certification_id,
            file_hash_sha256=file_hash_sha256,
            certified_url=certified_url,
            ledger_entry_id=ledger_entry.id,
        )

    return {
        "certification_id": str(certification_id),
        "certified_url": certified_url,
        "ledger_entry_id": ledger_entry.id,
        "file_hash_sha256": file_hash_sha256,
    }


async def _mark_failed(certification_id: uuid.UUID, error: str) -> None:
    """Update the certification status to 'failed' in the database."""
    from database import AsyncSessionLocal
    from models.certification import Certification

    async with AsyncSessionLocal() as db:
        cert = await db.get(Certification, certification_id)
        if cert:
            cert.status = "failed"
            cert.metadata_ = {**(cert.metadata_ or {}), "error": error}
            await db.commit()


async def _send_webhook(
    *,
    webhook_url: str,
    certification_id: uuid.UUID,
    file_hash_sha256: str,
    certified_url: str,
    ledger_entry_id: int,
) -> None:
    """
    Deliver a webhook notification to the client's endpoint.
    Logs the attempt regardless of success.
    """
    import httpx
    from database import AsyncSessionLocal
    from models.certification import Certification
    from models.webhook_log import WebhookLog

    payload = {
        "event": "certification.completed",
        "certification_id": str(certification_id),
        "file_hash_sha256": file_hash_sha256,
        "certified_url": certified_url,
        "ledger_entry_id": ledger_entry_id,
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
    }

    response_status = None
    response_body = None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(webhook_url, json=payload)
            response_status = resp.status_code
            response_body = resp.text[:1000]  # truncate long responses
    except Exception as exc:
        response_body = str(exc)
        logger.warning("webhook_delivery_failed", url=webhook_url, error=str(exc))

    # Log the attempt
    async with AsyncSessionLocal() as db:
        log = WebhookLog(
            certification_id=certification_id,
            url=webhook_url,
            payload=payload,
            response_status=response_status,
            response_body=response_body,
        )
        db.add(log)

        # Update sent_at on the certification if successful
        if response_status and 200 <= response_status < 300:
            cert = await db.get(Certification, certification_id)
            if cert:
                cert.webhook_sent_at = datetime.now(tz=timezone.utc)

        await db.commit()
