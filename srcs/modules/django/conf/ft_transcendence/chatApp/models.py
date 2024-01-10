from .enumChat import channelPrivacy
from django.db import models
from authApp import models as authAppModels
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class ChannelModels(models.Model):
	channelName = models.CharField(default='0')
	admin = models.CharField(default='0')
	users = ArrayField(models.CharField(), blank=True, null=True)
	privacyStatus = models.IntegerField(default=channelPrivacy.Public)
	description = models.CharField(max_length=255, default="None")
	timeCreation = models.DateTimeField(auto_now=True)

class MessageModels(models.Model):
	pass
