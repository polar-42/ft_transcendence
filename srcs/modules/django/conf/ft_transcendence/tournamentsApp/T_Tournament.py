from ft_transcendence import ColorPrint
from .models import TournamentsModels
from .T_User import TournamentUser
from .T_Enum import GameType, TournamentState, TournamentVisibility, UserPosition, GameState, UserState
from .T_Match import TournamentMatch

import json, math, random

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
		random.shuffle(UsersList)
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
						Target = 0 if Match2.Winner is [Match2.Users[1]] else 1
						if Match2.Users[Target] is not self.UndefinedUser:
							Match2.Users[Target].Status = UserState.Dead
						ColorPrint.prGreen("Debug ! Winner = ".format(Match2.Winner.Username))
						self.SendMatch(None)
						return
					else:
						self.Winner = self.Tree[len(self.Tree) - 1][0].Winner
						if (self.Winner is self.UndefinedUser):
							self.Status = TournamentState.Cancelled
							self.obj.delete()
							from .T_Manager import Manager
							Manager.closeTournament(self)
							pass
						else :
							ColorPrint.prGreen("Debug ! Tournament[{tID}] ended. User {username} win".format(tID=self.TournamentId, username=self.Winner.Username))
							self.CloseTimer = 10
							self.Status = TournamentState.Ended
							self.sendTournamentDB()
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
		#self.addToBlockchain()

	def addToBlockchain(self):
		from web3 import Web3
		import os

		w3 = Web3(Web3.HTTPProvider('http://' + os.environ.get('IP_NODE') + ':8545'))
		file = open('/var/blockchain/TranscendenceTournamentHistory.json')
		jsonFile = json.load(file)
		abi = jsonFile['abi']

		contract_address = os.environ.get('CONTRACT_ADDRESS')
		contract = w3.eth.contract(address=contract_address, abi=abi)
		tx = contract.functions.addVictory(str(self.Winner.UserId)).build_transaction({
			'from': os.environ.get('PUBLIC_KEY'),
			'nonce': w3.eth.get_transaction_count(os.environ.get('PUBLIC_KEY'))
		})
		sign_tx = w3.eth.account.sign_transaction(tx, '0x' + os.environ.get('PRIVATE_KEY'))
		tx_hash = w3.eth.send_raw_transaction(sign_tx.rawTransaction)
		w3.eth.wait_for_transaction_receipt(tx_hash)

		print("User", str(self.Winner.Username), "has won", contract.functions.getNumberVictoryPlayer(str(self.Winner.UserId)).call(), 'tournaments')

	def GetMatchList(self):
		SendList = []
		PosX = 0
		if (self.Tree is None):
			return None
		for Match in self.Tree:
			PosY = 0
			for Match2 in Match:
				Jsoned = Match2.Objectify(PosX + 1, PosY)
				SendList.append(Jsoned)
		return SendList

	def	SendMatch(self, Usered):
		if (self.Tree is None):
			return
		msg = json.dumps({
			'type' : 'MSG_UpdateMatchList',
			'matchList' : self.GetMatchList()
		})
		if (Usered is not None):
			Usered.SendMessage(msg)
			return
		for User in self.PlayersList:
			User.SendMessage(msg)

	def GetUsersList(self):
		pos = 0
		SendList = []
		for User in self.PlayersList:
			SendList.append(User.Username)
			pos += 1
		return SendList

	def SendUsers(self, Usered):
		msg = json.dumps({
			'type' : 'MSG_UpdateUserList',
			'usrList' : self.GetUsersList()
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
		if self.Status is not TournamentState.Created:
			return False
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
			if (user.Position is not UserPosition.InMatch):
				user.Status = UserState.GivedUp
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
		if usr.Status is UserState.Dead:
			usr.Socket.close()
			return True
		ColorPrint.prGreen("Debug! Tournament {tournamentId} : User {username} going away.".format(tournamentId=self.TournamentId, username=usr.Username))
		usr.Position = UserPosition.Away
		return True

#endregion

	def UpdateMatchsTimer(self):
		if (self.Tree is None):
			return
		if self.Status is TournamentState.Ended:
			self.CloseTimer -= 1
			if self.CloseTimer <= 0:
				from .T_Manager import Manager
				Manager.closeTournament(self)
		for Match in self.Tree:
			for Match2 in Match:
				Match2.UpdateTimer()
