from enum import IntEnum

class GameState(IntEnum):
	RequestBoat = -1
	Initialisation = 0
	BoatPlacement = 1
	Playing = 2
	RequestHit = 4
	Ending = 3

class ConnexionState(IntEnum):
	NeverConnected = 0
	Connected = 1
	Disconnected = 2

class GameType(IntEnum):
	Normal = 0
	Tournament = 1

class GameEndReason(IntEnum):
	Disconnected = 0
	GiveUp = 1
	Win = 2