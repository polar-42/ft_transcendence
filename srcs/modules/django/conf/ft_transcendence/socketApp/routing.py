import sys
sys.path.append(".") # Adds higher directory to python modules path.
from django.urls import re_path, path
from pongGameApp.IA import PongGameIAConsumers
from pongGameApp.Remote import PongGameConsumers
from pongGameApp.Matchmaking import PongMatchmakingConsumers
from . import MatchmakingConsumers, BattleshipConsumers
from tournamentsApp import tournamentConsumer, tournamentGameConsumer

websocket_urlpatterns = [
    path('socketApp/matchmaking/', MatchmakingConsumers.socket.as_asgi()),
    path('socketApp/battleship/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
    path('pongGame/matchmaking/', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	path('pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
    path('socketApp/tournamentsApp/<str:tournamentId>', tournamentConsumer.TournamentSocket.as_asgi()),
	path('socketApp/tournamentsGame/<str:gameId>', tournamentGameConsumer.TournamentGameSocket.as_asgi()),
]
