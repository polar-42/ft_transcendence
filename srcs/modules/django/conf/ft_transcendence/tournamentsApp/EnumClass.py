from enum import IntEnum

class TournamentState(IntEnum):
    Created = 0
    Ongoing = 1
    Ended = 2

class GameType(IntEnum):
    Pong = 0
    Battleship = 1

class UserState(IntEnum):
    Waiting = 0
    Alive = 1
    Dead = 2

class TournamentVisibility(IntEnum):
    Public = 0
    Private = 1
