import json
from channels.generic.websocket import WebsocketConsumer
from .views import get_tournaments_manager

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

		self.username = self.scope['user'].username

		self.channel_layer.group_add(
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

	def new_connexion_on_tournament(self, event):
		print('new_connexion_on_tournament')

		#if self.scope['user'].id == new_user.id:
		#	return

		self.send(text_data=json.dumps({
			'type': 'queue_tournament_data',
			'size_tournaments': self.sizeTournaments,
			'player_in_tournament': len(self.players)
		}))

