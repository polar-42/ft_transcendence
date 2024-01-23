from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [	
	path('matchmake', views.matchmake_view),
    path('', views.game_view),
]