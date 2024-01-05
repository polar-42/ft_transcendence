import asyncio
from channels.layers import get_channel_layer
from enum import IntEnum
import threading, time
import random
from asgiref.sync import async_to_sync
import socketApp
import tournamentsApp.views
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
				self.BoatList.append(Boat(boat['name'], boat['size'], ori, boat['ArrayX'], boat['ArrayY']))
		return 		
	# for boat in self.BoatList:
	# 				for cases in boat.BoatArray:
	# 					print(self.Name + " " + boat.Name + " " + str(cases))
	
	# def Hit(self, case):
	# 	result = 0
	# 	pos = 0
	# 	for boat in self.BoatList:
	# 		result = boat.Hit(case['ArrayPosX'], case['ArrayPosY'])
	# 		if (result > 0):
	# 			return result if result == 1 else result + pos
	# 		pos += 1
	# 	return False
	
	# def CountDestroyedBoats(self):
	# 	count = 0
	# 	for boat in self.BoatList:
	# 		if (len(boat.BoatArray) == len(boat.HittedArray)):
	# 			count += 1
	# 	return count

	# def checkPlayerBoats(self):
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
				time.sleep(1)
			if  self.match.currentTimer == 0:
				self.match.ForceStep()

	def stop(self):
		self.stopFlag.set()

class BattleShipGameManager():
	_MatchList = {}

	def JoinGame(self, gameId, user, socket):
		if (gameId not in self._MatchList.keys()):
			ColorPrint.prRed("Error ! User {name} try to join non existing game : {game}.".format(name=user.username, game=gameId))
			return None
		else:
			ColorPrint.prRed("Error ! User {name} Socket : {Msocket}.".format(name=user.username, Msocket=socket))
			self._MatchList[gameId].ConnectUser(user, socket)
		return self._MatchList[gameId]
	
	def LeaveGame(self, gameId, user):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList[gameId].disconnectUser(user, "User " + user.username + " leave the game")
		# self._MatchList[gameId].StopGame(True, True, "User " + user.username + " leave the game")

	def CloseGame(self, gameId):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList.pop(gameId)

	def CreateGame(self, user1, user2, gameid : str, GType : GameType, _id):
		if (id not in self._MatchList.keys()):
			self._MatchList[gameid] = BattleshipMatch(gameid, user1, user2, self, GType, _id)
			ColorPrint.prGreen("DEBUG : Game {gameId} created.".format(gameId=gameid))
		else:
			ColorPrint.prRed("Error! Trying to create a game with duplicate id : " + gameid + ".")

class BattleshipMatch():

	currentTimer = -1

	thread = None
	TurnUser = None

	def __init__(self, gameId, user1, user2, GameManager, GameType, _id):
		self.gm = GameManager
		self.Gamestatus = GameState.Initialisation
		self.channelName = "BattleshipGame" + gameId 
		self.gameId = gameId
		self.channel_layer = get_channel_layer()
		self.Users = [User(user1), User(user2)]
		self.GameType = GameType
		self._id = _id

	def getUser(self, user):
		if (user.id == self.Users[0].sock_user.id):
			return self.Users[0]
		elif user.id == self.Users[1].sock_user.id:
			return self.Users[1]
		return None

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
		if (self.Gamestatus is GameState.RequestBoat):
			self.Gamestatus = GameState.BoatPlacement
		if (self.Gamestatus is not GameState.BoatPlacement):
			return
		usr = self.getUser(user)
		if (usr is None):
			ColorPrint.prRed("Error! Game {gId} : User {uName} is not player.".format(gId=self.gameId, uName=user.username))
			return
		usr.ParseBoats(BoatList)
		usr1 = len(self.Users[0].BoatList)
		usr2 = len(self.Users[1].BoatList)
		if (len(usr.BoatList) > 0):
			ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} ready.".format(gId=self.gameId, uName=usr.Name))
		else:
			ColorPrint.prGreen("DEBUG! Game {gId} : User {uName} not ready.".format(gId=self.gameId, uName=usr.Name))
		if (usr1 > 0 and usr1 == usr2):
			self.startSecondPart()

	def startSecondPart(self):
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
				self.currentTimer = 1
# def disconnectUser(self, user, reason : str):
	# 	usr = self.getUser(user)
	# 	if (usr is None):
	# 		ColorPrint.prRed("Error ! User '" + usr.Name + "' Try to disconnect from Match '" + self.gameId + "' while not in.")
	# 		return
	# 	if (usr.connected == False):
	# 		ColorPrint.prRed("Error ! User '" + usr.Name + "' Try to disconnect from Match '" + self.gameId + "' while already disconnected.")
	# 		return
	# 	usr.connected = False
	# 	if (self.Gamestatus is not GameState.Ending):
	# 		self.StopGame(True, True, reason)

