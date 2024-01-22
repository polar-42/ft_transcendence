from django.urls import path
from pongGameApp.IA import PongGameIAConsumers
from pongGameApp.Remote import PongGameConsumers
from pongGameApp.Matchmaking import PongMatchmakingConsumers
from battleshipApp import BS_Consumer_Match,BS_Consumer_Matchmaking
from tournamentsApp import tournamentConsumer
from chatApp import chatConsumer

websocket_urlpatterns = [
    # path('battleshipApp/Matchmaking/', BS_Consumer_Matchmaking.socket.as_asgi()),
    # path('battleshipApp/Game/<str:gameId>', BS_Consumer_Match.socket.as_asgi()),
    path('pongGame/matchmaking/', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	path('pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
    path('socketApp/tournamentsApp/<str:tournamentId>', tournamentConsumer.TournamentSocket.as_asgi()),
	path('chat/', chatConsumer.chatSocket.as_asgi()),
]
