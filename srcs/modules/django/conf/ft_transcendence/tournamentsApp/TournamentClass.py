from battleshipApp import ColorPrint

from .TournamentUser import TournamentUser
from .EnumClass import GameType, TournamentState, TournamentVisibility, UserPosition, GameState
from .TournamentMatchClass import TournamentMatch

import json
# class TreeMatch():

# 	def __init__(self, creationStep, id):
# 		self.User1 = None
# 		self.User2 = None
# 		self.step = creationStep
# 		self.State = GameState.Creation
# 		self.Winner = None
# 		self.id = id

# 	def to_json(self):
# 		return {
# 			'User1' : self.User1.sock_user.username if self.User1 is not None else "undefined",
# 			'User1Id' : self.User1.sock_user.id if self.User1 is not None else -1,
# 			'User2' : self.User2.sock_user.username if self.User2 is not None else "undefined",
# 			'User2Id' : self.User2.sock_user.id if self.User2 is not None else -1,
# 			'step' : self.step,
# 			'state' : self.State,
# 			'Winner' : self.Winner.sock_user.id if self.Winner is not None else -1
# 		}

# class TypeGame(IntEnum):
# 	Undefined = 0
# 	Pong = 1
# 	Battleship = 2

class Tournament():

	def __init__(self, tournamentId : str, creator : int, tournamentName : str, playerAmount : int, description : str, gameType : GameType, visibility : TournamentVisibility):
		self.TournamentName = tournamentName
		self.TournamentId = tournamentId
		self.PlayerAmount = playerAmount
		self.Description = description
		self.Type = gameType
		self.Administrator = creator
		self.Visibility = visibility
		self.Status = TournamentState.Created
		self.PlayersList = []
		self.Tree = None

	def StartTournament(self):
		self.Tree = self.CreateMatchArray()
		self.Status = TournamentState.Ongoing

		UsersList = self.PlayersList.copy()

		UserCounter = 0
		for Match in self.Tree[0]:
			Match.AddUser(UsersList[UserCounter], 0)
			Match.AddUser(UsersList[UserCounter +1], 1)
			UserCounter += 2
			ColorPrint.prGreen("Debug! {match} ".format(match=str(Match)))

	def CreateMatchArray(self):
		Root = []
		Pos1 = 1
		Counter = self.PlayerAmount
		while (Counter > 1):
			Branch = []
			Pos2 = 0
			while (Pos2 < Counter / 2):
				Branch.append(TournamentMatch(self.Type, "Tournament" + str(self.TournamentId) + "_" + str(Pos1) + "_" + str(Pos2), self.TournamentId))
				Pos2 += 1
			Pos1 += 1
			Root.append(Branch)
			Counter /= 2
		return Root

	def SendUsers(self):
		pos = 0
		SendList = []
		for User in self.PlayersList:
			SendList.append(User.Username)
			pos += 1
		msg = json.dumps({
			'type' : 'MSG_UpdateUserList',
			'usrList' : SendList
		})
		for User in self.PlayersList:
			User.SendMessage(msg)

	def ChangeReadyState(self, user):
		usr = self.GetUserById(user.id)
		if (usr is None):
			ColorPrint.prRed("Error! Tournament {tournamentId} : User {username} trying to change readyState when not on Tournament.".format(tournamentId=self.TournamentId, username=user.username))
			return False
		if (usr.Position is not UserPosition.InTournament):
			return False
		if (self.Tree is None):
			return
		for Match in self.Tree:
			for Match2 in Match:
				if (usr in Match2.Users and Match2.Status is GameState.Waiting):
					Match2.ChangeReadyState(usr)
		return True

#region Getter

	def GetUserById(self, userId : int):
		for usr in self.PlayersList:
			if (usr.UserId == userId):
				return usr
		return None

	def GetUserByName(self, userName : str):
		for usr in self.PlayersList:
			if (usr.Username == userName):
				return usr
		return None

#endregion

