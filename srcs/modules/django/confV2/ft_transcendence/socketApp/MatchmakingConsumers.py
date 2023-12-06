import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class socket(AsyncWebsocketConsumer):
	connected_users = []
	async def connect(self):
		self.connected_users.append(self.scope['user'])
		for user in self.connected_users:
			print(({'connected_users': user.username}))
		await self.accept()

	async def disconnect(self, close_code):
		self.connected_users.remove(self.scope['user'])
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)