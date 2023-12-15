from django.db import models

# Create your models here.
class TournamentsModels(models.Model):
	tournamentsName = models.CharField(max_length=255)
	numberOfPlayer = models.CharField(max_length=255)
