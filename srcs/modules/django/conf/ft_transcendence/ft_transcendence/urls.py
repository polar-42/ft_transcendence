"""
URL configuration for ft_transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('homepage/', views.homepage_view),
	path('404/', views.PNF_view),
	path('needlog/', views.NeedLog_view),
    path('authApp/', include('authApp.urls')),
    path('chatApp/', include('chatApp.urls')),
    path('games/', views.games_view),
    path('battleship/', include('battleshipApp.urls')),
    path('pongGame/', include('pongGameApp.urls')),
    path('tournaments/', include('tournamentsApp.urls')),
	re_path(r"^userManagement/?", include('userManagementApp.urls')),
	path('dashboard/', include('dashboardApp.urls')),
	path('profile/', include('userProfileApp.urls')),
    path('', views.index_view),
	re_path(r'^.*/?$', views.index_view),
]

