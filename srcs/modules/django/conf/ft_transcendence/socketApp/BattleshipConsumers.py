import json
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from battleshipApp import BattleshipMatch
import asyncio
from asgiref.sync import async_to_sync

GameManager = BattleshipMatch.BattleShipGameManager

class socket(WebsocketConsumer):
	Game = None
	def connect(self):
		print("TOTO")
		global GameManager
		self.accept()
		self.GameId = self.scope['url_route']['kwargs']['gameId']
		async_to_sync(self.channel_layer.group_add)(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		self.user = self.scope['user']
		self.Game =  GameManager.JoinGame(GameManager, self.GameId, "BattleshipGame" + self.GameId, self.scope['user'])

	def disconnect(self, close_code):
		GameManager.LeaveGame(GameManager, self.GameId, self.user)
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
			case 'LoadEnded':
				self.Game.RCV_OnLoad()
			case 'HitCase':
				self.Game.RCV_HitCase(self.user, data['input'])

	def MSG_initGame(self, event):
		(self.send)(text_data=json.dumps({
			'function': "initGame",
			'timer': 60
		}))
	
	def MSG_StartGame(self, event):
		(self.send)(text_data=json.dumps({
			'function': "StartGame",
			'timer': -1
		}))

	def MSG_GiveTurn(self, event):
		(self.send)(text_data=json.dumps({
			'function': "StartTurn" if event['player'].sock_user.id is self.user.id else "StartEnemyTurn",
			'playerName' : event['player'].Name,
			'timer': 30
		}))

	def MSG_GameStop(self, event):
		if event['user'] != -1 and event['user'] != self.user.id:
			return
		print(self.user.username + ' Stop')
		(self.send)(text_data=json.dumps({
			'function': "GameStop",
			'message' : event['message'],
			'timer': -1
		}))
		self.channel_layer.group_discard(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		self.Game.closeThread()
		async_to_sync(self.close())

	def MSG_HitResult(self, event):
		(self.send)(text_data=json.dumps({
			'function': "GotHit" if event['target'].sock_user.id is self.user.id else "HitEnemy",
			'case': event['case'],
			'result' : event['result'],
			'destroyedboat' : event['destroyedboat'],
			'timer': -1
		}))
		
	def MSG_GameEnd(self, event):
		(self.send)(text_data=json.dumps({
			'function' : "Loose" if event['looser'].sock_user.id == self.user.id else "Win",
			'other' : event['looser'].Name if event['winner'].sock_user.id == self.user.id else event['winner'].Name,
			'wAliveBoat' : event['winnerBoat'],
			'lAliveBoat' : event['looserBoat'],
			'timer': -1
		}))
		(self.close)()
		self.channel_layer.group_discard(
				"BattleshipGame" + self.GameId,
				self.channel_name
			)
	
	def MSG_RequestBoat(self, event):
		if self.user.id != event['user']:
			return
		(self.send)(text_data=json.dumps({
			'function' : "RetrieveBoat",
			'timer' : - 1
		}))

	def MSG_RequestHit(self, event):
		if self.user.id != event['user']:
			return
		print("Test")
		(self.send)(text_data=json.dumps({
			'function' : "RetrieveHit",
			'timer' : - 1
		}))