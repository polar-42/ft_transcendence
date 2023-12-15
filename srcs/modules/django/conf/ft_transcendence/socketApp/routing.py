from django.urls import re_path, path
from . import MatchmakingConsumers, BattleshipConsumers
from pongGameApp import PongMatchmakingConsumers, PongGameConsumers, PongGameIAConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/matchmaking/$', MatchmakingConsumers.socket.as_asgi()),
    path('socketApp/battleship/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
    re_path(r'pongGame/matchmaking/$', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	re_path(r'pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
]
