import json
from channels.generic.websocket import WebsocketConsumer
from ..models import PongGameModels
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from . import pongThreadsIA


class PongGameIASocket(WebsocketConsumer):
	def connect(self):

		self.username = self.scope['user']

		self.accept()

		async_to_sync(self.channel_layer.group_add)(
			"PongGameVsIA_" + str(self.username),
			self.channel_name
		)

		self.pongGameThread = pongThreadsIA.pongGame()

		self.pongGameThread.launchGame("PongGameVsIA_" + self.username.username, self)

		print(self.username, 'is connected and game against IA is launch')

	def disconnect(self, close_code):
		async_to_sync(self.channel_layer.group_discard)(
			"PongGameVsIA_" + str(self.username),
			self.channel_name
		)

		self.pongGameThread.quitGame(self.username)

		addToDb(self.username.username, 'IA', 0, 3, 'IA', 0, 3, 'disconnexion')

		self.close()

	def receive(self, text_data):
		data = json.loads(text_data)

		message = data['message']

		if message == 'input':
			self.pongGameThread.inputGame(data['input'], self)


	def end_game_by_score(self, event):
		winner = event['winner']

		print('Game is win by', winner)

		self.channel_layer.group_discard(
			"PongGameVsIA_" + str(self.username),
			self.channel_name
		)

		self.pongGameThread.finishGame()

		playerone_score = event['playerone_score']
		playertwo_score = event['playertwo_score']

		n_ball_touch_player1 = event['number_ball_touch_player1']
		n_ball_touch_player2 = event['number_ball_touch_player2']

		self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': str(winner),
				'reason': 'score',
				'playerone_score': str(playerone_score),
				'playertwo_score': str(playertwo_score),
				'playerone_username': self.username.username,
				'playertwo_username': 'IA',
    	}))

		addToDb(self.username.username, 'IA', playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, 'score')

		self.close()

def addToDb(playerone_username, playertwo_username, playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, reason_end):

	obj = PongGameModels.objects.create(
			player1=playerone_username,
			player2=playertwo_username,
			score_player1=str(playerone_score),
			score_player2=str(playertwo_score),
			number_ball_touch_player1=str(n_ball_touch_player1),
			number_ball_touch_player2=str(n_ball_touch_player2),
			winner=str(winner),
			reason=reason_end
	)

	obj.save

	print('game is add to database')
