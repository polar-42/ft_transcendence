from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator

class BattleshipGameModels(models.Model):
	player1 = models.CharField(max_length=255, default="None")
	player2 = models.CharField(max_length=255, default="None")
	player1_try = models.IntegerField(default=-1)
	player2_try = models.IntegerField(default=-1)
	player1_hit = models.IntegerField(default=-1)
	player2_hit = models.IntegerField(default=-1)
	winner = models.CharField(max_length=255, default="None")
	tournamentId = models.CharField(max_length=255, default="-1")
	time = models.DateTimeField(auto_now=True)
	player1_boatsState = ArrayField(models.BooleanField(default=False), default=None, size=5)
	player2_boatsState = ArrayField(models.BooleanField(default=False), default=None, size=5)
	player1_boatCount = models.IntegerField(
		default=0,
		validators=[
			MinValueValidator(0),
			MaxValueValidator(5)
		]
	)
	player2_boatCount = models.IntegerField(
		default=0,
		validators=[
			MinValueValidator(0),
			MaxValueValidator(5)
		]
	)
