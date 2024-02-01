from django.contrib import admin
from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('login/', views.logPage),
    path('LoginTFA', views.TFALoginPage),
    path('LoginCheckTFA', views.LoginCheckTFA),
    path('Connexion', views.UserConnexion),
    path('register/', views.registerPage),
    path('Registration', views.UserRegistration),
    path('logout', views.disconnect),
    path('check_connexion', views.check_connexion),
    path('testSocket', views.socket),
    path('getUserName', views.getUserName),
    path('get_avatar_image', views.getAvatarImage),
    path('Get2FaStatus', views.Get2FaStatus),
    path('Show2FAPopUp', views.ShowPopUp),
    path('TFAConfirmPass', views.TFAConfirmPassPage),
    path('TFAChooseType', views.TFAChooseTypePage),
    path('TFACheckPass', views.TFACheckPass),
    path('TFASelected', views.TFASelected),
    path('TFARequestQR', views.TFARequestQR),
    path('TFASendCode', views.TFASendCode),
    path('TFADisable', views.TFADisable),
]
