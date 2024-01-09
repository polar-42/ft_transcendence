from .models import TournamentsModels

from .EnumClass import GameType, UserState, TournamentVisibility
from .TournamentClass import Tournament

from battleshipApp import ColorPrint

class TournamentsManager():
	_Tournaments = {}

# 
	# def __init__(self):
		# pass
# 
	
	def CreateTournament(self, creator, data):

		for tournament in self._Tournaments.values():
			CreatorUser = tournament.GetUserById(creator.id)
			if (CreatorUser is not None):
				if (CreatorUser.Status is UserState.Alive):
					ColorPrint.prYellow("Warning! User {username} : Try to create a tournament while already in one.".format(username=CreatorUser.Username))
					return False, -1

		tournamentType = GameType.Pong if data.get('typeGame') == "Pong" else GameType.Battleship

		obj = TournamentsModels.objects.create(
			tournamentsName = str(data.get('tournamentsName')),
			numberOfPlayers = int(data.get('numberOfPlayers')),
			creatorId = creator.id,
			privateGame = TournamentVisibility.Public,
			description =  "DESCRIPTION TO DO",
			tournamentType = tournamentType
		)

		obj.save()
# 
		nTournament = Tournament(tournamentId=obj.id, creator=creator.id, playerAmount=int(data.get('numberOfPlayers')), description="DESCRIPTION TO DO", tournamentName=data.get('tournamentsName'), gameType=tournamentType, visibility=TournamentVisibility.Public)
		self._Tournaments[int(obj.id)] = nTournament
		return True, nTournament.TournamentId

	def ConnectUser(self, user, socket, tournamentId : int):
		tournamentId = int(tournamentId)
		if tournamentId not in self._Tournaments:
			ColorPrint.prYellow("Warning! User {username} : Try to join a non existing tournament.".format(username=user.username))
			return False
		User = self._Tournaments[tournamentId].GetUserById(user.id)
		if User is not None:
			self._Tournaments[tournamentId].ReconnectUser(User)
			return True
		for tournament in self._Tournaments.values():
			User = tournament.GetUserById(user.id)
			if (User is not None):
				if tournamentId == tournament.TournamentId:
					continue
				elif (User.Status is not UserState.Alive):
					if (User.Status is UserState.Waiting):
						tournament.Disconnect(User)
					return self._Tournaments[tournamentId].CreateUser(user, socket)
				else:
					ColorPrint.prYellow("Warning! User {username} : Try to join a tournament while already in one.".format(username=User.Username))
					return False
			return self._Tournaments[tournamentId].CreateUser(user, socket)

	def DisconnectUser(self, user, tournamentId : int):
		tournamentId = int(tournamentId)
		if tournamentId not in self._Tournaments:
			ColorPrint.prYellow("Warning! User {username} : Try to leave a non existing tournament.".format(username=user.username))
			return False
		User = self._Tournaments[tournamentId].GetUserById(user.id)
		if (User is None):
			ColorPrint.prYellow("Warning! User {username} : Try to leave a tournament when not inside.".format(username=User.Username))
			return False
		else:
			self._Tournaments[tournamentId].DisconnectUser(User)
			return True
	# def sendMatchData(self, TournamentID, MatchId, Winner):
		# for tournament in self._Tournaments:
			# if tournament._id == int(TournamentID):
				# tournament.UpdateData(MatchId, Winner)
				# return
# 
	def GetTournament(self, tournamentId):
		if tournamentId not in self._Tournaments.keys():
			return None
		return self._Tournaments[tournamentId]
# 
	def GetTournaments(self):
		return self._Tournaments
# 
	# def canJoin(self, user, tournamentId):
		# for tournament in self._Tournaments:
			# if tournament.IsUserPresent(user) is True:
				# return 'Already in the tournament', False, True
# 
# 
		# for tournament in self._Tournaments:
			# if tournament.IsTournamentExist(tournamentId) is True:
				# return 'Player is add to the tournaments', True, True
# 
		# return 'Error while joining the tournament', False, False
# 
# 
	# def AddUser(self, user, tournamentId):
		# for tournament in self._Tournaments:
			# if tournament.IsUserPresent(user) is True:
				# return True
# 
		# for tournament in self._Tournaments:
			# if tournament.IsTournamentExist(tournamentId) is True:
				# tournament.addPlayer(user)
				# return True
# 
		# return False
# 
	# def RemoveUser(self, user, tournamentId):
		# for tournament in self._Tournaments:
			# if tournament.IsTournamentExist(tournamentId) is True:
				# if tournament.IsUserPresent(user) is True:
					# tournament.removePlayer(user)
					# if len(tournament._players) <= 0:
						# self._Tournaments.remove(tournament)
# 
Manager = TournamentsManager()