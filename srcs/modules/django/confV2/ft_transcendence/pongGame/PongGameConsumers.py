import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import pongThreads

pongGame = pongThreads.pongGame()

class PongGameSocket(AsyncWebsocketConsumer):
	connected_users = []

	async def connect(self):
		if len(self.connected_users) >= 2:
			await self.close()
			return
		await self.accept()

		self.pongGameId = self.scope['url_route']['kwargs']['gameId']

		print("PongGameId =", self.pongGameId)

		await self.channel_layer.group_add(
			self.pongGameId,
			self.channel_name
		)

		self.connected_users.append(self.scope['user'])

		for user in self.connected_users:
			print(({'Pong game user connected': user.username}))

		if (len(self.connected_users) == 2):
			await pongGame.launchGame(self.pongGameId)

	async def disconnect(self, close_code):
		self.connected_users.remove(self.scope['user'])
		print(f"Pong game user disconnected: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)

	async def gameData(self, event):
		#TAKE TO MUCH TIME
		print('GameData is called')

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
