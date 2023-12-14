import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from . import matchmakingThreads

pongMatchmaking = matchmakingThreads.pongMatchmaking()

class pongMatchmakingSocket(AsyncWebsocketConsumer):

	async def connect(self):
		self.user = self.scope['user']
		if await pongMatchmaking.AddUser(self.user) == True:
			await self.accept()
		else:
			await self.close()
			return

		await self.channel_layer.group_add(
			pongMatchmaking.channelName,
			self.channel_name
		)


	async def disconnect(self, close_code):
		if pongMatchmaking.RemoveUser(self.user) == True:
			print(f"Pong matchmaking user: {self.user} is disconnected")

	async def receive(self, text_data):
		data = json.loads(text_data)

	async def CreatePongGameMessage(self, event):
		if (self.user.id == event['user1'] or self.user.id == event['user2']):
			print ("Send create pong game message to " + self.user.username)
			await self.send(text_data=json.dumps({
				'gameId': event['gameId']
			}))

