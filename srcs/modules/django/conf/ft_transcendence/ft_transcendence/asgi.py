"""
ASGI config for ft_transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from channels.security.websocket import OriginValidator

application2 = get_asgi_application()

from socketApp import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')

application = ProtocolTypeRouter({
    'https': application2,
    "websocket": OriginValidator({
        AuthMiddlewareStack(
            URLRouter([
                routing.websocket_urlpatterns
            ])
        ),
        ["*"],
    })
})
