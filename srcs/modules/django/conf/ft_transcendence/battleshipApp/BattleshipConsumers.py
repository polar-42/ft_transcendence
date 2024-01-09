import json
from channels.generic.websocket import WebsocketConsumer
from battleshipApp import BattleshipMatch
from asgiref.sync import async_to_sync

from . import BattleshipMatchmaking

class socket(WebsocketConsumer):
	Game = None
	def connect(self):
		self.accept()
		self.GameId = self.scope['url_route']['kwargs']['gameId']
		self.isTournament = self.GameId.startswith("Tournament")
		async_to_sync(self.channel_layer.group_add)(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		self.user = self.scope['user']
		from . import BattleshipGameManager
		self.Game =  BattleshipGameManager.GameManager.JoinGame(BattleshipGameManager.GameManager, self.GameId, self.scope['user'], self)

	def disconnect(self, close_code):
		from . import BattleshipGameManager
		BattleshipGameManager.GameManager.LeaveGame(BattleshipGameManager.GameManager, self.GameId, self.user)
		self.channel_layer.group_discard(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	def receive(self, text_data):
		data = json.loads(text_data)
		match (data['function']):
			case 'sendBoats':
				self.Game.RCV_BoatsList(self.user, data['input'])
			case 'HitCase':
				self.Game.RCV_HitCase(self.user, data['input'])