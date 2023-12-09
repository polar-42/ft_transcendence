from django.urls import re_path, path
from . import MatchmakingConsumers, BattleshipConsumers

websocket_urlpatterns = [
    re_path(r'socketApp/matchmaking/$', MatchmakingConsumers.socket.as_asgi()),
    path('socketApp/battleship/<str:gameId>', BattleshipConsumers.socket.as_asgi()),
]
