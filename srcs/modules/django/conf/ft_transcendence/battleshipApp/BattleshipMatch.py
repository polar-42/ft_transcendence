import asyncio
from channels.layers import get_channel_layer
from enum import IntEnum
import threading, time
import random
from asgiref.sync import async_to_sync
import socketApp
import tournamentsApp.views



class GameState(IntEnum):
	RequestBoat = -1
	Initialisation = 0
	BoatPlacement = 1
	Playing = 2
	RequestHit = 4
	Ending = 3
	

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
		pass

	def ParseBoats(self, boatsList):
		if (len(self.BoatList) != 0):
			self.BoatList.clear()
		else:
			for boat in boatsList:
				ori = 'H' if boat['horizontal'] is True else 'V'
				self.BoatList.append(Boat(boat['name'], boat['size'], ori, boat['ArrayX'], boat['ArrayY']))
			for boat in self.BoatList:
					for cases in boat.BoatArray:
						print(self.Name + " " + boat.Name + " " + str(cases))
	
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

class MatchmakingLoop(threading.Thread):
	def __init__(self, current) :
		super().__init__()
		self.match = current
		self.stopFlag = threading.Event()

	def run(self):
		while not self.stopFlag.is_set():
			if self.match.currentTimer != -1:
				self.match.currentTimer -= 1
				time.sleep(1)
			if  self.match.currentTimer == 0:
				self.match.ForceStep()

	def stop(self):
		self.stopFlag.set()

class BattleShipGameManager():
	_MatchList = {}

	def JoinGame(self, gameId, ChannelName, user):
		if (gameId not in self._MatchList.keys()):
			self._MatchList[gameId] = BattleshipMatch(gameId, ChannelName, self)
			self._MatchList[gameId].JoinGame(user)
		else:
			self._MatchList[gameId].JoinGame(user)
		return self._MatchList[gameId]
	def LeaveGame(self, gameId, user):
		if gameId not in self._MatchList.keys():
			return 
		self._MatchList[gameId].StopGame(True, True, "User " + user.username + " leave the game")

	def CloseGame(self, gameId):
		if gameId not in self._MatchList.keys():
			return
		self._MatchList.pop(gameId)
		
