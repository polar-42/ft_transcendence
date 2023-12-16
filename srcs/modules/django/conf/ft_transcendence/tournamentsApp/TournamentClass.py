from enum import IntEnum


class TypeGame(IntEnum):
	Undefined = 0
	Pong = 1
	Battleship = 2

class Tournament():

	def __init__(self, creator, typeGame : TypeGame, numberOfPlayer : int, privateGame : bool, description : str, name: str):
		self._creator = creator
		self._typeGame = typeGame
		self._playerAmount = numberOfPlayer
		self._private = privateGame
		self._desc = description
		self._name = name
		self._players = [self._creator]

	def __str__(self) -> str:
		return str(self._typeGame) + " private = " + str(self._private) + " game : " + self._name + " created by " + self._creator.username + " with " + str(self._playerAmount) + " players. desc = " + self._desc

	def IsUserPresent(self, user):
		for users in self._players:
			if users.id == user:
				return True
		return False

	def IsTournamentExist(self, tournamentName):
		if self._name == tournamentName:
			return True
		return False

	def addPlayer(self, player):
		self._players.append(player)
