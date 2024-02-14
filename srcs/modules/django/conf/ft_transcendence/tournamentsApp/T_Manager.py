from .models import TournamentsModels

from .T_Enum import GameType, UserState, TournamentVisibility
from .T_Tournament import Tournament

from ft_transcendence import ColorPrint
from .T_Thread import TimerLoop

class TournamentsManager():

	_Tournaments = {}


	def __init__(self):
		self.thread = None

	def CreateTournament(self, creator, data):

		for tournament in self._Tournaments.values():
			CreatorUser = tournament.GetUserById(creator.id)
			if (CreatorUser is not None):
				if (CreatorUser.Status is UserState.Alive):
					# ColorPrint.prYellow("Warning! User {username} : Try to create a tournament while already in one.".format(username=CreatorUser.Username))
					return False, -1

		tournamentType = GameType.Pong if data.get('typeGame') == "Pong" else GameType.Battleship
		obj = TournamentsModels.objects.create(
			tournamentsName = str(data.get('tournamentsName')),
			numberOfPlayers = int(data.get('numberOfPlayers')),
			creatorId = creator.id,
			privateGame = TournamentVisibility.Public,
			description =  data.get('tournamentsDescription'),
			tournamentType = tournamentType
		)

		obj.save()

		nTournament = Tournament(tournamentId=obj.id, creator=creator.id, playerAmount=int(data.get('numberOfPlayers')), description=data.get('tournamentsDescription'), tournamentName=data.get('tournamentsName'), gameType=tournamentType, visibility=TournamentVisibility.Public, obj=obj)
		self._Tournaments[int(obj.id)] = nTournament
		if (self.thread is None):
			self.thread = TimerLoop(self)
			self.thread.start()
		return True, nTournament.TournamentId

	def closeTournament(self, tournament):
		if (tournament is None):
			return
		if (tournament not in self._Tournaments.values()):
			# ColorPrint.prYellow("Warning! Trying to close a non existing Tournament");
			return
		for User in tournament.PlayersList:
			if User.Socket.Opened is not False:
				User.Socket.close()
		del self._Tournaments[tournament.TournamentId]

	def ConnectUser(self, user, socket, tournamentId : int):
		tournamentId = int(tournamentId)
		if tournamentId not in self._Tournaments:
			# ColorPrint.prYellow("Warning! User {username} : Try to join a non existing tournament ({tID}).".format(username=user.username, tID=tournamentId))
			return False
		User = self._Tournaments[tournamentId].GetUserById(user.id)
		if User is not None:
			# ColorPrint.prGreen("DEBUG ! User {username} here.".format(username=User.Username))
			self._Tournaments[tournamentId].ReconnectUser(User, socket)
			return True
		for tournament in self._Tournaments.values():
			User = tournament.GetUserById(user.id)
			if (User is not None):
				if tournamentId == tournament.TournamentId:
					continue
				elif (User.Status is not UserState.Alive):
					if (User.Status is UserState.Waiting):
						tournament.DisconnectUser(User)
					return self._Tournaments[tournamentId].CreateUser(user, socket)
				else:
					# ColorPrint.prYellow("Warning! User {username} : Try to join a tournament while already in one.".format(username=User.Username))
					return False
			return self._Tournaments[tournamentId].CreateUser(user, socket)

	def DisconnectUser(self, user, tournamentId : int, leave : bool):
		tournamentId = int(tournamentId)
		if tournamentId not in self._Tournaments:
			# ColorPrint.prYellow("Warning! User {username} : Try to leave a non existing tournament.".format(username=user.username))
			return False
		User = self._Tournaments[tournamentId].GetUserById(user.id)
		if (User is None):
			# ColorPrint.prYellow("Warning! User {username} : Try to leave a tournament when not inside.".format(username=user.username))
			return False
		else:
			self._Tournaments[tournamentId].DisconnectUser(User, leave)
			return True

#region Getter

	def GetTournament(self, tournamentId):
		tournamentId = tournamentId
		if tournamentId not in self._Tournaments.keys():
			return None
		return self._Tournaments[tournamentId]

	def GetTournaments(self):
		return self._Tournaments

#endregion

Manager = TournamentsManager()
