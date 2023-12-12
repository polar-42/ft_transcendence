from django.urls import re_path, path
from . import MatchmakingConsumers, BattleshipConsumers
from pongGame import PongMatchmakingConsumers, PongGameConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/matchmaking/$', MatchmakingConsumers.socket.as_asgi()),
    path('socketApp/battleship/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
    re_path(r'pongGame/matchmaking/$', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
    path('pongGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
]
