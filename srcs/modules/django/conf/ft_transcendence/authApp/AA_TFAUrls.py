from . import AA_TFAViews as views
from django.urls import path

urlpatterns = [
	path('Login', views.LoginPage),
    path('LoginCheck', views.LoginCheck),
    path('ShowPopUp', views.ShowPopUp),
    path('ConfirmPass', views.ConfirmPassPage),
    path('ChooseType', views.ChooseTypePage),
    path('CheckPass', views.CheckPass),
    path('Selected', views.Selected),
    path('RequestQR', views.RequestQR),
    path('SendCode', views.SendCode),
    path('Disable', views.Disable),
]