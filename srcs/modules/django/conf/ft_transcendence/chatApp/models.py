from .enumChat import channelPrivacy
from django.db import models
from authApp import models as authAppModels
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
import datetime


# Create your models here.
class ChannelModels(models.Model):
    channelName = models.CharField(default='0')
    admin = models.CharField(default='0')
    users = ArrayField(models.CharField(), blank=True, null=True)
    privacyStatus = models.IntegerField(default=channelPrivacy.Public)
    password = models.CharField(blank=True, default=None, null=True)
    description = models.CharField(max_length=255, default="undefined")
    channelPicture = models.BinaryField(blank=True, default=None, null=True)
    timeCreation = models.DateTimeField(default=timezone.now)

class MessageModels(models.Model):
    MESSAGE_TYPE = [
            ('P', 'Private Message'),
            ('C', 'Channel Message')
            ]

    type = models.CharField(max_length=1, choices=MESSAGE_TYPE, default='P')
    message = models.CharField(default='NULL')
    sender = models.CharField(default='NULL')
    receiver = models.CharField(default='NULL')
    isRead = models.BooleanField(default=False)
    readBy = ArrayField(models.CharField(), blank=True, null=True)
    timeCreation = models.DateTimeField(auto_now=True)
