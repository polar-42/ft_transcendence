import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


class socket(WebsocketConsumer):
	def connect(self):
		self.accept()
		self.Connected = True
		self.GameId = self.scope['url_route']['kwargs']['gameId']
		self.isTournament = self.GameId.startswith("Tournament")
		# async_to_sync(self.channel_layer.group_add)(
			# "BattleshipGame" + self.GameId,
			# self.channel_name
		# )
		self.user = self.scope['user']
		from . import BS_MatchmakingManager
		self.Game = BS_MatchmakingManager.GameManager.JoinGame(BS_MatchmakingManager.GameManager, self.GameId, self.scope['user'], self)

	def disconnect(self, close_code):
		from . import BS_MatchmakingManager
		BS_MatchmakingManager.GameManager.LeaveGame(BS_MatchmakingManager.GameManager, self.GameId, self.user)
		# self.channel_layer.group_discard(
			# "BattleshipGame" + self.GameId,
			# self.channel_name
		# )
		print(f"Utilisateur déconnecté: {self.scope['user']}")
		self.Connected = False

	def receive(self, text_data):
		data = json.loads(text_data)
		match (data['function']):
			case 'sendBoats':
				self.Game.RCV_BoatsList(self.user, data['input'])
			case 'HitCase':
				self.Game.RCV_HitCase(self.user, data['input'])
