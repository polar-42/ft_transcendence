from battleshipApp import ColorPrint
from .EnumClass import GameType, GameState, UserPosition
from .TournamentUser import TournamentUser
import json
from pongGameApp.Remote.pongGameManager import Manager

class TournamentMatch():

    def __init__(self, gameType : GameType, gameId : int, tournamentId, tournamentObj):
        self.Tournament = tournamentObj
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
        target = 0 if position == 1 else 0
        if (self.Users[position] is self.Tournament.UndefinedUser and self.Users[target] is self.Tournament.UndefinedUser):
            self.HandleResult(None, True)
            return True
        elif (self.Users[target] is self.Tournament.UndefinedUser):
            self.HandleResult(self.Users[position].UserId, True)
            return True
        elif (self.Users[position] is self.Tournament.UndefinedUser):
            self.HandleResult(self.Users[target].UserId, True)
            return True
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
        if (self.Type is GameType.Battleship):
            from battleshipApp import BattleshipGameManager, BattleshipMatch
            BattleshipGameManager.GameManager.CreateGame(BattleshipGameManager.GameManager, self.Users[0].SockUser, self.Users[1].SockUser, self.GameId, BattleshipMatch.GameType.Tournament, self)
            msg = json.dumps({
			'type': "MSG_LoadGame",
			'gameType': 'ship',
            'gameId' : self.GameId
			})
            self.Users[0].SendMessage(msg)
            self.Users[1].SendMessage(msg)
        else:
            Manager.createGame(self.Users[0].SockUser, self.Users[1].SockUser, self.GameId, self)
            msg = json.dumps({
                'type': "MSG_LoadGame",
                'gameType': 'pong',
                'gameId' : self.GameId
            })
            self.Users[0].SendMessage(msg)
            self.Users[1].SendMessage(msg)
            pass
        self.Users[0].Position = UserPosition.InMatch
        self.Users[1].Position = UserPosition.InMatch
        self.Status = GameState.OnGoing

    def UpdateTimer(self):
        if (self.Status is not GameState.Waiting):
            return
        self.Timer -= 1
        if (self.Timer == 0):
            if (self.UserReadyState[0] == False and self.UserReadyState[1] == False):
                self.Status = GameState.Cancelled
                ColorPrint.prGreen("Debug! Tournament[{TId}].Match[{gameId}] : Cancelled.".format(TId=self.TournamentId, gameId=self.GameId))
            else:
                self.Status = GameState.Ended
                if (self.UserReadyState[0] == False):
                    self.Winner = self.Users[1]
                else:
                    self.Winner = self.Users[0]
                ColorPrint.prGreen("Debug! Tournament[{TId}].Match[{gameId}] : Ended with {username} as winner.".format(TId=self.TournamentId, gameId=self.GameId, username=self.Winner.Username))

    def __str__(self):
        return "Tournament[{tID}].Match[{matchId}] = Users[0] = {User1}, Users[1] = {User2}".format(tID=self.TournamentId, matchId=self.GameId, User1=self.Users[0].Username if self.Users[0] is not None else None, User2=self.Users[1].Username if self.Users[1] is not None else None)

    def HandleResult(self, Winner, Forced = False):
        if (Winner is None):
            self.Status = GameState.Cancelled
            self.Winner = self.Tournament.UndefinedUser
            self.Tournament.HandleMatchResult(self)
            return
        else:
            self.Status = GameState.Ended
            self.Winner = self.Users[0] if Winner is self.Users[0].UserId else self.Users[1]
        if self.Users[0].UserId != -1 and Forced is not True:
            self.Users[0].Position = UserPosition.Away
        if self.Users[1].UserId != -1 and Forced is not True:
            self.Users[1].Position = UserPosition.Away
        self.Tournament.HandleMatchResult(self)

    def Objectify(self, x, y):
        if (self.Status is GameState.Cancelled):
            WinnerUsr = -2
        elif (self.Status is GameState.Ended):
            WinnerUsr = 0 if self.Winner is self.Users[0] else 1
        else:
            WinnerUsr = -1
        return {'MatchId' : self.GameId, 'User1' : self.Users[0].Username if self.Users[0] is not None else 'Undefined', 'User2' : self.Users[1].Username if self.Users[1] is not None else 'Undefined', 'Winner' : WinnerUsr, 'X' : x, 'Y' : y}
