import sys
sys.path.append(".") # Adds higher directory to python modules path.
from django.urls import re_path, path
from pongGameApp.IA import PongGameIAConsumers
from pongGameApp.Remote import PongGameConsumers
from pongGameApp.Matchmaking import PongMatchmakingConsumers
from . import MatchmakingConsumers, BattleshipConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/matchmaking/$', MatchmakingConsumers.socket.as_asgi()),
    path('socketApp/battleship/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
    re_path(r'pongGame/matchmaking/$', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	re_path(r'pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
]
