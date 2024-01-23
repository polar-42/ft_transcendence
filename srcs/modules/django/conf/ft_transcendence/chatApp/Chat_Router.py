from django.urls import path

from . import chatConsumer

websocket_urlpatterns = [
    path('chat/', chatConsumer.chatSocket.as_asgi()),
]