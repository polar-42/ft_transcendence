from django.urls import re_path, path
from . import PongGameConsumers, PongMatchmakingConsumers

websocket_urlpatterns = [
    re_path(r'pongGame/matchmaking/$', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
    path('pongGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
]
