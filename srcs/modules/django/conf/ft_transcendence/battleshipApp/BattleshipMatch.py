import asyncio
from channels.layers import get_channel_layer
from enum import IntEnum
import threading, time
import random
from . import ColorPrint
import json

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

class Case():

	def __init__(self, x, y):
		self.PosX = x
		self.PosY = y
		pass
	def __str__(self) -> str:
		return "posX = " + str(self.PosX) + " PosY = " + str(self.PosY)

class Boat():
	def __init__(self, name, size, orientation, posX, posY):
		self.Name = name
		self.BoatArray = []
		self. HittedArray = []
		while size > 0:
			if (orientation == 'V'):
				self.BoatArray.append(Case(posX, posY + size - 1))
			else:
				self.BoatArray.append(Case(posX + size - 1, posY))
			size -= 1

	def Hit(self, posX, posY):
		for case in self.BoatArray:
			if case.PosX == posX and case.PosY == posY:
				if self.HittedArray.__contains__(case) == True:
					return 0
				else:
					self.HittedArray.append(case)
					if (len (self.HittedArray) == len (self.BoatArray)):
						return 2
					return 1
		return 0

class User():
	def __init__(self, user):
		self.BoatList = []
		self.sock_user = user
		self.Name = self.sock_user.username
		self.ConnexionStatus = ConnexionState.NeverConnected
		return

	def SendMessage(self, msg):
		if (self.ConnexionStatus != ConnexionState.Connected):
			ColorPrint.prYellow("Warning! Trying to send message to not connected user : {username}.".format(username=self.Name))
			return
		if (self.socket == None):
			ColorPrint.prRed("Error! Trying to send message to user : {username} with None socket.".format(username=self.Name) )
			return
		(self.socket.send)(text_data=msg)

	def ParseBoats(self, boatsList):
		if (len(self.BoatList) != 0):
			self.BoatList.clear()
			return
		else:
			for boat in boatsList:
				ori = 'H' if boat['horizontal'] is True else 'V'
				if (boat['ArrayX'] < 0 or boat['ArrayY'] < 0):
					return False
				self.BoatList.append(Boat(boat['name'], boat['size'], ori, boat['ArrayX'], boat['ArrayY']))
		return True
	
	def Hit(self, case):
		result = 0
		pos = 0
		for boat in self.BoatList:
			result = boat.Hit(case['ArrayPosX'], case['ArrayPosY'])
			if (result > 0):
				return result if result == 1 else result + pos
			pos += 1
		return False
	
	def CountDestroyedBoats(self):
		count = 0
		for boat in self.BoatList:
			if (len(boat.BoatArray) == len(boat.HittedArray)):
				count += 1
		return count
	
	def checkPlayerBoats(self):
		count = 0
		for boat in self.BoatList:
			if (len(boat.BoatArray) == len(boat.HittedArray)):
				count += 1
		return (count == len(self.BoatList))

class GameLoop(threading.Thread):
	def __init__(self, current) :
		super().__init__()
		self.match = current
		self.stopFlag = threading.Event()

	def run(self):
		while not self.stopFlag.is_set():
			if self.match.currentTimer != -1:
				self.match.currentTimer -= 1
				ColorPrint.prGreen("Debug! GAME {gID}: Timer : {curTime}.".format(gID=self.match.gameId, curTime=self.match.currentTimer))
				if self.match.Gamestatus is GameState.Ending:
					self.match.CloseGame()
					return
				time.sleep(1)
			
			if  self.match.currentTimer == 0:
				self.match.ForceStep()
				if self.match.Gamestatus is GameState.Ending:
					self.match.CloseGame()
					return

	def stop(self):
		self.stopFlag.set()

