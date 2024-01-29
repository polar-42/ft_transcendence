from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('login/', views.logPage),
    path('register/', views.register),
    path('logout/', views.disconnect),
    path('check_connexion/', views.check_connexion),
    path('testSocket/', views.socket),
    path('getUserName/', views.getUserName),
    path('getUserID/', views.getUserID),
    path('get_avatar_image/', views.getAvatarImage),
]
