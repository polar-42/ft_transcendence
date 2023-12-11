from django.db import models

# Create your models here.
class PongGameModels(models.Model):
	player1 = models.CharField(max_length=255)
	player2 = models.CharField(max_length=255)
	score_player1 = models.IntegerField()
	score_player2 = models.IntegerField()
	winner = models.CharField(max_length=255)
	time = models.DateTimeField(auto_now=True)
