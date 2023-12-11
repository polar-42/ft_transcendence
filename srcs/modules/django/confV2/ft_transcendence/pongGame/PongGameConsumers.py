import json, asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import pongThreads
#from . import PongGameModels


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
			self.add_players_list(self.connected_users[0], self)

		#for user in self.connected_users:
		#	print(({'Pong game user connected': user.username}))

		if len(self.connected_users) == 2:
			print("self.connected_users = ", self.connected_users)

			self.pongGame.append(pongThreads.pongGame())

			cpy = self.connected_users.copy()
			await self.pongGame[-1].launchGame(self.pongGameId, cpy)

			self.game.append(cpy)
			self.connected_users.clear()

	def add_players_list(self, p1, p2):
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
			if self in x:
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

		await self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': str(self.username),
				'reason': 'disconnexion',
    	}))

		#TO CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!
		#PongGameModels.objects.create(
		#	player1=str(self.players_game[0].username),
		#	player2=str(self.players_game[1].username),
		#	score_player1=3,
		#	score_player2=0,
		#	winner=str(self.username)
		#)

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

		await self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': winner.username,
				'reason': 'score',
				'playerone_score': str(playerone_score),
				'playertwo_score': str(playertwo_score),
    	}))


		#TO CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!
		#PongGameModels.objects.create(
		#	player1=str(self.players_game[0].username),
		#	player2=str(self.players_game[1].username),
		#	score_player1=str(playerone_score),
		#	score_player2=str(playertwo_score),
		#	winner=str(winner.username)
		#)

		await self.close()
