from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('login', views.logPage),
    path('Connexion', views.UserConnexion),
    path('register', views.registerPage),
    path('Registration', views.UserRegistration),
    path('logout', views.disconnect),
    path('check_connexion', views.check_connexion),
    path('testSocket', views.socket),
    path('getUserName', views.getUserName),
    path('get_avatar_image', views.getAvatarImage),
    path('Get2FaStatus', views.Get2FaStatus),
]
