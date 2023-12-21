from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
	path('Home/', views.matchmake_view),
	path('Local/', views.local_game_view),
	path('IA/', views.ia_game_view),
    path('Remote/', views.game_view),
]
