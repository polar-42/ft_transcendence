from battleshipApp import ColorPrint
from .models import TournamentsModels
from .TournamentUser import TournamentUser
from .EnumClass import GameType, TournamentState, TournamentVisibility, UserPosition, GameState
from .TournamentMatchClass import TournamentMatch
import json, math, os

class Tournament():

	def __init__(self, tournamentId : str, creator : int, tournamentName : str, playerAmount : int, description : str, gameType : GameType, visibility : TournamentVisibility, obj):
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
		self.UndefinedUser = TournamentUser(None, None, 'Undefined', -1)
		self.obj = obj

	def StartTournament(self):
		self.Tree = self.CreateMatchArray()
		self.Status = TournamentState.Ongoing

		UsersList = self.PlayersList.copy()

		UserCounter = 0

		for Match in self.Tree[0]:
			Match.AddUser(UsersList[UserCounter], 0)
			ColorPrint.prGreen("Debug! Status = {status}.".format(status=Match.Status))
			Match.AddUser(UsersList[UserCounter + 1], 1)
			UserCounter += 2
			ColorPrint.prGreen("Debug! {match} ".format(match=str(Match)))
		self.SendMatch(None)

	def CreateMatchArray(self):
		Root = []
		Pos1 = 1
		Counter = self.PlayerAmount
		while (Counter > 1):
			Branch = []
			Pos2 = 0
			ColorPrint.prYellow("Debug! Counter = {counter}.".format(counter=Counter))
			while (Pos2 < math.floor(Counter / 2)):
				Branch.append(TournamentMatch(self.Type, "Tournament" + str(self.TournamentId) + "_" + str(Pos1) + "_" + str(Pos2), self.TournamentId, self))
				Pos2 += 1
			Pos1 += 1
			Root.append(Branch)
			Counter = math.floor(Counter / 2)
		return Root

	def HandleMatchResult(self, MatchObj):
		Pos1 = 0
		StepCount = len(self.Tree)
		for Match in self.Tree:
			Pos2 = 0
			for Match2 in Match:
				if (Match2 is MatchObj):
					if (Pos1 + 1 < StepCount):
						PlayerPos = 0 if (Pos2 / 2) % 2 == 0 else 1
						if (PlayerPos == 0):
							self.Tree[Pos1 + 1][int(Pos2 / 2)].AddUser(Match2.Winner, PlayerPos)
						else:
							self.Tree[Pos1 + 1][int((Pos2 / 2) - 0.5)].AddUser(Match2.Winner, PlayerPos)
						ColorPrint.prGreen("Debug ! Winner = ".format(Match2.Winner.Username))
						self.SendMatch(None)
						return
					else:
						self.Winner = self.Tree[len(self.Tree) - 1][0].Winner
						ColorPrint.prGreen("Debug ! Tournament[{tID}] ended. User {username} win".format(tID=self.TournamentId, username=self.Winner.Username))
						self.Status = TournamentState.Ended

						self.sendTournamentDB() # TODO Save in DB

						self.SendMatch(None)
						return
				Pos2 += 1
			Pos1 += 1

	def sendTournamentDB(self):
		tabId = []
		for usr in self.PlayersList:
			tabId.append(usr.UserId)

		self.obj.playersId = tabId
		self.obj.winner = self.Winner.UserId
		self.obj.save

		print('Tournament', self.obj.tournamentsName, ', id =', self.obj.id, ', winnerid =', self.obj.winner, 'is add to DB')


		#ADD TO BLOCKCHAIN
		from web3 import Web3

		provider = Web3(Web3.HTTPProvider('http://172.29.0.3:8545')) #ADDRESS
		file = open('PATHTOJSONABI')
		jsonFile = json.load(file)
		abi = jsonFile['abi']

		contract_address = os.environ.get('CONTRACT_ADDRESS')
		contract = provider.eth.contract(address=contract_address, abi=abi)
		tx = contract.functions.addPlayer(str(self.obj.id)).buildTransaction({
			'from': os.environ.get('PUBLIC_KEY')
		})
		provider.eth.account.sign_transaction(tx, os.environ.get('PRIVATE_KEY'))
		#ADD TO BLOCKCHAIN

		pass

	def	SendMatch(self, Usered):
		SendList = []
		PosX = 0
		if (self.Tree is None):
			return
		for Match in self.Tree:
			PosY = 0
			for Match2 in Match:
				Jsoned = Match2.Objectify(PosX + 1, PosY)
				SendList.append(Jsoned)
		msg = json.dumps({
			'type' : 'MSG_UpdateMatchList',
			'matchList' : SendList
		})
		if (Usered is not None):
			Usered.SendMessage(msg)
			return
		for User in self.PlayersList:
			User.SendMessage(msg)

	def SendUsers(self, Usered):
		pos = 0
		SendList = []
		for User in self.PlayersList:
			SendList.append(User.Username)
			pos += 1
		msg = json.dumps({
			'type' : 'MSG_UpdateUserList',
			'usrList' : SendList
		})
		if (Usered is not None):
			Usered.SendMessage(msg)
			return
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
		self.SendUsers(user)
		self.SendMatch(user)
		ColorPrint.prGreen("Tournament {tournamentId} : User {username} reconnected.".format(tournamentId=self.TournamentId, username=user.Username))

	def CreateUser(self, user, socket):
		if (len(self.PlayersList) == self.PlayerAmount):
			return False
		usr = TournamentUser(socket, user, user.username, user.id)
		if (usr.UserId == self.Administrator):
			self.Administrator = usr
		self.PlayersList.append(usr)
		ColorPrint.prGreen("Tournament {tournamentId} : User {username} Created.".format(tournamentId=self.TournamentId, username=user.username))
		self.SendUsers(None)
		if (len(self.PlayersList) == self.PlayerAmount):
			self.StartTournament()
		return True

	def DisconnectUser(self, user):
		if self.Status is TournamentState.Created:
			self.PlayersList.remove(user)
			ColorPrint.prGreen("Tournament {tournamentId} : User {username} deleted.".format(tournamentId=self.TournamentId, username=user.Username))
			self.SendUsers(None)
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
			return True
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

