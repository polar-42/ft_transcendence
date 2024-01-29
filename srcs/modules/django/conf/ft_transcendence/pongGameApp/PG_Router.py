from django.urls import path

from .IA import PongGameIAConsumers
from .Matchmaking import PongMatchmakingConsumers
from .Remote import PongGameConsumers 

websocket_urlpatterns = [
    path('pongGame/matchmaking/', PongMatchmakingConsumers.pongMatchmakingSocket.as_asgi()),
	path('pongGame/gameVsIA', PongGameIAConsumers.PongGameIASocket.as_asgi()),
    path('pongGame/RemoteGame/<str:gameId>', PongGameConsumers.PongGameSocket.as_asgi()),
]