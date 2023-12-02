from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('/login', views.logPage),
    path('/register', views.register),
    path('', views.index_view),
	re_path(r'^.*/?$', views.index_view),
]