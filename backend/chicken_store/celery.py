# chicken_store/celery.py

import os
from celery import Celery
from celery.schedules import crontab

# Django sozlamalarini Celery uchun standart qilib belgilaymiz
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chicken_store.settings')

app = Celery('chicken_store')

# Sozlamalarni settings.py faylidan o'qiymiz (CELERY_ prefiksi bilan)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Ilovalardagi tasks.py fayllarini avtomatik topish
app.autodiscover_tasks()

# Rejalashtirilgan vazifalar (Periodic Tasks)
app.conf.beat_schedule = {
    # Har kuni 23:55 da ishga tushadigan vazifa
    'generate-daily-report-at-23-55': {
        'task': 'orders.tasks.generate_daily_report', # Vazifaning joylashuvi
        'schedule': crontab(hour=23, minute=55),     # Vaqti
    },
}