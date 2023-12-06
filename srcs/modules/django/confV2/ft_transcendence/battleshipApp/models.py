from django.db import models

class GameRoom(models.Model):
    room_id = models.CharField(max_length=35)
    room_name = models.CharField(max_length=10)
    pass
