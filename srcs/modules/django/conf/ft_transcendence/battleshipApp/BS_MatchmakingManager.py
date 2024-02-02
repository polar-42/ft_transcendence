from ft_transcendence import ColorPrint
from .BS_Enum import GameType
from .models import BattleshipGameModels

class BattleShipGameManager():
	_MatchList = {}

	def JoinGame(self, gameId, user, socket):
		if (gameId not in self._MatchList.keys()):
			ColorPrint.prRed("Error ! User {name} try to join non existing game : {game}.".format(name=user.nickname, game=gameId))
			return None
		ColorPrint.prRed("Error ! User {name} Socket : {Msocket}.".format(name=user.nickname, Msocket=socket))
		self._MatchList[gameId].ConnectUser(user, socket)
		return self._MatchList[gameId]

	def LeaveGame(self, gameId, user):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList[gameId].DisconnectUser(user)

	def CloseGame(self, gameId):
		if gameId not in self._MatchList.keys():
			return

		addToDb(self._MatchList[gameId])

		self._MatchList.pop(gameId)

	def CreateGame(self, user1, user2, gameid : str, GType : GameType, _id):
		if (id not in self._MatchList.keys()):
			from .BS_Match import BattleshipMatch
			self._MatchList[gameid] = BattleshipMatch(gameid, user1, user2, self, GType, _id)
			ColorPrint.prGreen("DEBUG : Game {gameId} created.".format(gameId=gameid))
		else:
			ColorPrint.prRed("Error! Trying to create a game with duplicate id : " + gameid + ".")

from .BS_Match import BattleshipMatch
def addToDb(battleshipGame: BattleshipMatch):

	if battleshipGame.TournamentGame is None:
		battleshipGame.TournamentGame = -1

	BattleshipGameModels.objects.create(
		player1=battleshipGame.Users[0].sock_user.id,
		player2=battleshipGame.Users[1].sock_user.id,
		player1_try=battleshipGame.Users[0].HitTry,
		player2_try=battleshipGame.Users[1].HitTry,
		player1_hit=battleshipGame.Users[0].BoatHit,
		player2_hit=battleshipGame.Users[1].BoatHit,
		winner=battleshipGame.Winner.sock_user.id,
		tournamentId=battleshipGame.TournamentGame
	)

GameManager = BattleShipGameManager
