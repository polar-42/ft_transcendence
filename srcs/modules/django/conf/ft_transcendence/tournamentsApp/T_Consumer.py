import json, os
from channels.generic.websocket import WebsocketConsumer

from ft_transcendence import ColorPrint

from . import T_Manager

class TournamentSocket(WebsocketConsumer):


	def connect(self):
		ColorPrint.prYellow("HELLO!!!!")
		self.TournamentId = int(self.scope['url_route']['kwargs']['tournamentId'])
		if (T_Manager.Manager.ConnectUser(self.scope['user'], self, self.TournamentId) is False):
			self.close()
			return
		self.Opened = True

	def disconnect(self, code):
		T_Manager.Manager.DisconnectUser(self.scope['user'], self.TournamentId)
		self.Opened = False
		pass

	def receive(self, text_data):
		data = json.loads(text_data)
		match (data['function']):
			case 'Reconnect':
				if (T_Manager.Manager.ConnectUser(self.scope['user'], self, self.TournamentId) is False):
					self.close()
				return
			case 'GoingAway':
				tournament = T_Manager.Manager.GetTournament(self.TournamentId)
				if (tournament is None):
					ColorPrint.prRed("Error! Tournament is None")
					self.close()
				elif (tournament.GoingAway(self.scope['user']) == False):
					ColorPrint.prRed("CLOSE SOCKET")
					self.close()
				return
			case 'ReadyPressed':
				tournament = T_Manager.Manager.GetTournament(self.TournamentId)
				if (tournament is None):
					ColorPrint.prRed("Error! Tournament is None")
					self.close()
				tournament.ChangeReadyState(self.scope['user']) 
				return