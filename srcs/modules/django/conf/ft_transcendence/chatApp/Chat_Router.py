from django.urls import path
from . import views 
from . import chatConsumer

websocket_urlpatterns = [
    path('chat/', chatConsumer.chatSocket.as_asgi()),
]
