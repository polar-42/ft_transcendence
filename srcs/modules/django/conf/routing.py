from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/some_path/$', consumers.MyClient.as_asgi()),
]
