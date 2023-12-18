import json
from channels.generic.websocket import WebsocketConsumer
from .views import get_tournaments_manager

class TournamentGameSocket(WebsocketConsumer):

	def connect(self):

		self.gameId = self.scope['url_route']['kwargs']['gameId']

		self.accept()

		print(self.scope['user'].username + " is connected to game:", self.gameId)

	def disconnect(self, code):
		self.close()

		print(self.scope['user'].username + " is disconnected from game:", self.gameId)

		self.new_connexion_on_tournament()

	def receive(self, text_data):
		data = json.loads(text_data)

		print(self.scope['user'].username + " receive")
		print(data)
