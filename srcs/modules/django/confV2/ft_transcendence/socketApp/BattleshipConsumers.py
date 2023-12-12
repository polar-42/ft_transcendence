import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from battleshipApp import BattleshipMatch

GameManager = BattleshipMatch.BattleShipGameManager

class socket(AsyncWebsocketConsumer):
	Game = None
	async def connect(self):
		global GameManager
		await self.accept()
		self.GameId = self.scope['url_route']['kwargs']['gameId']
		await self.channel_layer.group_add(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		self.user = self.scope['user']
		self.Game = await GameManager.JoinGame(GameManager, self.GameId, self.scope['user'], "BattleshipGame" + self.GameId)

	async def disconnect(self, close_code):
		await GameManager.LeaveGame(GameManager, self.GameId, self.user)
		self.channel_layer.group_discard(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		match (data['function']):
			case 'sendBoats':
				await self.Game.RCV_BoatsList(self.user, data['input'])
			case 'LoadEnded':
				await self.Game.RCV_OnLoad()

	async def MSG_initGame(self, event):
		await self.send(text_data=json.dumps({
			'function': "initGame",
			'timer': 60
		}))
	
	async def MSG_StartGame(self, event):
		await self.send(text_data=json.dumps({
			'function': "StartGame",
			'timer': -1
		}))

	async def MSG_GiveTurn(self, event):
		await self.send(text_data=json.dumps({
			'function': "StartTurn" if event['player'].id is self.user.id else "StartEnemyTurn",
			'playerName' : event['player'].username,
			'timer': 30
		}))

	async def MSG_LeaveGame(self, event):
		await self.send(text_data=json.dumps({
			'function': "User Disconnnect",
			'playerName' : event['player'],
			'timer': -1
		}))
		self.channel_layer.group_discard(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		self.close()