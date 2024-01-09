from .TournamentClass import Tournament, TypeGame
from .models import TournamentsModels

class TournamentsManager():

	_Tournaments = []

	def __init__(self):
		pass

	def CreateTournaments(self, user, data):

		for tournament in self._Tournaments:
			if tournament.IsUserPresent(user.id) is True:
				return False, -1

		# Change Private and Desc to their value
		typeGame = 1 if data.get('typeGame') == "Pong" else 2

		obj = TournamentsModels.objects.create(
			tournamentsName = "TOURNAMENTSNAME",
			numberOfPlayers = int(data.get('numberOfPlayers')),
			creatorId = user.username,
			privateGame = False,
			description =  data.get('tournamentsName'),
			tournamentsType = typeGame,
		)

		obj.save()

		nTournament = Tournament(obj.id, user, TypeGame(typeGame), int(data.get('numberOfPlayers')), False, "DESCRIPTION TO DO", data.get('tournamentsName'))
		self._Tournaments.append(nTournament)
		for tournament in self._Tournaments:
			print(str(tournament))
		return True, nTournament._id

	def sendMatchData(self, TournamentID, MatchId, Winner):
		for tournament in self._Tournaments:
			if tournament._id == int(TournamentID):
				tournament.UpdateData(MatchId, Winner)
				return

	def GetTournament(self, id):
		for tournament in self._Tournaments:
			if int(tournament.getTournament()._id) == int(id):
				return tournament
		return None

	def GetTournaments(self):
		return self._Tournaments

	def canJoin(self, user, tournamentId):
		for tournament in self._Tournaments:
			if tournament.IsUserPresent(user) is True:
				return 'Already in the tournament', False, True


		for tournament in self._Tournaments:
			if tournament.IsTournamentExist(tournamentId) is True:
				return 'Player is add to the tournaments', True, True

		return 'Error while joining the tournament', False, False


	def AddUser(self, user, tournamentId):
		for tournament in self._Tournaments:
			if tournament.IsUserPresent(user) is True:
				return True

		for tournament in self._Tournaments:
			if tournament.IsTournamentExist(tournamentId) is True:
				tournament.addPlayer(user)
				return True

		return False

	def RemoveUser(self, user, tournamentId):
		for tournament in self._Tournaments:
			if tournament.IsTournamentExist(tournamentId) is True:
				if tournament.IsUserPresent(user) is True:
					tournament.removePlayer(user)
					if len(tournament._players) <= 0:
						self._Tournaments.remove(tournament)

Manager = TournamentsManager()