# def ForceStep(self):
	# 	print ("ForceStep = " + str(self.Gamestatus))
	# 	match (self.Gamestatus):
	# 		case GameState.Initialisation:
	# 			pass
	# 		case GameState.BoatPlacement:
	# 			self.Gamestatus = GameState.RequestBoat
	# 			if len(self.user1.BoatList) == 0:
	# 				print ("Request " + self.user1.sock_user.username + " boats from server")
	# 				async_to_sync(self.channel_layer.group_send)(
	# 					self.channelName,
	# 					{
	# 						'type' : 'MSG_RequestBoat',
	# 						'user' : self.user1.sock_user.id,
	# 					})
	# 			if len(self.user2.BoatList) == 0:
	# 				print ("Request " + self.user2.Name + " boats from server")
	# 				async_to_sync(self.channel_layer.group_send)(
	# 					self.channelName,
	# 					{
	# 						'type' : 'MSG_RequestBoat',
	# 						'user' : self.user2.sock_user.id,
	# 					})
	# 			self.currentTimer = 1
	# 		case GameState.RequestBoat:
	# 			if len(self.user1.BoatList) == 0 and len(self.user2.BoatList) == 0:
	# 				self.StopGame(True, True, "Game cancel! None of the user send their boats to the server!")
	# 				return
	# 			elif len(self.user1.BoatList) == 0:
	# 				Target = self.user1.Name
	# 			else:
	# 				Target = self.user2.Name
	# 			self.StopGame(True, True, "Game cancel! User " + Target + " not send is boats to the server!")
	# 		case GameState.Playing:
	# 			print("Playing Request user = " + self.TurnUser.sock_user.username)
	# 			async_to_sync(self.channel_layer.group_send)(
	# 				self.channelName,
	# 				{
	# 					'type' : 'MSG_RequestHit',
	# 					'user' : self.TurnUser.sock_user.id,
	# 				})
	# 			self.Gamestatus = GameState.RequestHit
	# 			self.currentTimer = 1
	# 		case GameState.RequestHit:
	# 			Winner = self.user1.Name if self.TurnUser == self.user2 else self.user2.Name
	# 			self.StopGame(True, True, "Game ended by forfeit! User " + Winner + " win since " + self.TurnUser.Name + " not send is selected case to the server!")
			
	# 		case GameState.Ending:
	# 			pass
	# 	pass

# def GetTournamentId(self):
	# 	startPos = len("Tournament")
	# 	EndPos = self.gameId.find('_')
	# 	id = self.gameId[startPos:EndPos]
	# 	return id

# def StopGame(self, user1, user2, message):
	# 	if (self.Gamestatus == GameState.Ending):
	# 		ColorPrint.prRed("Trying to stop an already enden game with reason : \"" + message + "\"")
	# 		return
	# 	self.Gamestatus = GameState.Ending
	# 	if (user1 == True and self.user1.connected is True) and (user2 == True and self.user2.connected is True):
	# 		user = -1
	# 	elif (user1 == True and self.user1.connected is True):
	# 		user = user1.sock_user.id
	# 	elif (user2 == True and self.user2.connected is True):
	# 		user = user2.sock_user.id
	# 	else:
	# 		return
	# 	ColorPrint.prGreen("Game Stopped with reason : \"" + message + "\"")
	# 	async_to_sync(self.channel_layer.group_send)(
	# 		self.channelName,
	# 		{
	# 			'type' : 'MSG_GameStop',
	# 			'user' : user,
	# 			'message' : message
	# 		})

# def closeThread(self):
	# 	if (self.thread == None):
	# 		return
	# 	self.thread.stop()
	# 	self.thread.join()
	# 	self.thread = None
	# 	if self.gameId.startswith('Tournament') == True:
	# 		tournamentsApp.views.TournamentManager.sendMatchData(self.GetTournamentId(), self.gameId, self.TurnUser.sock_user)
	# 	self.gm.CloseGame(self.gm, self.gameId)
		
	# def RCV_HitCase(self, user, case):
		# if (self.Gamestatus is not GameState.Playing and self.Gamestatus is not GameState.RequestHit):
		# 	return
		# user = self.getUser(user)
		# if user is not self.TurnUser:
		# 	return
		# if (self.Gamestatus is GameState.RequestHit):
		# 	self.Gamestatus = GameState.Playing
		# Target = self.user1 if user is self.user2 else self.user2
		# Result = Target.Hit(case)
		# async_to_sync(self.channel_layer.group_send)(
		# 	self.channelName,
		# 	{
		# 		'type' : 'MSG_HitResult',
		# 		'target' : Target,
		# 		'case' : case,
		# 		'result' : True if Result > 0 else False,
		# 		'destroyedboat' : "None" if Result < 2 else Target.BoatList[Result - 2].Name
		# 	})
		# if (Target.checkPlayerBoats() == True):
		# 	self.StopGame(True, True, "Game Ended! Winner is " + self.TurnUser.Name + ". He destroyed the " + str(Target.CountDestroyedBoats()) + " " + Target.Name + " boats while getting only " + str(self.TurnUser.CountDestroyedBoats()) + " of its own boat destroyed.")
		# else:
		# 	self.ChangeTurn()

		
