"""
IronID — Celery Task: Email Notifications.
Sends transactional emails via Resend for key lifecycle events.
"""

import structlog
from tasks.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(
    name="tasks.notify_task.send_certification_email",
    max_retries=3,
    default_retry_delay=30,
)
def send_certification_email(
    to_email: str,
    certification_id: str,
    file_name: str,
    file_hash_sha256: str,
    certified_url: str,
) -> None:
    """Send a 'certification complete' email to the user."""
    import httpx
    from config import get_settings

    settings = get_settings()
    if not settings.resend_api_key:
        logger.warning("resend_not_configured_skipping_email")
        return

    subject = f"Your file '{file_name}' has been certified — IronID"
    html = f"""
    <h2>Certification Complete</h2>
    <p>Your file <strong>{file_name}</strong> has been successfully certified.</p>
    <ul>
      <li><strong>Certification ID:</strong> {certification_id}</li>
      <li><strong>SHA-256:</strong> <code>{file_hash_sha256}</code></li>
    </ul>
    <p><a href="{certified_url}">Download certified file</a></p>
    <p>Verify this file at any time: <a href="https://ironid.io/verify/{file_hash_sha256}">ironid.io/verify</a></p>
    """

    try:
        resp = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.email_from,
                "to": [to_email],
                "subject": subject,
                "html": html,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        logger.info("email_sent", to=to_email, cert_id=certification_id)
    except Exception as exc:
        logger.error("email_send_failed", to=to_email, error=str(exc))
        raise
