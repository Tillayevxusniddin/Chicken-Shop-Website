"""
ASGI config for chicken_store project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# chicken_store/asgi.py

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import orders.routing # <-- Hozir yaratamiz

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chicken_store.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(), # Oddiy HTTP so'rovlari uchun
    "websocket": AuthMiddlewareStack( # WebSocket so'rovlari uchun
        URLRouter(
            orders.routing.websocket_urlpatterns
        )
    ),
})