#region Connexion

	def ReconnectUser(self, user):
		user.Position = UserPosition.InTournament
		ColorPrint.prGreen("Tournament {tournamentId} : User {username} reconnected.".format(tournamentId=self.TournamentId, username=user.Username))

	def CreateUser(self, user, socket):
		if (len(self.PlayersList) == self.PlayerAmount):
			return False
		usr = TournamentUser(socket, user.username, user.id)
		if (usr.UserId == self.Administrator):
			self.Administrator = usr
		self.PlayersList.append(usr)
		ColorPrint.prGreen("Tournament {tournamentId} : User {username} Created.".format(tournamentId=self.TournamentId, username=user.username))
		self.SendUsers()
		if (len(self.PlayersList) == self.PlayerAmount):
			self.StartTournament()
		return True

	def DisconnectUser(self, user):
		if self.Status is TournamentState.Created:
			self.PlayersList.remove(user)
			ColorPrint.prGreen("Tournament {tournamentId} : User {username} deleted.".format(tournamentId=self.TournamentId, username=user.Username))
			self.SendUsers()
		elif self.Status is TournamentState.Ongoing:
			# GivingUp
			ColorPrint.prGreen("Tournament {tournamentId} : User {username} giveUp.".format(tournamentId=self.TournamentId, username=user.Username))
			pass
		else:
			pass
	
	def GoingAway(self, user):
		usr = self.GetUserById(user.id)
		if (usr is None):
			ColorPrint.prRed("Error! Tournament {tournamentId} : User {username} trying to goingAway when not on Tournament.".format(tournamentId=self.TournamentId, username=user.username))
			return False
		if (usr.Position is UserPosition.InMatch):
			return False
		ColorPrint.prGreen("Debug! Tournament {tournamentId} : User {username} going away.".format(tournamentId=self.TournamentId, username=usr.Username))
		usr.Position = UserPosition.Away
		return True
	
#endregion 

	def UpdateMatchsTimer(self):
		if (self.Tree is None):
			return 
		for Match in self.Tree:
			for Match2 in Match:
				Match2.UpdateTimer()

	# def __init__(self, id, creator, typeGame : TypeGame, numberOfPlayer : int, privateGame : bool, description : str, name: str):
		# self.status = GameState.Creation
		# self._id = id
		# self._creator = TournamentUser(creator, None)
		# self._typeGame = typeGame
		# self._playerAmount = numberOfPlayer
		# self._private = privateGame
		# self._desc = description
		# self._name = name
		# self._players = []
		# self.curMatch = []
		# self.channel_layer = get_channel_layer()
		# self.channel_name = "Tournaments" + str(self._id)
		# self.curStep = 0
		# self.Tree = self.initArray()
		# self.Winner = None

	# def __str__(self) -> str:
		# return "id is " + str(self._id) + " name = " + str(self._typeGame) + " private = " + str(self._private) + " game : " + self._name + " created by " + self._creator.sock_user.username + " with " + str(self._playerAmount) + " players. desc = " + self._desc

	# def sendData(self, user):
		# async_to_sync(self.channel_layer.group_send)(
			# self.channel_name,
			# {
				# 'type': 'MSG_NewUser',
				# 'User' : -1 if user is None else user.id
			# })
		# self.SendMatchsData(-1)

# 	def UpdateData(self, MatchId, Winner):
# 		pos = 0
# 		while pos < len(self.Tree):
# 			pos2 = 0
# 			while pos2 < len(self.Tree[pos]):
# 				if self.Tree[pos][pos2].id == MatchId:
# 					self.Tree[pos][pos2].State = GameState.Ended
# 					self.Tree[pos][pos2].Winner = self.GetUserById(Winner.id)
# 					if (pos == len(self.Tree) - 1):
# 						self.status = GameState.Ended
# 						self.WinnerMatch = self.Tree[pos][pos2]
# 						self.Winner = self.Tree[pos][pos2].Winner
# 						self.SendMatchsData(-1)
# 						return
# 					curMatch = None
# 					curPlayer = -1
# 					if (pos2 % 2 != 0):
# 						curMatch = self.Tree[pos + 1][int((pos2 / 2) - 0.5)]
# 						curPlayer = 2
# 					else:
# 						curMatch = self.Tree[pos + 1][int(pos2 / 2)]
# 						curPlayer = 1
# 					if (curMatch is None):
# 						return
# 					elif curMatch.State == GameState.Creation:
# 						curMatch.State = GameState.Initialisation
# 					if (curPlayer == 1):
# 						curMatch.User1 = self.Tree[pos][pos2].Winner
# 					else:
# 						curMatch.User2 = self.Tree[pos][pos2].Winner
# 					self.SendMatchsData(-1)
# 					if (curMatch.User1 is not None and curMatch.User2 is not None):
# 						self.StartMatch(curMatch)
# 					return
# 				pos2 += 1
# 			pos += 1

