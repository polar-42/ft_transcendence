#Models are here to create table for db

from django.db import models

class User(models.Model):
    firstName = models.CharField(min_length=3, max_length=16)
    lastName = models.CharField(min_length=3,max_length=16)
    userName = models.CharField(min_length=3,max_length=16)
    mail = models.EmailField()
    password = models.CharField(min_length = 6) #to implemant

class Tournament(models.Model):
    numberParticipant = models.PositiveIntegerField()
    winner = User
