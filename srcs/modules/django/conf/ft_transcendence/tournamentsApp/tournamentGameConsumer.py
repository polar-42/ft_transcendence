import json
from channels.generic.websocket import WebsocketConsumer
from pongGameApp.Remote import pongThreads
import asyncio

class TournamentGameSocket(WebsocketConsumer):
	pongGameThread = {}
	players = {}

	def connect(self):

		self.gameId = self.scope['url_route']['kwargs']['gameId']
		self.username = self.scope['user']

		self.channel_layer.group_add(
			self.gameId,
			self.channel_name
		)

		if self.gameId in self.players:
			self.players[self.gameId].append(self)
		else:
			players_in_game = []
			players_in_game.append(self)
			self.players[self.gameId] = players_in_game

		#print(self.players)

		print(len(self.players[self.gameId]))
		if len(self.players[self.gameId]) >= 2:
			self.pongGameThread[self.gameId] = pongThreads.pongGame()
			asyncio.run(self.pongGameThread[self.gameId].launchGame(self.gameId, self.players[self.gameId]))

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
