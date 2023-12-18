import json
from channels.generic.websocket import WebsocketConsumer
from .views import get_tournaments_manager

class TournamentSocket(WebsocketConsumer):
	owner = None
	players = []
	sizeTournaments = -1
	tournament = None

	def connect(self):
		if self.sizeTournaments == -1:
			self.owner = self
			TournamentsManager = get_tournaments_manager()
			self.tournament = TournamentsManager.GetTournament(self.scope['url_route']['kwargs']['tournamentId'])
			self.sizeTournaments = self.tournament._playerAmount

		if len(self.players) > self.sizeTournaments:
			print('tournaments', self.scope['url_route']['kwargs']['tournamentId'], 'is full')
			self.close()

		self.tournamentId = self.scope['url_route']['kwargs']['tournamentId']

		self.channel_tournament = "Tournaments" + self.tournamentId

		self.username = self.scope['user'].username

		self.channel_layer.group_add(
			self.channel_tournament,
			self.channel_name
		)

		self.players.append(self)

		self.accept()

		print(self.scope['user'].username + " is connected to tournament", self.tournamentId)

		self.new_connexion_on_tournament()

		if len(self.players) == self.sizeTournaments:
			self.tournament.start(self.players)

	def disconnect(self, code):
		self.players.remove(self)

		self.close()

		print(self.scope['user'].username + " is disconnected")

		self.new_connexion_on_tournament()

	def receive(self, text_data):
		data = json.loads(text_data)

		print(self.scope['user'].username + " receive")
		print(data)

	def new_connexion_on_tournament(self):
		print('new_connexion_on_tournament')

		for player in self.players:
			player.send(text_data=json.dumps({
				'type': 'queue_tournament_data',
				'size_tournaments': self.sizeTournaments,
				'player_in_tournament': len(self.players)
			}))

