"""
ASGI config for ft_transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')
import django
django.setup()
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter, get_default_application
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from socketApp import routing as socketAppRouter

#region Router

from battleshipApp import BS_Router
from pongGameApp import PG_Router
from tournamentsApp import T_Router

#endregion

application = ProtocolTypeRouter({
   'http': get_asgi_application(),
   'websocket': AuthMiddlewareStack(
       URLRouter(
           socketAppRouter.websocket_urlpatterns +
           BS_Router.websocket_urlpatterns +
           PG_Router.websocket_urlpatterns +
           T_Router.websocket_urlpatterns
       )
   ),
})

application = get_default_application()
