from django.urls import path
from . import views

urlpatterns = [
	path('tournamentsHome/', views.tournaments_view),
	path('tournamentsCreation/', views.tournaments_creation),
]
