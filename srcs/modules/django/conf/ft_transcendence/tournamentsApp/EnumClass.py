from enum import IntEnum

class TournamentState(IntEnum):
    Created = 0
    Ongoing = 1
    Ended = 2

class GameType(IntEnum):
    Pong = 0
    Battleship = 1

class UserPosition(IntEnum):
    Away = 0
    InMatch = 1
    InTournament = 2

class UserState(IntEnum):
    Waiting = 0
    Alive = 1
    Dead = 2

class TournamentVisibility(IntEnum):
    Public = 0
    Private = 1

class GameState(IntEnum):
    Created = 0
    Waiting = 1
    OnGoing = 2
    Ended = 3
    cancelled = 4