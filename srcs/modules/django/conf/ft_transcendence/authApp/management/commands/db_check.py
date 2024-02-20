from django.core.management.base import BaseCommand
from django.db import models
from django.apps import apps
from ft_transcendence import ColorPrint
import authApp, battleshipApp, pongGameApp, tournamentsApp, chatApp

class Command(BaseCommand):

	help = "Check database entries integrity."

	def handle(self, *args, **options):
		for model in apps.get_models():
			if model.__module__.startswith('django.') == False:
				# ColorPrint.prGreen(str(model))
				match(str(model)):
					case '<class \'authApp.models.User\'>':
						self.CheckUserIntegrity(model)
					case '<class \'battleshipApp.models.BattleshipGameModels\'>':
						self.CheckGame(model)
					case '<class \'pongGameApp.models.PongGameModels\'>':
						self.CheckGame(model)
					case '<class \'tournamentsApp.models.TournamentsModels\'>':
						self.CheckGame(model)
				# obj = model.objects.all()
						
	def CheckUserIntegrity(self, model):
		obj = model.objects.all()
		for user in obj:
			user.sessionCount = 0
			user.save()

	def CheckGame(self, model):
		obj = model.objects.all()
		for game in obj:
			if (game.winner == 'None'):
				game.delete()