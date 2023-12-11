import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from battleshipApp import BattleshipMatch

GameManager = BattleshipMatch.BattleShipGameManager

class socket(AsyncWebsocketConsumer):
	async def connect(self):
		global _MatchList
		if len(self.connected_users) >= 2:
			await self.close()
			return
		await self.accept()
		self.GameId = self.scope['url_route']['kwargs']['gameId']
		BattleshipMatch.BattleShipGameManager.JoinGame(self.GameId, self.scope['user'])
		await self.channel_layer.group_add(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)

	async def disconnect(self, close_code):
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)