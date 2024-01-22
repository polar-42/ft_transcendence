from django.urls import path

from . import BS_Consumer_Match, BS_Consumer_Matchmaking

websocket_urlpatterns = [
    path('battleshipApp/Matchmaking/', BS_Consumer_Matchmaking.socket.as_asgi()),
    path('battleshipApp/Game/<str:gameId>', BS_Consumer_Match.socket.as_asgi()),
]