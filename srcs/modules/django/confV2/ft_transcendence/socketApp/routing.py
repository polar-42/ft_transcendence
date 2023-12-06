from django.urls import re_path, path
from . import TchatConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/TchatSocket/$', TchatConsumers.socket.as_asgi()),
]