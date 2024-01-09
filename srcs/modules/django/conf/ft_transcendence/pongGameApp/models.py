from django.db import models
from authApp.models import User

# Create your models here.
class PongGameModels(models.Model):
	player1 = models.CharField(max_length=255, default="None")
	player2 = models.CharField(max_length=255, default="None")
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	number_ball_touch_player1 = models.IntegerField(default=0)
	number_ball_touch_player2 = models.IntegerField(default=0)
	winner = models.CharField(max_length=255, default="None")
	reason = models.CharField(max_length=255, default="gros caca")
	typeGame = models.CharField(max_length=255, default="COUCOU GILLIAN")
	time = models.DateTimeField(auto_now=True)
