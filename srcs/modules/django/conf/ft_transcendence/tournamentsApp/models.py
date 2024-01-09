from django.db import models

# Create your models here.
class TournamentsModels(models.Model):
	tournamentsName = models.CharField(max_length=16)
	numberOfPlayers = models.IntegerField()
	creatorId = models.CharField(max_length=16)
	playersId = models.TextField(null=True, default="")
	creationTime = models.DateTimeField(auto_now=True)
	privateGame = models.IntegerField(default=0)
	description = models.TextField(default="Description")
	tournamentType = models.IntegerField(default=-1)
	winner = models.CharField(default='gpasquet')
