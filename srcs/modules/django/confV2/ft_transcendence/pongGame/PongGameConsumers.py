import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import pongThreads



class PongGameSocket(AsyncWebsocketConsumer):
	connected_users = []
	pongGame = pongThreads.pongGame()
	channel_layer = get_channel_layer()

	async def connect(self):
		if len(self.connected_users) >= 2:
			await self.close()
			return
		await self.accept()

		self.pongGameId = self.scope['url_route']['kwargs']['gameId']
		self.username = self.scope['user']

		print("PongGameId =", self.pongGameId)

		await self.channel_layer.group_add(
			self.pongGameId,
			self.channel_name
		)

		self.connected_users.append(self)

		#for user in self.connected_users:
		#	print(({'Pong game user connected': user.username}))

		if (len(self.connected_users) == 2):
			await self.pongGame.launchGame(self.pongGameId, self.connected_users)
		print('UN GROS TEST by', self.username)

	async def disconnect(self, close_code):
		self.connected_users.remove(self.scope['user'])
		print(f"Pong game user disconnected: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)

		print('receive message')
		message = data['message']
		if message == 'input':
			await self.pongGame.inputGame(data['input'], self)

	async def gameData(self, event):
		#TAKE TO MUCH TIME
		print('GameData is called by', self.username)

		ball_pos_x = event['ball_pos_x']
		ball_pos_y = event['ball_pos_y']
		player1_pos_y = event['playerone_pos_y']
		player2_pos_y = event['playertwo_pos_y']

		await self.send(text_data=json.dumps({
			'type': 'game_data',
			'ball_pos_x': ball_pos_x,
            'ball_pos_y': ball_pos_y,
            'playerone_pos_y': player1_pos_y,
            'playertwo_pos_y': player2_pos_y,
		}))
