from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class TournamentsModels(models.Model):
	tournamentsName = models.CharField(max_length=16)
	numberOfPlayers = models.IntegerField()
	creatorId = models.CharField(max_length=16)
	playersId = ArrayField(models.CharField(), blank=True, null=True)
	privateGame = models.IntegerField(default=0)
	description = models.TextField(default="Description")
	tournamentType = models.IntegerField(default=-1)
	winner = models.CharField(default='gpasquet')
	creationTime = models.DateTimeField(auto_now=True)
