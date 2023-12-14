import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import BattleshipMatchmaking

Matchmake = BattleshipMatchmaking.Matchmaking()

class socket(AsyncWebsocketConsumer):

	async def connect(self):
		self.user = self.scope['user']
		if await Matchmake.AddUser(self.user) == True:
			await self.accept()
		else:
			await self.close()
			return

		await self.channel_layer.group_add(
			Matchmake.channelName,
			self.channel_name
		)
		# print(f"Utilisateur connecté: {self.scope['user']}")


	async def disconnect(self, close_code):
		if Matchmake.RemoveUser(self.user) == True:
			print(f"Utilisateur déconnecté: {self.user}")

	async def receive(self, text_data):
		data = json.loads(text_data)

	async def CreateGameMessage(self, event):
		if (self.user.id == event['user1'] or self.user.id == event['user2']):
			print ("Send message to " + self.user.username)
			await self.send(text_data=json.dumps({
				'gameId': event['gameId']
			}))

