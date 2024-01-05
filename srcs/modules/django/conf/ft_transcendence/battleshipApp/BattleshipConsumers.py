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
		self.Game =  BattleshipMatchmaking.GameManager.JoinGame(BattleshipMatchmaking.GameManager, self.GameId, self.scope['user'], self)

	def disconnect(self, close_code):
		BattleshipMatchmaking.GameManager.LeaveGame(BattleshipMatchmaking.GameManager, self.GameId, self.user)
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

	# def MSG_initGame(self, event):
	# 	(self.send)(text_data=json.dumps({
	# 		'function': "initGame",
	# 		'timer': 60
	# 	}))
	
	# def MSG_StartGame(self, event):
	# 	(self.send)(text_data=json.dumps({
	# 		'function': "StartGame",
	# 		'timer': -1
	# 	}))

	# def MSG_GiveTurn(self, event):
	# 	(self.send)(text_data=json.dumps({
	# 		'function': "StartTurn" if event['player'].sock_user.id is self.user.id else "StartEnemyTurn",
	# 		'playerName' : event['player'].Name,
	# 		'timer': 30
	# 	}))

	def GetTournamentId(self):
		startPos = len("Tournament")
		EndPos = self.GameId.find('_')
		id = self.GameId[startPos:EndPos]
		return id

	def MSG_GameStop(self, event):
		if event['user'] != -1 and event['user'] != self.user.id:
			return
		self.Game.disconnectUser(self.user)
		self.channel_layer.group_discard(
			"BattleshipGame" + self.GameId,
			self.channel_name
		)
		(self.send)(text_data=json.dumps({
			'function': "GameStop",
			'message' : event['message'],
			'tournamentId' : -1 if self.isTournament is False else self.GetTournamentId(),
			'timer': -1
		}))
		print("Stop for = " + self.user.username)
		async_to_sync(self.close())

	def MSG_HitResult(self, event):
		(self.send)(text_data=json.dumps({
			'function': "GotHit" if event['target'].sock_user.id is self.user.id else "HitEnemy",
			'case': event['case'],
			'result' : event['result'],
			'destroyedboat' : event['destroyedboat'],
			'timer': -1
		}))
	
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
		(self.send)(text_data=json.dumps({
			'function' : "RetrieveHit",
			'timer' : - 1
		}))