from enum import IntEnum

class connexionStatus(IntEnum):
	Disconnected = 0
	Busy = 1
	Connected = 2

class channelPrivacy(IntEnum):
	Public = 0
	Private = 1
