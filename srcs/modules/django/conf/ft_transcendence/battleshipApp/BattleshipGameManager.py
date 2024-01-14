from . import ColorPrint

class BattleShipGameManager():
	_MatchList = {}

	def JoinGame(self, gameId, user, socket):
		if (gameId not in self._MatchList.keys()):
			ColorPrint.prRed("Error ! User {name} try to join non existing game : {game}.".format(name=user.username, game=gameId))
			return None
		else: #POURQUOI UN ELSE ICI ????
			ColorPrint.prRed("Error ! User {name} Socket : {Msocket}.".format(name=user.username, Msocket=socket))
			self._MatchList[gameId].ConnectUser(user, socket)
		return self._MatchList[gameId]

	def LeaveGame(self, gameId, user):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList[gameId].DisconnectUser(user)

	def CloseGame(self, gameId):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList.pop(gameId)

	from . import BattleshipMatch
	def CreateGame(self, user1, user2, gameid : str, GType : BattleshipMatch.GameType, _id):
		if (id not in self._MatchList.keys()):
			from . import BattleshipMatch
			self._MatchList[gameid] = BattleshipMatch.BattleshipMatch(gameid, user1, user2, self, GType, _id)
			ColorPrint.prGreen("DEBUG : Game {gameId} created.".format(gameId=gameid))
		else:
			ColorPrint.prRed("Error! Trying to create a game with duplicate id : " + gameid + ".")


GameManager = BattleShipGameManager
