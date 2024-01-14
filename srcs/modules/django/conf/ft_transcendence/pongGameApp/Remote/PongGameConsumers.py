import json, asyncio
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from . import pongThreads
from ..models import PongGameModels
from asgiref.sync import async_to_sync
from tournamentsApp import views, TournamentManager, TournamentClass
from .pongGameManager import Manager


class PongGameSocket(WebsocketConsumer):
	connected_users = {}
	pongGame = {}
	channel_layer = get_channel_layer()

	def connect(self):
		self.pongGameId = self.scope['url_route']['kwargs']['gameId']
		self.isTournament = self.pongGameId.startswith('Tournament')
		self.tournament = None
		self.user = self.scope['user']

		#if self.isTournament is True:
		#	tournamentManage = views.get_tournaments_manager()
		#	self.tournament = tournamentManage.GetTournament(self.pongGameId[10:].split('_')[0])

		self.accept()

		self.pongGame[self.pongGameId] = Manager.joinGame(self.pongGameId, self.user, self)

		#if self.pongGameId in self.connected_users and len(self.connected_users[self.pongGameId]) >= 2:
		#	self.close()
		#	return

		#self.username = self.scope['user']
		#self.players_game = []

		print("PongGameId =", self.pongGameId)

		async_to_sync(self.channel_layer.group_add)(
			self.pongGameId,
			self.channel_name
		)

		#if self.pongGameId not in self.connected_users:
			#tab = []
			#tab.append(self)
			#self.connected_users[self.pongGameId] = tab
#
		#elif self.pongGameId in self.connected_users and len(self.connected_users[self.pongGameId]) < 2:
			#self.connected_users[self.pongGameId].append(self)
#
		#if len(self.connected_users[self.pongGameId]) == 2:
			#self.connected_users[self.pongGameId][0].add_players_list(self.connected_users[self.pongGameId][0], self)
			#self.players_game.append(self.connected_users[self.pongGameId][0])
			#self.players_game.append(self)
#
			#self.pongGame[self.pongGameId] = pongThreads.pongGame()
#
			#cpy = self.connected_users[self.pongGameId].copy()
			#self.pongGame[self.pongGameId].launchGame(self.pongGameId, cpy, self.isTournament)
#
			#del self.connected_users[self.pongGameId]

	def add_players_list(self, p1, p2):
		self.players_game.append(p1)
		self.players_game.append(p2)

	def disconnect(self, close_code):

		async_to_sync(self.channel_layer.group_discard)(
			self.pongGameId,
			self.channel_name
		)

		if self.pongGameId in self.pongGame:
			self.pongGame[self.pongGameId].quitGame(self)
			del self.pongGame[self.pongGameId]

		print(f"Pong game user disconnected: {self.scope['user']}")

	def receive(self, text_data):
		data = json.loads(text_data)

		message = data['message']

		if message == 'input':
			self.pongGame[self.pongGameId].inputGame(data['input'], self)

	def end_game(self, event):

		print('end_game is', str(self.user))

		async_to_sync(self.channel_layer.group_discard)(
			self.pongGameId,
			self.channel_name
		)

		player1 = event['playerone']
		player2 = event['playertwo']

		print('player1 =', player1, 'player2 =', player2)

		#if self.isTournament:
		#	self.tournament.UpdateData(self.pongGameId, self.username)

		#	addToDb(player1.username.username, player2.username.username, 3, 0, self.username.username, 3, 0, 'disconnexion', 'tournaments')
		if self.isTournament is False:
			self.send(text_data=json.dumps({
    				'type': 'game_ending',
					'winner': str(self.user),
					'reason': 'disconnexion',
					'playerone_score': 3,
					'playertwo_score': 0,
					'playerone_username': player1,
					'playertwo_username': player2,
    		}))
			addToDb(player1, player2, 3, 0, (self.user), 3, 0, 'disconnexion', 'matchMake')

		self.close()

	def end_game_by_score(self, event):

		winner = event['winner']

		print('Game is win by', winner)

		async_to_sync(self.channel_layer.group_discard)(
			self.pongGameId,
			self.channel_name
		)

		if self.pongGameId in self.pongGame:
			self.pongGame[self.pongGameId].finishGame()
			del self.pongGame[self.pongGameId]

		playerone_score = event['playerone_score']
		playertwo_score = event['playertwo_score']

		n_ball_touch_player1 = event['number_ball_touch_player1']
		n_ball_touch_player2 = event['number_ball_touch_player2']


		#if self.isTournament and winner == self.username.username:
		#	self.tournament.UpdateData(self.pongGameId, winner)

			#if winner.username == str(self.username):
			#	addToDb(self.players_game[0].username, self.players_game[1].username, playerone_score, playertwo_score, winner.username, n_ball_touch_player1, n_ball_touch_player2, 'score', 'tournaments')

		if self.isTournament is False:
			self.send(text_data=json.dumps({
    				'type': 'game_ending',
					'winner': winner,
					'reason': 'score',
					'playerone_score': str(playerone_score),
					'playertwo_score': str(playertwo_score),
					'playerone_username': event['playerone_username'],
					'playertwo_username': event['playertwo_username'],
    		}))

			if winner == str(self.user):
				addToDb(event['playerone_username'], event['playerone_username'], playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, 'score', 'matchMake')

		self.close()

def addToDb(playerone_username, playertwo_username, playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, reason_end, typeGame):

	obj = PongGameModels.objects.create(
			player1=playerone_username,
			player2=playertwo_username,
			score_player1=str(playerone_score),
			score_player2=str(playertwo_score),
			number_ball_touch_player1=str(n_ball_touch_player1),
			number_ball_touch_player2=str(n_ball_touch_player2),
			winner=str(winner),
			reason=reason_end,
			typeGame=typeGame
	)

	obj.save

	print('game is add to database')
