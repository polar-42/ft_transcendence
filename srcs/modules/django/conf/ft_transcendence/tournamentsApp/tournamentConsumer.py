import json
from channels.generic.websocket import WebsocketConsumer
from .views import get_tournaments_manager
from asgiref.sync import async_to_sync

class TournamentSocket(WebsocketConsumer):
	#IL FAUT FAIRE DES DICT CAR C'EST COMMUN A TOUS LES SOCKETS MICKA JE TE LAISSE FAIRE JE VAIS EN VACANSE <3
	#owner = None
	#players = []
	#sizeTournaments = -1
	#tournament = None

	def connect(self):

		TournamentsManager = get_tournaments_manager() #TO CHANGE
		self.tournament = TournamentsManager.GetTournament(self.scope['url_route']['kwargs']['tournamentId'])

		#if len(self.players) > self.sizeTournaments:
		#	print('tournaments', self.scope['url_route']['kwargs']['tournamentId'], 'is full')
		#	self.close()

		self.tournamentId = self.scope['url_route']['kwargs']['tournamentId']

		self.channel_tournament = "Tournaments" + self.tournamentId
		print("User = " + self.channel_tournament)

		self.username = self.scope['user'].username
		self.user = self.scope['user']

		async_to_sync(self.channel_layer.group_add)(
			self.channel_tournament,
			self.channel_name
		)

		self.accept()

		print(self.scope['user'].username + " is connected to tournament", self.tournamentId)

		if self.tournament.addPlayer(self.scope['user']) is False:
			print('aaaaaaaaaa')
			self.close()
			return

		#self.new_connexion_on_tournament()

		#if len(self.players) == self.sizeTournaments:
		#	self.tournament.start(self.players)

	def disconnect(self, code):
		#self.players.remove(self)

		self.close()

		print(self.scope['user'].username + " is disconnected")

		#self.new_connexion_on_tournament()

	def receive(self, text_data):
		data = json.loads(text_data)

		print(self.scope['user'].username + " receive")
		print(data)

	def MSG_NewUser(self, event):
		print('new_connexion_on_tournament')

		#if self.scope['user'].id == new_user.id:
		#	return
		PL = []
		for player in self.tournament._players:
			PL.append(player.username)
		(self.send)(text_data=json.dumps({
			'type': 'SendPlayersList',
			# 'size_tournaments': self.sizeTournaments,
			'players': PL
		}))
	
	def MSG_Match(self, event):
		(self.send)(text_data=json.dumps({
			'type': 'SendMatchList',
			# 'size_tournaments': self.sizeTournaments,
			'step': event['step'],
			'matchList': event['matchList']
		}))
	
	def MSG_LaunchGame(self, event):
		print("LaunchGame")
		if self.user.id is not event['Player1'] and self.user.id is not event["Player2"]:
			return
		(self.send)(text_data=json.dumps({
			'type': 'LaunchMatch',
			'gameType' : event['gameType'],
			'gameId' : event['gameId'],
			'tournamentId' : event['tournamentId']
			# 'size_tournaments': self.sizeTournaments,

		}))

