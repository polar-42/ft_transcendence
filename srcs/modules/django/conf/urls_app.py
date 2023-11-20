# myapp/urls.py
from django.urls import path
from .views import index_view, create_user, get_data, connect_user, check_connexion, check_disconnexion

urlpatterns = [
    path('index/', index_view, name='index-view'),
	path('create_user/', create_user, name='create-user'),
	path('connect_user/', connect_user, name='connect-user'),
	path('check_connexion/', check_connexion, name='check-connexion'),
	path('check_disconnexion/', check_disconnexion, name='check-disconnexion'),
	path('get_data/', get_data, name='get-data'),
]
