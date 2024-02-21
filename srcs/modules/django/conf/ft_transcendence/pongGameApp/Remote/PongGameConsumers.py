import json, asyncio
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from tournamentsApp import T_Manager, T_Tournament
from . import pongThreads
from ..models import PongGameModels
from asgiref.sync import async_to_sync
from tournamentsApp import views
from .pongGameManager import Manager


class PongGameSocket(WebsocketConsumer):
	channel_layer = get_channel_layer()

	def connect(self):
		self.canSend = True
		self.pongGameId = self.scope['url_route']['kwargs']['gameId']
		self.isTournament = self.pongGameId.startswith('Tournament')
		self.user = self.scope['user']
		self.id = self.user.id

		self.accept()

		self.pongGame = Manager.joinGame(self.pongGameId, self.user, self)
		if self.pongGame == None:
			self.close(3001)
#		print("PongGameId =", self.pongGameId)

		async_to_sync(self.channel_layer.group_add)(
			self.pongGameId,
			self.channel_name
		)

	def add_players_list(self, p1, p2):
		self.players_game.append(p1)
		self.players_game.append(p2)

	def disconnect(self, close_code):
		self.canSend = False
		async_to_sync(self.channel_layer.group_discard)(
			self.pongGameId,
			self.channel_name
		)
		if (self.pongGame is not None):
			self.pongGame.quitGame(self)

		print(f"Pong game user disconnected: {self.scope['user']}")

	def receive(self, text_data):
		data = json.loads(text_data)

		message = data['message']

		if message == 'input':
			self.pongGame.inputGame(data['input'], self)

	def end_game_by_score(self, event):

		winner = event['winner']

		print('Game is win by', winner)

		async_to_sync(self.channel_layer.group_discard)(
			self.pongGameId,
			self.channel_name
		)

		playerone_score = event['playerone_score']
		playertwo_score = event['playertwo_score']

		n_ball_touch_player1 = event['number_ball_touch_player1']
		n_ball_touch_player2 = event['number_ball_touch_player2']

		if self.isTournament is False:
			if winner == self.scope['user'].nickname + '-' + str(self.scope['user'].id):
				winner = 'you'
			if event['playerone_username'] == self.scope['user'].nickname + '-' + str(self.scope['user'].id):
				youare = 'p1'
			else:
				youare = 'p2'

			self.send(text_data=json.dumps({
    				'type': 'game_ending',
					'winner': winner,
					'youare': youare,
					'reason': 'score',
					'playerone_score': str(playerone_score),
					'playertwo_score': str(playertwo_score),
					'playerone_username': event['playerone_username'],
					'playertwo_username': event['playertwo_username'],
    		}))

		self.close()
