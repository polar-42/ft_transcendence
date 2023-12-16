from .TournamentClass import Tournament, TypeGame

class TournamentsManager():

	_Tournaments = []

	def __init__(self):
		pass

	#tournamentName = data.get('tournamentsName')
	#numberOfPlayers = data.get('numberOfPlayers')
	#typeGame = data.get('typeGame')

	def CreateTournaments(self, user, data):

		for tournament in self._Tournaments:
			if tournament.IsUserPresent(user.id) is True:
				return False
			# Change Private and Desc to their value
		typeGame = 1 if data.get('typeGame') == "Pong" else 2
		nTournament = Tournament(user, TypeGame(typeGame), int(data.get('numberOfPlayers')), False, "Toto", data.get('tournamentsName'))
		self._Tournaments.append(nTournament)
		for tournament in self._Tournaments:
			print(str(tournament))

	def GetTournaments(self):
		return self._Tournaments

	def AddUser(self, user, tournamentName):
		for tournament in self._Tournaments:
			if tournament.IsUserPresent(user.id) is True:
				print('already in the tournament')
				return True

		for tournament in self._Tournaments:
			if tournament.IsTournamentExist(tournamentName) is True:
				print('add in the tournament')
				tournament.addPlayer(user)
				return True


		print('else')
		return False
