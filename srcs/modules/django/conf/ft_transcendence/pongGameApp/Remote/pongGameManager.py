from .pongThreads import pongGame

class PongGameManager():
	_matchList = {}

	def joinGame(self, gameId, user, socket):
		if gameId not in self._matchList.keys():
			print("ERROR, user", user.username, "try to join an non existing game", gameId)
			return None
		print('User =', user.username, ' and socket =', socket)
		self._matchList[gameId].connectUser(user, socket)
		return self._matchList[gameId]

	def leaveGame(self, gameId, user):
		if gameId not in self._matchList.keys():
			return
		self._matchList[gameId].disconnectUser(user)

	def closeGame(self, gameId):
		if gameId not in self._matchList.keys():
			return
		self._matchList.pop(gameId)

	def createGame(self, user1, user2, gameId, gameType, _id):
		if _id not in self._matchList.keys():
			self._matchList[gameId] = pongGame(user1, user2, gameId, _id)
			print('PongGame', gameId, 'is created')
			print('self._matchList[gameId] =', self._matchList[gameId])
		else:
			print('Error! Trying to create a game with duplicate id :', gameId)

Manager = PongGameManager()
