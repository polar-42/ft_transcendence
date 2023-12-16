from django.db import models
from authApp.models import User

# Create your models here.
class PongGameModels(models.Model):
	player1 = User()
	player2 = User()
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	number_ball_touch_player1 = models.IntegerField(default=0)
	number_ball_touch_player2 = models.IntegerField(default=0)
	winner = User()
	reason = models.CharField(max_length=255, default="gros caca")
	time = models.DateTimeField(auto_now=True)
