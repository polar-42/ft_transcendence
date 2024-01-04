import random, copy, json
from enum import IntEnum
from channels.layers import get_channel_layer
import random
from asgiref.sync import async_to_sync
import math

class GameState(IntEnum):
	Creation = -1
	Initialisation = 0
	Playing = 1
	Ended = 2

class TreeMatch():

	def __init__(self, creationStep, id):
		self.User1 = None
		self.User2 = None
		self.step = creationStep
		self.State = GameState.Creation
		self.Winner = None
		self.id = id
	
	def to_json(self):
		return {
			'User1' : self.User1.username if self.User1 is not None else "undefined",
			'User1Id' : self.User1.id if self.User1 is not None else -1,
			'User2' : self.User2.username if self.User2 is not None else "undefined",
			'User2Id' : self.User2.id if self.User2 is not None else -1,
			'step' : self.step,
			'state' : self.State,
			'Winner' : self.Winner.id if self.Winner is not None else -1
		}

class TypeGame(IntEnum):
	Undefined = 0
	Pong = 1
	Battleship = 2

class Tournament():
	def __init__(self, id, creator, typeGame : TypeGame, numberOfPlayer : int, privateGame : bool, description : str, name: str):
		self.status = GameState.Creation
		self._id = id
		self._creator = creator
		self._typeGame = typeGame
		self._playerAmount = numberOfPlayer
		self._private = privateGame
		self._desc = description
		self._name = name
		self._players = []
		self.curMatch = []
		self.channel_layer = get_channel_layer()
		self.channel_name = "Tournaments" + str(self._id)
		self.curStep = 0
		self.Tree = self.initArray()
		self.Winner = None

	def initArray(self):
		count = self._playerAmount
		PlayerPos = 1
		Tree = []
		while (count > 1):
			PlayerPosArray = []
			PlayerPos2 = 0
			while (PlayerPos2 < count / 2):
				PlayerPosArray.append(TreeMatch(PlayerPos, "Tournament" + str(self._id) + "_" + str(PlayerPos) + "_" + str(PlayerPos2)))
				PlayerPos2 += 1
			PlayerPos += 1
			Tree.append(PlayerPosArray)
			count /= 2
		return Tree

	def __str__(self) -> str:
		return "id is " + str(self._id) + " name = " + str(self._typeGame) + " private = " + str(self._private) + " game : " + self._name + " created by " + self._creator.username + " with " + str(self._playerAmount) + " players. desc = " + self._desc

	def sendData(self, user):
		async_to_sync(self.channel_layer.group_send)(
			self.channel_name,
			{
				'type': 'MSG_NewUser',
				'User' : -1 if user is None else user.id
			})
		self.SendMatchsData(-1)

	def UpdateData(self, MatchId, Winner):
		pos = 0
		while pos < len(self.Tree):
			pos2 = 0
			while pos2 < len(self.Tree[pos]):
				if self.Tree[pos][pos2].id == MatchId:
					self.Tree[pos][pos2].State = GameState.Ended
					self.Tree[pos][pos2].Winner = Winner
					if (pos == len(self.Tree) - 1):
						self.status = GameState.Ended
						async_to_sync(self.channel_layer.group_send)(
							self.channel_name,
							{
								'type': 'MSG_EndTournament',
								'Winner' : self.Tree[pos][pos2].Winner.username
							})
						return
					curMatch = None
					curPlayer = -1
					if (pos2 % 2 != 0):
						curMatch = self.Tree[pos + 1][int((pos2 / 2) - 0.5)]
						curPlayer = 2
					else:
						curMatch = self.Tree[pos + 1][int(pos2 / 2)]
						curPlayer = 1
					if (curMatch is None):
						return
					elif curMatch.State == GameState.Creation:
						curMatch.State = GameState.Initialisation
					if (curPlayer == 1):
						curMatch.User1 = self.Tree[pos][pos2].Winner
					else:
						curMatch.User2 = self.Tree[pos][pos2].Winner
					self.SendMatchsData(-1)
					if (curMatch.User1 is not None and curMatch.User2 is not None):
						self.StartMatch(curMatch)
					return
				pos2 += 1
			pos += 1

	def getTournament(self):
		return self

	def IsUserPresent(self, user):
		for users in self._players:
			if users.id == user:
				return True
		if user == self._creator.id:
			return True
		return False

	def IsTournamentExist(self, tournamentId):
		if int(self._id) is int(tournamentId):
			return True
		return False

	def addPlayer(self, player):
		if player not in self._players:
			self._players.append(player)
			print("Tournaments" + str(self._id))
			async_to_sync(self.channel_layer.group_send)(
				self.channel_name,
				{
					'type': 'MSG_NewUser',
					'User' : -1
				})
			if len(self._players) == self._playerAmount:
				self.init()
		return True

	def SendMatchsData(self, users):
		tree = []
		for subTree in self.Tree:
			for match in subTree:
				tree.append(match)
		async_to_sync(self.channel_layer.group_send)(
			self.channel_name,
			{
				'type': 'MSG_Match',
				'matchList' : [match.to_json() for match in tree],
				'User' : users
			})

	def StartMatch(self, Match):
		if (Match.State is not GameState.Initialisation):
			return
		print("Tournament Match Users are " + Match.User1.username + ", " + Match.User2.username)
		async_to_sync(self.channel_layer.group_send)(
			self.channel_name,
			{
				'type': 'MSG_LaunchGame',
				'gameType' : self._typeGame,
				'gameId': Match.id,
				'Player1': Match.User1.id,
				'Player2': Match.User2.id,
				'tournamentId' : self._id
		})
		Match.State = GameState.Playing

	def init(self):
		random.shuffle(self._players)
		PlayerPos = 0
		TreePos = 0
		while (TreePos < len(self.Tree[0])):
			self.Tree[0][TreePos].State = GameState.Initialisation
			self.Tree[0][TreePos].User1 = self._players[PlayerPos]
			self.Tree[0][TreePos].User2 = self._players[PlayerPos + 1]
			TreePos += 1
			PlayerPos += 2
		self.SendMatchsData(-1)
		self.status = GameState.Playing
		for match in self.Tree[0]:
			self.StartMatch(match)

