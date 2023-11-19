# myapp/urls.py
from django.urls import path
from .views import index_view, create_object, get_data

urlpatterns = [
    path('index/', index_view, name='index-view'),
	path('create_object/', create_object, name='create-object'),
	path('get_data/', get_data, name='get-data'),
]
