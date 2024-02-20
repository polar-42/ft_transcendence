from . import AA_DataViews as views
from django.urls import path

urlpatterns = [
	path('connexionStatus', views.check_connexion),
    path('userName', views.getUserName),
	path('getUserNameById', views.getUserNameById),
    path('userID', views.getUserID),
    path('avatarImage/', views.getAvatarImage),
    path('2FaStatus', views.Get2FaStatus),
]
