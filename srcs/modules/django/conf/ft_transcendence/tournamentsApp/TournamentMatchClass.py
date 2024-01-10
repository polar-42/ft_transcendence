from battleshipApp import ColorPrint

from .EnumClass import GameType, GameState
from .TournamentUser import TournamentUser

class TournamentMatch():

    def __init__(self, gameType : GameType, gameId : int, tournamentId):
        self.TournamentId = tournamentId
        self.GameId = gameId
        self.Users = [None, None]
        self.UserReadyState = [False, False]
        self.Type = gameType
        self.Winner = None
        self.Status = GameState.Created
        self.Timer = -1

    def AddUser(self, user : TournamentUser, position : int):
        if (self.Users[position] is not None):
            ColorPrint.prYellow("Warning! Tournament[{TId}].Match[{gameId}] : Can't add user {username}, match position \"{Mposition}\" is full.".format(TId=self.TournamentId, gameId=self.GameId, username=user.Username, Mposition=position))
            return False
        if (user in self.Users):
            ColorPrint.prYellow("Warning! Tournament[{TId}].Match[{gameId}] : Can't add user {username}, already in match.".format(TId=self.TournamentId, gameId=self.GameId, username=user.Username))
            return False
        self.Users[position] = user
        if (self.Users[0] is not None and self.Users[1] is not None):
            self.Timer = 30
            self.Status = GameState.Waiting
        return True

    def ChangeReadyState(self, user : TournamentUser):
        if (user not in self.Users):
            ColorPrint.prRed("Error! Tournament[{TId}].Match[{gameId}] : Can't change user {username} readyState, not in match.".format(TId=self.TournamentId, gameId=self.GameId, username=user.Username))
            return False
        UserPos = 0 if user is self.Users[0] else 1
        self.UserReadyState[UserPos] = True if self.UserReadyState[UserPos] is False else False
        if (self.UserReadyState[0] is True and self.UserReadyState[1] is True):
            self.Start()
        return True

    def Start(self):
        ColorPrint.prYellow("Debug! Tournament[{TId}].Match[{gameId}] : starting.".format(TId=self.TournamentId, gameId=self.GameId))
        self.Status = GameState.OnGoing

    def UpdateTimer(self):
        if (self.Status is not GameState.Waiting):
            return
        self.Timer -= 1
        if (self.Timer == 0):
            if (self.UserReadyState[0] == False and self.UserReadyState[1] == False):
                self.Status = GameState.cancelled
                ColorPrint.prGreen("Debug! Tournament[{TId}].Match[{gameId}] : Cancelled.".format(TId=self.TournamentId, gameId=self.GameId))
            else:
                self.Status = GameState.Ended
                if (self.UserReadyState[0] == False):
                    self.Winner = self.Users[1]
                else:
                    self.Winner = self.Users[0]
                ColorPrint.prGreen("Debug! Tournament[{TId}].Match[{gameId}] : Ended with {username} as winner.".format(TId=self.TournamentId, gameId=self.GameId, username=self.Winner.Username))

    def __str__(self):
        return "Tournament[{tID}].Match[{matchId}] = Users[0] = {User1}, Users[1] = {User2}".format(tID=self.TournamentId, matchId=self.GameId, User1=self.Users[0].Username, User2=self.Users[1].Username)