import random, copy, json
from enum import IntEnum
from channels.layers import get_channel_layer
import random
from asgiref.sync import async_to_sync


class GameState(IntEnum):
	Initialisation = 0
	Playing = 1
	Ended = 2

class TreeMatch():

	def __init__(self, User1, User2, creationStep):
		self.User1 = User1
		self.User2 = User2
		self.step = creationStep
		self.State = GameState.Initialisation
		self.Winner = None
	
	def to_json(self):
		return {
			'User1' : self.User1.username,
			'User2' : self.User2.username,
			'step' : self.step,
			'state' : self.State,
			'Winner' : self.Winner.id if self.Winner is not None else None
		}

class TypeGame(IntEnum):
	Undefined = 0
	Pong = 1
	Battleship = 2

class Tournament():
	def __init__(self, id, creator, typeGame : TypeGame, numberOfPlayer : int, privateGame : bool, description : str, name: str):
		self._id = id
		self._creator = creator
		self._typeGame = typeGame
		self._playerAmount = numberOfPlayer
		self._private = privateGame
		self._desc = description
		self._name = name
		self._players = []
		self.channel_layer = get_channel_layer()
		self.channel_name = "Tournaments" + str(self._id)
	def __str__(self) -> str:
		return "id is " + str(self._id) + " name = " + str(self._typeGame) + " private = " + str(self._private) + " game : " + self._name + " created by " + self._creator.username + " with " + str(self._playerAmount) + " players. desc = " + self._desc

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

		# print(player, type(player), str(player), self._players)

		if player not in self._players:
			self._players.append(player)
			print("Tournaments" + str(self._id))
			async_to_sync(self.channel_layer.group_send)(
				self.channel_name,
				{
					'type': 'MSG_NewUser'
				})
			if len(self._players) == self._playerAmount:
				self.init()
			return True
		return False

	def init(self):
		self.curStep = 1
		self.AlivePlayer = self._players.copy()
		random.shuffle(self.AlivePlayer)
		pos = 0
		self.curMatch = []
		while (pos + 1 < len(self.AlivePlayer)):
			self.curMatch.append(TreeMatch(self.AlivePlayer[pos], self.AlivePlayer[pos + 1], 1))
			# self.curMatch.append({
				# 'User1': self.AlivePlayer[pos].username,
				# 'User2' : self.AlivePlayer[pos + 1].username,
				# 'step' : 
				# })
			print(type(self.curMatch[0].State))
			pos += 2
		match2 = self.curMatch.copy()
		async_to_sync(self.channel_layer.group_send)(
			self.channel_name,
			{
				'type': 'MSG_Match',
				'step' : self.curStep,
				'matchList' : [match.to_json() for match in match2]
			})
		print("TOTO1")
		print(GameState.Initialisation)
		print(type(GameState.Initialisation))
		for match in self.curMatch:
			print((match.State))
			if match.State is GameState.Initialisation:
				print("TOTO2")
				async_to_sync(self.channel_layer.group_send)(
					self.channel_name,
					{
						'type': 'MSG_LaunchGame',
						'gameType' : self._typeGame,
						'gameId': "Tournament" + str(self._id) + "_" + str(match.User1.id) + "_" + str(match.User2.id),
						'Player1': match.User1.id,
						'Player2': match.User2.id,
						'tournamentId' : self._id
				})
	# def start(self, playersSockets):
	# 	self.playersSockets = playersSockets
	# 	print(self._name, 'is starting')
	# 	playersSocketsCpy = copy.copy(self.playersSockets)
	# 	self.matchs = []

	# 	#LOOP TO MAKE MATCHS BETWEEN PLAYERS
	# 	while len(playersSocketsCpy) >= 2:
	# 		random.shuffle(playersSocketsCpy)
	# 		match = []
	# 		match.append(playersSocketsCpy[0])
	# 		playersSocketsCpy.remove(playersSocketsCpy[0])
	# 		match.append(playersSocketsCpy[0])
	# 		playersSocketsCpy.remove(playersSocketsCpy[0])
	# 		self.matchs.append(match)

	# 	for match in self.matchs:
	# 		match[0].send(text_data=json.dumps({
	# 			'type': 'match_id',
	# 			'match_id': "Tournament" + str(self._id) + "_" + str(match[0].username) + "_" + str(match[1].username),
	# 			'player1': match[0].username,
	# 			'player2': match[1].username,
	# 			'game': self._typeGame,
	# 		}))
	# 		match[1].send(text_data=json.dumps({
	# 			'type': 'match_id',
	# 			'match_id': "Tournament" + str(self._id) + "_" + str(match[0].username) + "_" + str(match[1].username),
	# 			'player1': match[0].username,
	# 			'player2': match[1].username,
	# 			'game': self._typeGame,
	# 		}))