class BattleshipMatch():

	user1 = None
	user2 = None

	currentTimer = -1

	thread = None
	TurnUser = None

	def __init__(self, gameId, ChannelName, GameManager):
		self.gm = GameManager
		self.Gamestatus = GameState.Initialisation
		self.channelName = ChannelName 
		self.gameId = gameId
		self.channel_layer = get_channel_layer()

	def ForceStep(self):
		print ("ForceStep = " + str(self.Gamestatus))
		match (self.Gamestatus):
			case GameState.Initialisation:
				pass
			case GameState.BoatPlacement:
				self.Gamestatus = GameState.RequestBoat
				if len(self.user1.BoatList) == 0:
					print ("Request " + self.user1.sock_user.username + " boats from server")
					async_to_sync(self.channel_layer.group_send)(
						self.channelName,
						{
							'type' : 'MSG_RequestBoat',
							'user' : self.user1.sock_user.id,
						})
				if len(self.user2.BoatList) == 0:
					print ("Request " + self.user2.Name + " boats from server")
					async_to_sync(self.channel_layer.group_send)(
						self.channelName,
						{
							'type' : 'MSG_RequestBoat',
							'user' : self.user2.sock_user.id,
						})
				self.currentTimer = 1
			case GameState.RequestBoat:
				if len(self.user1.BoatList) == 0 and len(self.user2.BoatList) == 0:
					self.StopGame(True, True, "Game cancel! None of the user send their boats to the server!")
					return
				elif len(self.user1.BoatList) == 0:
					Target = self.user1.Name
				else:
					Target = self.user2.Name
				self.StopGame(True, True, "Game cancel! User " + Target + " not send is boats to the server!")
			case GameState.Playing:
				print("Playing Request user = " + self.TurnUser.sock_user.username)
				async_to_sync(self.channel_layer.group_send)(
					self.channelName,
					{
						'type' : 'MSG_RequestHit',
						'user' : self.TurnUser.sock_user.id,
					})
				self.Gamestatus = GameState.RequestHit
				self.currentTimer = 1
			case GameState.RequestHit:
				Winner = self.user1.Name if self.TurnUser == self.user2 else self.user2.Name
				self.StopGame(True, True, "Game ended by forfeit! User " + Winner + " win since " + self.TurnUser.Name + " not send is selected case to the server!")
			
			case GameState.Ending:
				pass
		pass

	def GetTournamentId(self):
		startPos = len("Tournament")
		EndPos = self.gameId.find('_')
		id = self.gameId[startPos:EndPos]
		return id

	def StopGame(self, user1, user2, message):
		self.Gamestatus = GameState.Ending
		if user1 == True and user2 == True:
			user = -1
		elif user1 == True:
			user = user1.sock_user.id
		elif user2 == True:
			user = user2.sock_user.id
		async_to_sync(self.channel_layer.group_send)(
			self.channelName,
			{
				'type' : 'MSG_GameStop',
				'user' : user,
				'message' : message
			})

	def closeThread(self):
		if (self.thread == None):
			return
		self.thread.stop()
		self.thread.join()
		self.thread = None
		if self.gameId.startswith('Tournament') == True:
			tournamentsApp.views.TournamentManager.sendMatchData(self.GetTournamentId(), self.gameId, self.TurnUser.sock_user)
		self.gm.CloseGame(self.gm, self.gameId)

	def JoinGame(self, user):
		if self.user1 is not None and self.user1.sock_user is not user:
			self.user2 = User(user)
		elif self.user1 is None:
			self.user1 = User(user)
		if (self.user1 is not None and self.user2 is not None):
			self.initGame()

	def initGame(self):
		async_to_sync(self.channel_layer.group_send)(
			self.channelName,
			{
				'type' : 'MSG_initGame',
			}
		)
		self.Gamestatus = GameState.BoatPlacement
		self.currentTimer = 60
		self.thread = MatchmakingLoop(self)
		self.thread.start()

	def startGame(self):
		self.currentTimer = -1
		self.Gamestatus = GameState.Playing
		async_to_sync(self.channel_layer.group_send)(
			self.channelName,
			{
				'type' : 'MSG_StartGame',
			})

	def RCV_BoatsList(self, user, BoatList):
		if (self.Gamestatus is not GameState.BoatPlacement and self.Gamestatus is not GameState.RequestBoat):
			return
		if (self.Gamestatus is GameState.RequestBoat):
			self.Gamestatus = GameState.BoatPlacement
		user = self.getUser(user)
		if (user is None):
			return
		for line in BoatList:
			if line['ArrayX'] == -1:
				return
		user.ParseBoats(BoatList)
		if (len(self.user1.BoatList) != 0 and len(self.user2.BoatList) != 0):
			self.startGame()

	OnLoadNumber = 0

	def RCV_OnLoad(self):
		if (self.OnLoadNumber == 2):
			self.OnLoadNumber = 1
		else:
			self.OnLoadNumber += 1
		if (self.OnLoadNumber == 2 and self.TurnUser is None):
			player = random.randint(1,2)
			self.TurnUser = self.user1 if player == 1 else self.user2
			async_to_sync(self.channel_layer.group_send)(
				self.channelName,
				{
					'type' : 'MSG_GiveTurn',
					'player' : self.TurnUser
				})
		self.currentTimer = 30

	def getUser(self, user):
		if (user == self.user1.sock_user):
			return self.user1
		elif user == self.user2.sock_user:
			return self.user2
		return None

	def ChangeTurn(self):
		self.currentTimer = 30
		self.TurnUser = self.user1 if self.TurnUser is self.user2 else self.user2
		async_to_sync(self.channel_layer.group_send)(
				self.channelName,
				{
					'type' : 'MSG_GiveTurn',
					'player' : self.TurnUser
				})      
	
	def RCV_HitCase(self, user, case):
		if (self.Gamestatus is not GameState.Playing and self.Gamestatus is not GameState.RequestHit):
			return
		user = self.getUser(user)
		if user is not self.TurnUser:
			return
		if (self.Gamestatus is GameState.RequestHit):
			self.Gamestatus = GameState.Playing
		Target = self.user1 if user is self.user2 else self.user2
		Result = Target.Hit(case)
		async_to_sync(self.channel_layer.group_send)(
			self.channelName,
			{
				'type' : 'MSG_HitResult',
				'target' : Target,
				'case' : case,
				'result' : True if Result > 0 else False,
				'destroyedboat' : "None" if Result < 2 else Target.BoatList[Result - 2].Name
			})
		if (Target.checkPlayerBoats() == True):
			self.StopGame(True, True, "Game Ended! Winner is " + self.TurnUser.Name + ". He destroyed the " + str(Target.CountDestroyedBoats()) + " " + Target.Name + " boats while getting only " + str(self.TurnUser.CountDestroyedBoats()) + " of its own boat destroyed.")
		else:
			self.ChangeTurn()

		
