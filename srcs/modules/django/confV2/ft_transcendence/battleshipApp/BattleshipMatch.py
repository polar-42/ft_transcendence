
class BattleShipGameManager():
    _MatchList = {}

    def JoinGame(self, gameId, user):
        if (gameId not in self._MatchList.keys()):
            self._MatchList[gameId] = BattleshipMatch(user, gameId)
        else:
            self._MatchList[gameId].joinGame(user)

class BattleshipMatch():

    def __init__(self, user, gameId):
        self.JoinGame(user)
        self.gameId = gameId
        pass

    def JoinGame(self, user):
        if self.user1 is not None and self.user1 is not user:
            self.user2 = user
        elif self.user1 is None:
            self.user1 = user

    def initGame():
        pass