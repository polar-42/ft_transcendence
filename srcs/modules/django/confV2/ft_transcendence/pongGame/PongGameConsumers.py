import json, asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import pongThreads
from .models import PongGameModels
from channels.db import database_sync_to_async


class PongGameSocket(AsyncWebsocketConsumer):
	game = []
	connected_users = []
	pongGame = []
	channel_layer = get_channel_layer()

	async def connect(self):
		if len(self.connected_users) >= 2:
			await self.close()
			return
		await self.accept()

		self.pongGameId = self.scope['url_route']['kwargs']['gameId']
		self.username = self.scope['user']

		self.players_game = []

		print("PongGameId =", self.pongGameId)

		await self.channel_layer.group_add(
			self.pongGameId,
			self.channel_name
		)

		if len(self.connected_users) < 2:
			self.connected_users.append(self)

		if len(self.connected_users) == 2:
			self.players_game.append(self.connected_users[0])
			self.players_game.append(self)
			await self.connected_users[0].add_players_list(self.connected_users[0], self)

		if len(self.connected_users) == 2:
			self.pongGame.append(pongThreads.pongGame())

			cpy = self.connected_users.copy()
			await self.pongGame[-1].launchGame(self.pongGameId, cpy)

			self.game.append(cpy)
			self.connected_users.clear()

	async def add_players_list(self, p1, p2):
		self.players_game.append(p1)
		self.players_game.append(p2)

	async def disconnect(self, close_code):

		await self.channel_layer.group_discard(
			self.pongGameId,
			self.channel_name
		)

		i = 0
		for x in self.game:
			if self in x and x is not None and self.pongGame[i] is not None:
				r = await self.pongGame[i].quitGame(self)
				asyncio.wait(r)
				self.pongGame[i] = None
				x = None
			else:
				i = i + 1

		print(f"Pong game user disconnected: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)

		message = data['message']

		i = 0
		for x in self.game:
			if self in x and self.pongGame[i] is not None:
				if message == 'input':
					await self.pongGame[i].inputGame(data['input'], self)
			else:
				i = i + 1

	async def end_game(self, event):

		print('end_game is', str(self.username))

		await self.channel_layer.group_discard(
			self.pongGameId,
			self.channel_name
		)

		if self.players_game[0] is self:
			player1 = self
			player2 = self.players_game[1]
		else:
			player1 = self
			player2 = self.players_game[0]

		await self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': self.username.username,
				'reason': 'disconnexion',
				'playerone_score': 3,
				'playertwo_score': 0,
				'playerone_username': player1.username.username,
				'playertwo_username': player2.username.username,
    	}))

		await addToDb(player1.username.username, player2.username.username, 3, 0, self.username.username, 3, 0, 'disconnexion')

		await self.close()

	async def end_game_by_score(self, event):

		winner = event['winner']

		print('Game is win by', winner.username)

		await self.channel_layer.group_discard(
			self.pongGameId,
			self.channel_name
		)

		i = 0
		for x in self.game:
			if self in x and x is not None and self.pongGame[i] is not None:
				r = await self.pongGame[i].finishGame()
				asyncio.wait(r)
				self.pongGame[i] = None
				x = None
			else:
				i = i + 1

		playerone_score = event['playerone_score']
		playertwo_score = event['playertwo_score']

		n_ball_touch_player1 = event['number_ball_touch_player1']
		n_ball_touch_player2 = event['number_ball_touch_player2']

		await self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': winner.username,
				'reason': 'score',
				'playerone_score': str(playerone_score),
				'playertwo_score': str(playertwo_score),
				'playerone_username': self.players_game[0].username.username,
				'playertwo_username': self.players_game[1].username.username,
    	}))

		if winner.username == str(self.username):

			await addToDb(self.players_game[0].username, self.players_game[1].username, playerone_score, playertwo_score, winner.username, n_ball_touch_player1, n_ball_touch_player2, 'score')

		await self.close()

@database_sync_to_async
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
