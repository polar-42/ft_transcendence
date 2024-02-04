from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('', views.profileView),
	path('getUserInformation/', views.getUserInformation),
	path('getPlayerImage/', views.getPlayerImage)
]