# 	def GetUserById(self, id):
# 		for usr in self._players:
# 			if (usr.sock_user.id == id):
# 				return usr
# 		return None

# 	def getTournament(self):
# 		return self

# 	def IsUserPresent(self, user):
# 		for users in self._players:
# 			if users.sock_user.id == user.id:
# 				return True
# 		if user == self._creator.sock_user.id:
# 			return True
# 		return False

# 	def IsTournamentExist(self, tournamentId):
# 		if int(self._id) is int(tournamentId):
# 			return True
# 		return False

# 	def addPlayer(self, player, socket):
# 		usr = self.getPlayerObject(player)
# 		if (usr == None):
# 			if (self._creator.sock_user.id == player.id):
# 				self._players.append(self._creator)
# 				self._creator.socket = socket
# 			else:
# 				self._players.append(TournamentUser(player, socket))
# 			print("Tournaments" + str(self._id))
# 			async_to_sync(self.channel_layer.group_send)(
# 				self.channel_name,
# 				{
# 					'type': 'MSG_NewUser',
# 					'User' : -1
# 				})
# 			if len(self._players) == self._playerAmount:
# 				self.init()
# 			return True
# 		elif (usr.ConnexionStatus is ConnexionState.Away):
# 			usr.ConnexionStatus = ConnexionState.OnTournament
# 		if self.status is GameState.Ended:
# 			if (self.WinnerMatch.User1.ConnexionStatus is ConnexionState.OnTournament and self.WinnerMatch.User2.ConnexionStatus is ConnexionState.OnTournament):
# 				async_to_sync(self.channel_layer.group_send)(
# 					self.channel_name,
# 					{
# 						'type': 'MSG_EndTournament',
# 						'Winner' : self.Winner.Name
# 					})
# 		return True

# 	def getPlayerObject(self, Player):
# 		if (self.IsUserPresent(Player) == False):
# 			return None
# 		else:
# 			for usr in self._players:
# 				if (usr.sock_user.id == Player.id):
# 					return usr

# 	def removePlayer(self, player):
# 		usr = self.getPlayerObject(player)
# 		if usr is not None:
# 			self._players.remove(usr)
# 			if (self.Winner is not None):
# 				return
# 			async_to_sync(self.channel_layer.group_send)(
# 				self.channel_name,
# 				{
# 					'type': 'MSG_NewUser',
# 					'User' : -1
# 				})

# 	def SendMatchsData(self, users):
# 		tree = []
# 		for subTree in self.Tree:
# 			for match in subTree:
# 				tree.append(match)
# 		async_to_sync(self.channel_layer.group_send)(
# 			self.channel_name,
# 			{
# 				'type': 'MSG_Match',
# 				'matchList' : [match.to_json() for match in tree],
# 				'User' : users
# 			})

# 	def StartMatch(self, Match):
# 		if (Match.State is not GameState.Initialisation):
# 			return
# 		if (self._typeGame is TypeGame.Battleship):
# 			from battleshipApp import BattleshipGameManager, BattleshipMatch
# 			BattleshipGameManager.GameManager.CreateGame(BattleshipGameManager.GameManager, Match.User1.sock_user, Match.User2.sock_user, Match.id, BattleshipMatch.GameType.Tournament, self._id)
# 		print("Tournament Match Users are " + Match.User1.sock_user.username + ", " + Match.User2.sock_user.username)
# 		async_to_sync(self.channel_layer.group_send)(
# 			self.channel_name,
# 			{
# 				'type': 'MSG_LaunchGame',
# 				'gameType' : self._typeGame,
# 				'gameId': Match.id,
# 				'Player1': Match.User1.sock_user.id,
# 				'Player2': Match.User2.sock_user.id,
# 				'tournamentId' : self._id
# 		})
# 		Match.State = GameState.Playing

# 	def init(self):
# 		self.status = GameState.Playing
# 		random.shuffle(self._players)
# 		PlayerPos = 0
# 		TreePos = 0
# 		while (TreePos < len(self.Tree[0])):
# 			self.Tree[0][TreePos].State = GameState.Initialisation
# 			self.Tree[0][TreePos].User1 = self._players[PlayerPos]
# 			self.Tree[0][TreePos].User2 = self._players[PlayerPos + 1]
# 			TreePos += 1
# 			PlayerPos += 2
# 		self.SendMatchsData(-1)
# 		for match in self.Tree[0]:
# 			self.StartMatch(match)

