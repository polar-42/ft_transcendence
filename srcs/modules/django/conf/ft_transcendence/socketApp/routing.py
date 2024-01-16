import sys
sys.path.append(".")
from django.urls import path
from pongGameApp.IA import PongGameIAConsumers
from pongGameApp.Remote import PongGameConsumers
from pongGameApp.Matchmaking import PongMatchmakingConsumers
from battleshipApp import MatchmakingConsumers, BattleshipConsumers
from tournamentsApp import tournamentConsumer
from chatApp import chatConsumer
from tournamentsApp import tournamentConsumer

websocket_urlpatterns = [
    path('battleshipApp/Matchmaking/', MatchmakingConsumers.socket.as_asgi()),
    path('battleshipApp/Game/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
    path('pongGame/matchmaking/', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	path('pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
    path('socketApp/tournamentsApp/<str:tournamentId>', tournamentConsumer.TournamentSocket.as_asgi()),
	path('chat/', chatConsumer.chatSocket.as_asgi()),
]
