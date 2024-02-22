from channels.layers import get_channel_layer
import random
from ft_transcendence import ColorPrint
import json

from .BS_Enum import GameState, ConnexionState, GameEndReason, GameType
from .BS_User import User
from .BS_Thread import GameLoop

class BattleshipMatch():

	currentTimer = -1

	thread = None
	TurnUser = None

	def __init__(self, gameId, user1, user2, GameManager, GameType, tournamentGame):
		self.gm = GameManager
		self.Gamestatus = GameState.Initialisation
		self.gameId = gameId
		self.channel_layer = get_channel_layer()
		self.Users = [User(user1), User(user2)]
		self.GameType = GameType
		self.TournamentGame = tournamentGame

	def getUser(self, user):
		if (user.id == self.Users[0].sock_user.id):
			return self.Users[0]
		elif user.id == self.Users[1].sock_user.id:
			return self.Users[1]
		return None

	def DisconnectUser(self, user):
		usr = self.getUser(user)
		if (usr is None):
			return
		usr.ConnexionStatus = ConnexionState.Disconnected
		self.GameEnd(self.GetUserId(usr), GameEndReason.Disconnected)

	def ConnectUser(self, user, socket):
		FindedUser = self.getUser(user)
		if (FindedUser is None):
			# ColorPrint.prRed("Error! GAME {gID}: User {username} are not in game.".format(gID=self.gameId, username= user.username))
			return False
		elif (FindedUser.ConnexionStatus != ConnexionState.NeverConnected):
			# ColorPrint.prYellow("Warning! GAME {gID}: User {username} already connected.".format(gID=self.gameId, username= user.username))
			return False
		else:
			FindedUser.ConnexionStatus = ConnexionState.Connected
			FindedUser.socket = socket
			# ColorPrint.prGreen("Debug! GAME {gID}: User {username} connected.".format(gID=self.gameId, username= user.username))
		if (self.Users[0].ConnexionStatus == ConnexionState.Connected and self.Users[1].ConnexionStatus == ConnexionState.Connected):
			if (self.Gamestatus == GameState.Initialisation):
				self.StartGame()
		return True

	def StartGame(self):
		self.Gamestatus = GameState.BoatPlacement
		# ColorPrint.prGreen("Debug! GAME {gID}: Starting.".format(gID=self.gameId))
		msg = json.dumps({
			'function': "initGame",
			'player_1': {
				'id': self.Users[0].Id,
				'name': self.Users[0].Name
				},
			'player_2': {
				'id': self.Users[1].Id,
				'name': self.Users[1].Name
				},
			'timer': 60
			})
		self.Users[0].SendMessage(msg)
		self.Users[1].SendMessage(msg)
		self.currentTimer = 60
		self.thread = GameLoop(self)
		self.thread.start()

	def RCV_BoatsList(self, user, BoatList):
		if (self.Gamestatus is not GameState.RequestBoat and self.Gamestatus is not GameState.BoatPlacement):
			return
		usr = self.getUser(user)
		if (usr is None):
			# ColorPrint.prRed("Error! Game {gId} : User {uName} is not player.".format(gId=self.gameId, uName=user.username))
			return
		if (usr.ParseBoats(BoatList) == False):
			usr.BoatList.clear()
			return
		usr1 = len(self.Users[0].BoatList)
		usr2 = len(self.Users[1].BoatList)
		# if (len(usr.BoatList) > 0):
			# ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} ready.".format(gId=self.gameId, uName=usr.Name))
		# else:
			# ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} not ready.".format(gId=self.gameId, uName=usr.Name))
		if (usr1 > 0 and usr1 == usr2):
			self.StartSecondPart()

	def StartSecondPart(self):
		# ColorPrint.prGreen("DEBUG! Game {gId} : Game second part starting.".format(gId=self.gameId))
		self.Gamestatus = GameState.Playing
		self.currentTimer = -1
		msg = json.dumps({
			'function': "StartGame",
			'timer': -1
			})
		self.Users[0].SendMessage(msg)
		self.Users[1].SendMessage(msg)
		usr = random.randint(1,2)
		self.TurnUser = self.Users[usr - 1]
		self.ChangeTurn()

	def ChangeTurn(self):
		if (self.Gamestatus is not GameState.Playing):
			self.Gamestatus = GameState.Playing
		self.currentTimer = 30
		newUsr = 0 if self.TurnUser == self.Users[1] else 1
		oldUsr = 0 if self.TurnUser == self.Users[0] else 1
		self.TurnUser = self.Users[newUsr]
		# ColorPrint.prGreen("DEBUG! Game {gId} : Starting User {username} Turn.".format(gId=self.gameId, username=self.TurnUser.Name))
		msg = json.dumps({
			'function': "StartTurn",
			'playerName' : self.TurnUser.Name,
			'timer': 30
			})
		self.TurnUser.SendMessage(msg)
		msg = json.dumps({
			'function': "StartEnemyTurn",
			'playerName' : self.TurnUser.Name,
			'timer': 30
			})
		self.Users[oldUsr].SendMessage(msg)

	def ForceStep(self):
		match (self.Gamestatus):
			case GameState.Initialisation:
				pass
			case GameState.BoatPlacement:
				msg = json.dumps({
					'function': "RetrieveBoat",
					'timer': -1
					})
				if (len(self.Users[0].BoatList) == 0):
					self.Users[0].SendMessage(msg)
				if (len(self.Users[1].BoatList) == 0):
					self.Users[1].SendMessage(msg)
				self.currentTimer = 2
				self.Gamestatus = GameState.RequestBoat

			case GameState.RequestBoat:
				if (len(self.Users[0].BoatList) == 0 and len(self.Users[0].BoatList) == 0):
					usr = 2
				else:
					usr = 0 if len(self.Users[0].BoatList) == 0 else 1
				self.GameEnd(usr, GameEndReason.GiveUp)

			case GameState.Playing:
				msg = json.dumps({
					'function': "RetrieveHit",
					'timer': -1
					})
				# ColorPrint.prYellow("Warning! Game {gameid} : User {username} don't send a case. Requesting.".format(gameid=self.gameId, username=self.TurnUser.Name))
				self.TurnUser.SendMessage(msg)
				self.Gamestatus = GameState.RequestHit
				self.currentTimer = 2

			case GameState.RequestHit:
				other = 0 if self.TurnUser is self.Users[1] else 1
				self.GameEnd(0 if other == 1 else 1, GameEndReason.GiveUp)

	def RCV_HitCase(self, user, case):
		if (self.Gamestatus is not GameState.Playing and self.Gamestatus is not GameState.RequestHit):
			return
		usr = self.getUser(user)
		if usr is not self.TurnUser:
			# ColorPrint.prYellow("Warning! Game {gameid} : non game user {username} just sended an hit request.".format(gameid=self.gameId, username=usr.Name))
			return
		Target = self.Users[0] if usr is self.Users[1] else self.Users[1]
		Result = Target.Hit(case)
		usr.HitTry += 1
		if Result > 0:
			usr.BoatHit += 1
		if Result > 1:
			usr.DestroyedBoat += 1
		msg = json.dumps({
			'function': "HitResult",
			'case' : case,
			'result' : True if Result > 0 else False,
			'destroyedboat' : "None" if Result < 2 else Target.BoatList[Result - 2].Name
			})
		usr.SendMessage(msg)

		msg = json.dumps({
			'function': "GotHit",
			'case' : case,
			'result' : True if Result > 0 else False,
			'destroyedboat' : "None" if Result < 2 else Target.BoatList[Result - 2].Name
			})
		Target.SendMessage(msg)
		# ColorPrint.prGreen("Debug! Game {gameid} : User {username} hit case[{x},{y}] of {username2} and {result}.".format(gameid=self.gameId, username=self.TurnUser.Name, x=case['ArrayPosX'], y=case['ArrayPosY'], username2=Target.Name, result = "touch a boat" if Result > 0 else "miss"))
		if self.CheckEnd() is not None:
			# ColorPrint.prGreen("Debug! Game {gameid} : User {username} end the game.".format(gameid=self.gameId, username=self.TurnUser.Name))
			self.GameEnd(self.GetUserId(self.TurnUser), GameEndReason.Win)
		else:
			self.ChangeTurn()

	def GetUserId(self, user):
		return 0 if user is self.Users[0] else 1

	def CheckEnd(self):
		if (self.Users[0].CountDestroyedBoats() == len (self.Users[0].BoatList)):
			return self.Users[0]
		if (self.Users[1].CountDestroyedBoats() == len (self.Users[1].BoatList)):
			return self.Users[1]
		return None

	def GameEnd(self, usrID, Reason):
		if (self.Gamestatus is GameState.Ending):
			return
		if (usrID == 2):
			user = None
		else:
			user = self.Users[usrID]
		if Reason is GameEndReason.Disconnected or Reason is GameEndReason.GiveUp:
			if (user is None):
				# ColorPrint.prGreen("Debug! Game : {gameId}. Both users have disconnected or giveUp. Game is cancelled.".format(gameId=self.gameId))
				self.Winner = None
			else:
				if ((self.Gamestatus is GameState.BoatPlacement or self.Gamestatus is GameState.RequestBoat) and self.GameType is not GameType.Tournament):
					# ColorPrint.prGreen("Debug! Game : {gameId}. User {username} have disconnected or give up during boat placement phase. Game is cancelled.".format(gameId=self.gameId, username=user.Name))
					self.Winner = None
				else:
					# ColorPrint.prGreen("Debug! Game : {gameId}. User {username} have disconnected or give up during. Game is win by {othername}.".format(gameId=self.gameId, username=user.Name, othername=self.Users[0].Name if user is self.Users[1] else self.Users[1].Name))
					self.Winner = self.Users[0] if user is self.Users[1] else self.Users[1]
		else:
			# ColorPrint.prGreen("Debug! Game : {gameId}. Game is win by {username}.".format(gameId=self.gameId, username=user.Name))
			self.Winner = user
		self.Gamestatus = GameState.Ending

	def CloseGame(self):
		if (self.GameType is not GameType.Tournament):
			#  Save Result in DB
			msg = json.dumps({
				'function': "ReturnToMatchmaking",
				'Winner': 'None' if self.Winner is None else self.Winner.Name,
				'timer': 3
				})
		else:
			self.TournamentGame.HandleResult(self.Winner.sock_user.id if self.Winner is not None else None)
			msg = json.dumps({
				'function': "ReturnToTournament",
				'ID': self.TournamentGame.TournamentId,
				'timer': 3
				})
		self.Users[0].SendMessage(msg)
		self.Users[1].SendMessage(msg)
		if (self.Users[0].socket.Connected == True):
			# ColorPrint.prGreen("User0 Disconnect")
			self.Users[0].socket.close()
		if (self.Users[1].socket.Connected == True):
			self.Users[1].socket.close()
		from . import BS_MatchmakingManager
		BS_MatchmakingManager.GameManager.CloseGame(BS_MatchmakingManager.GameManager, self.gameId)

	def closeThread(self):
		if (self.thread == None):
			return
		self.thread.stop()
		self.thread.join()
		self.thread = None
