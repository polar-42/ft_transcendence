import json, os
from channels.generic.websocket import WebsocketConsumer

from ft_transcendence import ColorPrint

from . import T_Manager

class TournamentSocket(WebsocketConsumer):


	def connect(self):
		self.TournamentId = int(self.scope['url_route']['kwargs']['tournamentId'])
		if (T_Manager.Manager.ConnectUser(self.scope['user'], self, self.TournamentId) is False):
			self.close()
			return
		ColorPrint.prGreen(self.scope['user'])
		self.Opened = True

	def disconnect(self, code):
		if code != 1006:
			T_Manager.Manager.DisconnectUser(self.scope['user'], self.TournamentId, True if code == 3005 else False)
			self.Opened = False
		return

	def receive(self, text_data):
		data = json.loads(text_data)
		match (data['function']):
			case 'GoingAway':
				self.close(3000)
			case 'ReadyPressed':
				tournament = T_Manager.Manager.GetTournament(self.TournamentId)
				if (tournament is None):
					# ColorPrint.prRed("Error! Tournament is None")
					self.close()
				tournament.ChangeReadyState(self.scope['user']) 
				return
			case 'LeavingTournament':
				self.close(3005)
