from django.db import models

# Create your models here.
class PongGameModels(models.Model):
	player1 = models.CharField(max_length=255)
	player2 = models.CharField(max_length=255)
	score_player1 = models.IntegerField(default=0)
	score_player2 = models.IntegerField(default=0)
	number_ball_touch_player1 = models.IntegerField(default=0)
	number_ball_touch_player2 = models.IntegerField(default=0)
	winner = models.CharField(max_length=255)
	reason = models.CharField(max_length=255, default="AAAAAAAAAHHHHHHHHHHHHHHH")
	time = models.DateTimeField(auto_now=True)
