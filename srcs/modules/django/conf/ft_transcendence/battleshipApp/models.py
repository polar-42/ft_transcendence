from django.db import models

class BattleshipGameModels(models.Model):
	player1 = models.CharField(max_length=255, default="None")
	player2 = models.CharField(max_length=255, default="None")
	winner = models.CharField(max_length=255, default="None")
	tournamentId = models.CharField(max_length=255, default="-1")
	time = models.DateTimeField(auto_now=True)