class BattleshipMatch():

	currentTimer = -1

	thread = None
	TurnUser = None

	def __init__(self, gameId, user1, user2, GameManager, GameType, tournamentGame):
		self.gm = GameManager
		self.Gamestatus = GameState.Initialisation
		self.channelName = "BattleshipGame" + gameId 
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
			ColorPrint.prRed("Error! GAME {gID}: User {username} are not in game.".format(gID=self.gameId, username= user.username))
			return
		elif (FindedUser.ConnexionStatus != ConnexionState.NeverConnected):
			ColorPrint.prYellow("Warning! GAME {gID}: User {username} already connected.".format(gID=self.gameId, username= user.username))
			return
		else:
			FindedUser.ConnexionStatus = ConnexionState.Connected
			FindedUser.socket = socket
			ColorPrint.prGreen("Debug! GAME {gID}: User {username} connected.".format(gID=self.gameId, username= user.username))
		if (self.Users[0].ConnexionStatus == ConnexionState.Connected and self.Users[1].ConnexionStatus == ConnexionState.Connected):
			if (self.Gamestatus == GameState.Initialisation):
				self.StartGame()

	def StartGame(self):
		self.Gamestatus = GameState.BoatPlacement
		ColorPrint.prGreen("Debug! GAME {gID}: Starting.".format(gID=self.gameId))
		msg = json.dumps({
			'function': "initGame",
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
			ColorPrint.prRed("Error! Game {gId} : User {uName} is not player.".format(gId=self.gameId, uName=user.username))
			return
		if (usr.ParseBoats(BoatList) == False):
			usr.BoatList.clear()
			return
		usr1 = len(self.Users[0].BoatList)
		usr2 = len(self.Users[1].BoatList)
		if (len(usr.BoatList) > 0):
			ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} ready.".format(gId=self.gameId, uName=usr.Name))
		else:
			ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} not ready.".format(gId=self.gameId, uName=usr.Name))
		if (usr1 > 0 and usr1 == usr2):
			self.StartSecondPart()

	def StartSecondPart(self):
		ColorPrint.prGreen("DEBUG! Game {gId} : Game second part starting.".format(gId=self.gameId))
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
		ColorPrint.prGreen("DEBUG! Game {gId} : Starting User {username} Turn.".format(gId=self.gameId, username=self.TurnUser.Name))
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
				ColorPrint.prYellow("Warning! Game {gameid} : User {username} don't send a case. Requesting.".format(gameid=self.gameId, username=self.TurnUser.Name))
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
			ColorPrint.prYellow("Warning! Game {gameid} : non game user {username} just sended an hit request.".format(gameid=self.gameId, username=usr.Name))
			return
		Target = self.Users[0] if usr is self.Users[1] else self.Users[1]
		Result = Target.Hit(case)

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
		ColorPrint.prGreen("Debug! Game {gameid} : User {username} hit case[{x},{y}] of {username2} and {result}.".format(gameid=self.gameId, username=self.TurnUser.Name, x=case['ArrayPosX'], y=case['ArrayPosY'], username2=Target.Name, result = "touch a boat" if Result > 0 else "miss"))
		if self.CheckEnd() is not None:
			ColorPrint.prGreen("Debug! Game {gameid} : User {username} end the game.".format(gameid=self.gameId, username=self.TurnUser.Name))
			self.GameEnd(self.GetUserId(self.TurnUser), GameEndReason.Win)
		else:
		# 	self.StopGame(True, True, "Game Ended! Winner is " + self.TurnUser.Name + ". He destroyed the " + str(Target.CountDestroyedBoats()) + " " + Target.Name + " boats while getting only " + str(self.TurnUser.CountDestroyedBoats()) + " of its own boat destroyed.")
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
		if (usrID == 2):
			user = None
		else:
			user = self.Users[usrID]
		if Reason is GameEndReason.Disconnected or Reason is GameEndReason.GiveUp:
			if (user is None):
				ColorPrint.prGreen("Debug! Game : {gameId}. Both users have disconnected or giveUp. Game is cancelled.".format(gameId=self.gameId))
				self.Winner = None
			else:
				if ((self.Gamestatus is GameState.BoatPlacement or self.Gamestatus is GameState.RequestBoat) and self.GameType is not GameType.Tournament):
					ColorPrint.prGreen("Debug! Game : {gameId}. User {username} have disconnected or give up during boat placement phase. Game is cancelled.".format(gameId=self.gameId, username=user.Name))
					self.Winner = None
				else:
					ColorPrint.prGreen("Debug! Game : {gameId}. User {username} have disconnected or give up during. Game is win by {othername}.".format(gameId=self.gameId, username=user.Name, othername=self.Users[0].Name if user is self.Users[1] else self.Users[1].Name))
					self.Winner = self.Users[0] if user is self.Users[1] else self.Users[1]
		else:
			ColorPrint.prGreen("Debug! Game : {gameId}. Game is win by {username}.".format(gameId=self.gameId, username=user.Name))
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
			self.TournamentGame.HandleResult(self.Winner)
			msg = json.dumps({
				'function': "ReturnToTournament",
				'ID': self.TournamentGame.TournamentId,
				'timer': 3
				})
		self.Users[0].SendMessage(msg)
		self.Users[1].SendMessage(msg)
		self.Users[0].socket.close()
		self.Users[1].socket.close()
		from . import BattleshipGameManager
		BattleshipGameManager.GameManager.CloseGame(BattleshipGameManager.GameManager, self.gameId)

	def closeThread(self):
		if (self.thread == None):
			return
		self.thread.stop()
		self.thread.join()
		self.thread = None