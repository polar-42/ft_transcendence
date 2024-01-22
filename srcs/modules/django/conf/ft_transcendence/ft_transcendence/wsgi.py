"""
WSGI config for ft_transcendence project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack

application = get_wsgi_application()
# from socketApp import routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendence.settings')

# application = ProtocolTypeRouter({
#    'http': get_wsgi_application(),
#    'websocket': AuthMiddlewareStack(
    #    URLRouter(
        #    routing.websocket_urlpatterns
    #    )
#    ),
# })
