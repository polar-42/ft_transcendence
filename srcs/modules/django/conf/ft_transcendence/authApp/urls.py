from django.contrib import admin
from django.urls import path, re_path, include
from . import views


urlpatterns = [
	path('TFA/', include('authApp.AA_TFAUrls')),
	path('GET/', include('authApp.AA_DataUrls')),
    path('login/', views.logPage),
    path('Connexion', views.UserConnexion),
    path('register/', views.registerPage),
    path('Registration', views.UserRegistration),
    path('logout', views.disconnect),
]
