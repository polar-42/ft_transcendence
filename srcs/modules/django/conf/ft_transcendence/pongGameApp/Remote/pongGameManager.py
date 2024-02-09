from .pongThreads import pongGame
from ..models import PongGameModels
from authApp.models import User

class PongGameManager():
	_matchList = {}

	def joinGame(self, gameId, user, socket):
		if gameId not in self._matchList.keys():
			print("ERROR, user", user.username, "try to join an non existing game", gameId)
			return None

		result = self._matchList[gameId].connectUser(user, socket)
		if (result == False):
			return None
		return self._matchList[gameId]

	def leaveGame(self, gameId, user):
		if gameId not in self._matchList.keys():
			return
		self._matchList[gameId].disconnectUser(user)

	def closeGame(self, gameId):
		if gameId not in self._matchList.keys():
			return

		self._matchList[gameId].finishGame()

		addToDb(self._matchList[gameId].stat.p1_id, self._matchList[gameId].stat.p2_id, self._matchList[gameId].stat.p1_score, self._matchList[gameId].stat.p2_score, self._matchList[gameId].winner.id, self._matchList[gameId].stat.p1_n_ball_touch, self._matchList[gameId].stat.p2_n_ball_touch, self._matchList[gameId].stat.reason, self._matchList[gameId].stat.idTournament)

		self._matchList.pop(gameId)

	def createGame(self, user1, user2, gameId, tournament):
		if gameId not in self._matchList.keys():
			self._matchList[gameId] = pongGame(user1, user2, gameId, tournament)
			print('PongGame', gameId, 'is created')
		else:
			print('Error! Trying to create a game with duplicate id :', gameId)

Manager = PongGameManager()

def addToDb(player1_id, player2_id, player1_score, player2_score, winner, n_ball_touch_player1, n_ball_touch_player2, reason_end, tournamentId=-1):

	obj = PongGameModels.objects.create(
			player1=str(player1_id),
			player2=str(player2_id),
			score_player1=str(player1_score),
			score_player2=str(player2_score),
			number_ball_touch_player1=str(n_ball_touch_player1),
			number_ball_touch_player2=str(n_ball_touch_player2),
			winner=str(winner),
			reason=reason_end,
			tournamentId=str(tournamentId)
	)

	obj.save()

	player1Model = User.objects.get(id=int(player1_id))
	player2Model = User.objects.get(id=int(player2_id))

	player1Model.Pong_BallHit += n_ball_touch_player1
	player1Model.Pong_Point += player1_score
	player1Model.Pong_PointTaken += player2_score
	player1Model.Pong_Game += 1
	player1Model.Pong_BallHitByOpponent += n_ball_touch_player2

	player2Model.Pong_BallHit += n_ball_touch_player2
	player2Model.Pong_Point += player2_score
	player2Model.Pong_PointTaken += player1_score
	player2Model.Pong_Game += 1
	player2Model.Pong_BallHitByOpponent += n_ball_touch_player1

	if str(winner) == str(player1_id):
		player1Model.Pong_Win += 1
		player2Model.Pong_Lose += 1
	else:
		player2Model.Pong_Win += 1
		player1Model.Pong_Lose += 1

	player1Model.save()
	player2Model.save()

	print('pongGame between playerId =', str(player1_id), 'and playerId =', str(player2_id), 'is win by', str(winner), 'tournamentId =', tournamentId, 'and reason is', reason_end)
