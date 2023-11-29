# myapp/urls.py
from django.urls import path, re_path
from django.views.generic import RedirectView
from .views import index_view, create_user, get_data, connect_user, check_connexion, check_disconnexion, create_game_view
#from .managers import create_game

urlpatterns = [
    path('', RedirectView.as_view(pattern_name='index-view', permanent=False)),
    path('index/', index_view, name='index-view'),
	path('create_user/', create_user, name='create-user'),
	path('connect_user/', connect_user, name='connect-user'),
	path('check_connexion/', check_connexion, name='check-connexion'),
	path('check_disconnexion/', check_disconnexion, name='check-disconnexion'),
	path('get_data/', get_data, name='get-data'),
 
	path('create_game_view/', create_game_view, name='create-game-view'),
	#path('create_game/', create_game, name='create-game'),
 
	#re_path(r'^.*/$', RedirectView.as_view(pattern_name='index-view', permanent=False), name='catch-all'),
 	re_path(r'^.*/?$', RedirectView.as_view(pattern_name='index-view', permanent=False), name='catch-all'),
]
