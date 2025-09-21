# chicken_store/__init__.py

# Bu qatorlar Celery app'imiz Django bilan birga yuklanishini ta'minlaydi
from .celery import app as celery_app

__all__ = ('celery_app',)