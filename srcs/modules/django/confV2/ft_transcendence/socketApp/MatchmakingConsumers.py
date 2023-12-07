import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import BattleshipMatchmaking

Matchmake = BattleshipMatchmaking.Matchmaking()

class socket(AsyncWebsocketConsumer):
	global Matchmaking_users, loop

	async def connect(self):
		user = self.scope['user']
		Matchmake.userList.append(user)
		await self.accept()

		# print(f"Utilisateur connecté: {self.scope['user']}")


	async def disconnect(self, close_code):
		Matchmake.userList.remove(self.scope['user'])
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)

	# async def createGames(self):
		# random.shuffle(self.connected_users)
		# for user in self.connected_users:
			# print(user.username)

