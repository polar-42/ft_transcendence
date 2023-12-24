from django.urls import path
from . import views

urlpatterns = [
	path('Home/', views.Home_view),
	path('Create/', views.tournaments_creation),
	path('create_tournaments/', views.create_tournaments),
	path('get_tournaments/', views.get_tournaments),
	path('Join/', views.view_JoinPage),
	path('get_tournaments_html/', views.get_tournaments_html),
	path('join_tournaments/', views.join_tournaments),
	path('tournament/', views.Tournament_view),
]
