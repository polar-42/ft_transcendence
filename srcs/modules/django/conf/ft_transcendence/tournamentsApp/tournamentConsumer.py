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
			self.sizeTournaments = self.tournament._id

		if len(self.players) > self.sizeTournaments:
			print('tournaments', self.scope['url_route']['kwargs']['tournamentId'], 'is full')
			self.close()

		self.tournamentId = self.scope['url_route']['kwargs']['tournamentId']

		self.channel_layer.group_add(
			"Tournaments" + self.tournamentId,
			self.channel_name
		)

		self.players.append(self)

		self.accept()

		print(self.scope['user'].username + " is connected to tournament", self.tournamentId)

		if len(self.players == self.sizeTournaments):
			self.tournament.start()

	def disconnect(self, code):
		self.players.remove(self)

		self.disconnect()

		print(self.scope['user'].username + " is disconnected")

	def receive(self, text_data):
		data = json.loads(text_data)

		print(self.scope['user'].username + " receive")
		print(data)


