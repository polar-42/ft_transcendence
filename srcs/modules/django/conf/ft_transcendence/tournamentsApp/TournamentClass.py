from enum import IntEnum


class TypeGame(IntEnum):
	Undefined = 0
	Pong = 1
	Battleship = 2

class Tournament():
	def __init__(self, id, creator, typeGame : TypeGame, numberOfPlayer : int, privateGame : bool, description : str, name: str):
		self._id = id
		self._creator = creator
		self._typeGame = typeGame
		self._playerAmount = numberOfPlayer
		self._private = privateGame
		self._desc = description
		self._name = name
		self._players = [self._creator]

	def __str__(self) -> str:
		return "id is " + str(self._id) + " name = " + str(self._typeGame) + " private = " + str(self._private) + " game : " + self._name + " created by " + self._creator.username + " with " + str(self._playerAmount) + " players. desc = " + self._desc

	def getTournament(self):
		return self

	def IsUserPresent(self, user):
		for users in self._players:
			if users.id == user:
				return True
		return False

	def IsTournamentExist(self, tournamentId):
		if int(self._id) is int(tournamentId):
			return True
		return False

	def addPlayer(self, player):
		if player not in self._players:
			self._players.append(player)
			return True
		return False
