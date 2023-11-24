"""
URL configuration for mysite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from channels.auth import AuthMiddlewareStack
#from django.core.asgi import get_asgi_application
#from channels.routing import ProtocolTypeRouter, URLRouter
#from transcendence import routing
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(os.environ.get('APP_NAME') + '.urls')),
]

#application = ProtocolTypeRouter({
#    'http': get_asgi_application(),
#    'websocket': AuthMiddlewareStack(
#        URLRouter(
#            routing.websocket_urlpatterns
#        )
#    ),
#})
