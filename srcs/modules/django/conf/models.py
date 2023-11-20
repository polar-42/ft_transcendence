#Models are here to create table for db

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManagement(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    '''class User is here to store user information'''
    username = models.CharField(max_length=16, unique=True)
    dateInscription = models.DateField(default=timezone.now)
    email = models.EmailField(unique=True)
    profilePicture = models.ImageField(blank=True)
    password = models.CharField() #pas sur de celui-la

    objects = CustomUserManagement()

    USERNAME_FIELD = 'username'
    #REQUIRED_FIELDS = ['username', 'email']

class Tournament(models.Model):
    numberParticipant = models.PositiveIntegerField()
    winner = User
