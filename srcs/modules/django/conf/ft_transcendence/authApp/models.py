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
    blockedUser = ArrayField(models.CharField(), blank=True, null=True)
    allPrivateTalks = ArrayField(models.CharField(), blank=True, null=True)

    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    tfValidated = models.BooleanField(default=False)
    tfKey = models.CharField(default=None, null=True)
