"""
IronID — Celery Application.
Configured to use Redis as broker and result backend.
"""

from celery import Celery
from config import get_settings

settings = get_settings()

celery_app = Celery(
    "ironid",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["tasks.certify_task", "tasks.notify_task"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,  # Only ack after task completes (safer)
    worker_prefetch_multiplier=1,
)
