from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "infohub",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Scheduled jobs (run via: celery -A app.workers.celery_app beat)
celery_app.conf.beat_schedule = {
    "scan-all-companies-for-breaches": {
        "task": "app.workers.tasks.scan_all_companies_for_breaches",
        "schedule": crontab(hour=3, minute=0),  # daily at 03:00 UTC
    },
    "check-deletion-deadlines": {
        "task": "app.workers.tasks.check_deletion_deadlines",
        "schedule": crontab(hour="*/6"),  # every 6 hours
    },
}
