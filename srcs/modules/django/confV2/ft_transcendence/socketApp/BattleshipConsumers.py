import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class socket(AsyncWebsocketConsumer):
	connected_users = []
	async def connect(self):
		if len(self.connected_users) >= 2:
			await self.close()
			return
		await self.accept()
		print("BattleshipGame" + self.scope['url_route']['kwargs']['gameId'])
		await self.channel_layer.group_add(
			"BattleshipGame" + self.scope['url_route']['kwargs']['gameId'],
			self.channel_name
		)

		self.connected_users.append(self.scope['user'])
		for user in self.connected_users:
			print(({'connected_users': user.username}))

	async def disconnect(self, close_code):
		self.connected_users.remove(self.scope['user'])
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)