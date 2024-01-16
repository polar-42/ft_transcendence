from django.urls import path
from . import views

urlpatterns = [
	path('Home/', views.Home_view),
	path('Create/', views.CreationViews),
	path('create_tournaments/', views.create_tournament),
	path('get_tournaments/', views.get_tournaments),
	path('Join/', views.view_JoinPage),
	path('get_tournaments_html/', views.get_tournaments_html),
	path('join_tournaments/', views.join_tournaments),
	path('Play/', views.Tournament_view),
    path('View/', views.TournamentSpectateView),
    path('GetTournamentData/', views.GetTournamentData)
]
