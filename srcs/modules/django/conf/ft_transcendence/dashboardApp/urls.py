from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('', views.dashboardView),
	path('getPongClassicGameStats/', views.getPongClassicGameStats),
	path('getPongTournamentStats/', views.getPongTournamentStats),
	path('getWinratePongGames/', views.getWinratePongGames)
]
