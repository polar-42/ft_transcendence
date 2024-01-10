from django.db import models
from chatApp.enumChat import connexionStatus
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser, PermissionsMixin):
	connexionStatus = models.IntegerField(default=connexionStatus.Disconnected)
	channels = ArrayField(models.CharField(), blank=True, null=True)

