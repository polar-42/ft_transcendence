from django.urls import path

from . import T_Consumer

websocket_urlpatterns = [
    path('tournamentsApp/<str:tournamentId>', T_Consumer.TournamentSocket.as_asgi()),
]