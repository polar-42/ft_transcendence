from django.db import models
from chatApp.enumChat import connexionStatus
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
	nickname = models.CharField(blank=False, default='None')
	connexionStatus = models.IntegerField(default=connexionStatus.Disconnected)
	avatarImage = models.BinaryField(blank=True, default=None, null=True)
	email = models.EmailField(unique=True)
	identification = models.CharField(unique=True, max_length=5, blank=False)

	channels = ArrayField(models.CharField(), blank=True, null=True)

	Friends = ArrayField(models.CharField(), blank=True, null=True)
	PendingInvite = ArrayField(models.CharField(), blank=True, null=True)

	blockedUser = ArrayField(models.CharField(), blank=True, null=True)
	allPrivateTalks = ArrayField(models.CharField(), blank=True, null=True)

	username = None

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = []
	tfValidated = models.BooleanField(default=False)
	tfKey = models.CharField(default=None, null=True)

	BS_Bullets = models.IntegerField(default=0) #Total Shoot

	BS_E_Miss = models.IntegerField(default=0) #Missed Hit

	BS_E_Hit = models.IntegerField(default=0) #Hit given
	BS_P_Hit = models.IntegerField(default=0) #Hit taken
	BS_E_BoatsDestroyed = models.IntegerField(default=0) #Boat Destroyed
	BS_P_BoatsDestroyed = models.IntegerField(default=0) #Boat got destroyed
	BS_G_Win = models.IntegerField(default=0) #Total BS Win
	BS_G_Lose = models.IntegerField(default=0) #Total BS Lose
	BS_GameCount = models.IntegerField(default=0) #Total game played (without cancelled)


	Pong_BallHit = models.IntegerField(default=0) #Total Ball Hit
	Pong_BallHitByOpponent = models.IntegerField(default=0) #Total Ball Hit
	Pong_Point = models.IntegerField(default=0) #Total Point
	Pong_PointTaken = models.IntegerField(default=0) #Point Taken

	Pong_Win = models.IntegerField(default=0) #Total Pong Win
	Pong_Lose = models.IntegerField(default=0) #Total Pong Lose
	Pong_Game = models.IntegerField(default=0) #Total Pong played
	Pong_Versus_AI = models.IntegerField(default=0) #+/- against AI
