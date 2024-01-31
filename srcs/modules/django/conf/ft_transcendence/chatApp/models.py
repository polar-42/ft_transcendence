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
    password = models.CharField(blank=True)
    description = models.CharField(max_length=255, default="PAS2DESCRIPTION")
    timeCreation = models.DateTimeField(auto_now=True)

class MessageModels(models.Model):
    MESSAGE_TYPE = [
            ('P', 'Private Message'),
            ('C', 'Channel Message')
            ]

    type = models.CharField(max_length=1, choices=MESSAGE_TYPE, default='P')
    message = models.CharField(default='NULL')
    sender = models.CharField(default='NULL')
    receiver = models.CharField(default='NULL')
    timeCreation = models.DateTimeField(auto_now=True)
