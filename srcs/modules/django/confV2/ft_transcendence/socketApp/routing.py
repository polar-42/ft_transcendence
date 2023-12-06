from django.urls import re_path, path
from . import MatchmakingConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/matchmaking/$', MatchmakingConsumers.socket.as_asgi()),
]