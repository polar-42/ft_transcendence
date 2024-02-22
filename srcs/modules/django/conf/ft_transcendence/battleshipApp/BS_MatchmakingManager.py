from ft_transcendence import ColorPrint
from .BS_Enum import GameType
from .models import BattleshipGameModels

from authApp.models import User

class BattleShipGameManager():
	_MatchList = {}

	def JoinGame(self, gameId, user, socket):
		if (gameId not in self._MatchList.keys()):
			# ColorPrint.prRed("Error ! User {name} try to join non existing game : {game}.".format(name=user.nickname, game=gameId))
			return None
		# ColorPrint.prRed("Error ! User {name} Socket : {Msocket}.".format(name=user.nickname, Msocket=socket))
		result =  self._MatchList[gameId].ConnectUser(user, socket)
		if (result == False):
			return None
		return self._MatchList[gameId]

	def LeaveGame(self, gameId, user):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList[gameId].DisconnectUser(user)

	def CloseGame(self, gameId):
		if gameId not in self._MatchList.keys():
			return

		#CHECK IF WINNER OR GAME CANCELLED
		addToDb(self._MatchList[gameId])

		self._MatchList.pop(gameId)

	def CreateGame(self, user1, user2, gameid : str, GType : GameType, _id):
		if (id not in self._MatchList.keys()):
			from .BS_Match import BattleshipMatch
			self._MatchList[gameid] = BattleshipMatch(gameid, user1, user2, self, GType, _id)
			# ColorPrint.prGreen("DEBUG : Game {gameId} created.".format(gameId=gameid))
		# else:
			# ColorPrint.prRed("Error! Trying to create a game with duplicate id : " + gameid + ".")

from .BS_Match import BattleshipMatch
def addToDb(battleshipGame: BattleshipMatch):

	if battleshipGame.TournamentGame is None:
		battleshipGame.TournamentGame = -1

	if battleshipGame.Winner == None:
		return

	for user in battleshipGame.Users:
		if User.objects.filter(id=user.sock_user.id).exists() is False:
			pass
			# ColorPrint.prRed("Error! User {userId} don't exist in the db".format(userId=user.sock_user.id))
		else:
			PlayerModel = User.objects.get(id=user.sock_user.id)
			PlayerModel.BS_Bullets = PlayerModel.BS_Bullets + user.HitTry
			PlayerModel.BS_E_Miss += (user.HitTry - user.BoatHit)
			PlayerModel.BS_E_Hit += user.BoatHit
			PlayerModel.BS_P_Hit += user.HitTaken
			PlayerModel.BS_E_BoatsDestroyed += user.DestroyedBoat
			PlayerModel.BS_P_BoatsDestroyed += user.CountDestroyedBoats()
			PlayerModel.BS_GameCount = PlayerModel.BS_GameCount + 1
			PlayerModel.save()

	BattleshipGameModels.objects.create(
		player1=battleshipGame.Users[0].sock_user.id,
		player2=battleshipGame.Users[1].sock_user.id,
		player1_try=battleshipGame.Users[0].HitTry,
		player2_try=battleshipGame.Users[1].HitTry,
		player1_hit=battleshipGame.Users[0].BoatHit,
		player2_hit=battleshipGame.Users[1].BoatHit,
		winner=battleshipGame.Winner.sock_user.id,
		tournamentId=battleshipGame.TournamentGame,
		player1_boatCount=battleshipGame.Users[0].DestroyedBoat,
		player2_boatCount=battleshipGame.Users[1].DestroyedBoat,
		player1_boatsState=battleshipGame.Users[0].RetrieveBoatResult(),
		player2_boatsState=battleshipGame.Users[1].RetrieveBoatResult()
	)
GameManager = BattleShipGameManager
