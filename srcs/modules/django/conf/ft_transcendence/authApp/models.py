from typing import Any
from django.db import models
from chatApp.enumChat import connexionStatus
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
    nickname = models.CharField(blank=False, default='None')
    connexionStatus = models.IntegerField(default=connexionStatus.Disconnected)
    channels = ArrayField(models.CharField(), blank=True, null=True)
    blockedUser = ArrayField(models.CharField(), blank=True, null=True)
    allPrivateTalks = ArrayField(models.CharField(), blank=True, null=True)
    avatarImage = models.BinaryField(blank=True, default=None, null=True)
