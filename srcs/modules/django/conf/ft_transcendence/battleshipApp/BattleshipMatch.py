import asyncio
from channels.layers import get_channel_layer
from enum import Enum
import threading, time
import random
import socketApp

class GameState(Enum):
    Initialisation = 0
    BoatPlacement = 1
    Playing = 2
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
                asyncio.run(self.match.ForceStep())

    def stop(self):
        self.stopFlag.set()

class BattleShipGameManager():
    _MatchList = {}

    async def JoinGame(self, gameId, ChannelName, user):
        if (gameId not in self._MatchList.keys()):
            self._MatchList[gameId] = BattleshipMatch(gameId, ChannelName)
            await self._MatchList[gameId].JoinGame(user)
        else:
            await self._MatchList[gameId].JoinGame(user)
        return self._MatchList[gameId]
    async def LeaveGame(self, gameId, user):
        if gameId not in self._MatchList.keys():
            return 
        asyncio.wait (await self._MatchList[gameId].StopGame(user))
        self._MatchList.pop(gameId)

class BattleshipMatch():

    user1 = None
    user2 = None

    currentTimer = -1

    thread = None
    TurnUser = None

    def __init__(self, gameId, ChannelName):
        self.Gamestatus = GameState.Initialisation
        self.channelName = ChannelName 
        self.gameId = gameId
        self.channel_layer = get_channel_layer()

    async def ForceStep(self):
        match (self.Gamestatus):
            case GameState.Initialisation:
                pass
            case GameState.BoatPlacement:
                pass
            case GameState.Playing:
                pass
            case GameState.Ending:
                pass
        pass

    async def JoinGame(self, user):
        if self.user1 is not None and self.user1.sock_user is not user:
            self.user2 = User(user)
        elif self.user1 is None:
            self.user1 = User(user)
        if (self.user1 is not None and self.user2 is not None):
            await self.initGame()

    async def initGame(self):
        await (self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'MSG_initGame',
            }
        ))
        self.Gamestatus = GameState.BoatPlacement
        self.currentTimer = 60
        self.thread = MatchmakingLoop(self)
        self.thread.start()

    async def startGame(self):
        self.Gamestatus = GameState.Playing
        await self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'MSG_StartGame',
            })
        self.currentTimer = -1

    async def RCV_BoatsList(self, user, BoatList):
        if (self.Gamestatus is not GameState.BoatPlacement):
            return
        user = self.getUser(user)
        if (user is None):
            return
        for line in BoatList:
            if line['ArrayX'] == -1:
                return
        user.ParseBoats(BoatList)
        if (len(self.user1.BoatList) != 0 and len(self.user2.BoatList) != 0):
            await self.startGame()

    OnLoadNumber = 0

    async def RCV_OnLoad(self):
        if (self.OnLoadNumber == 2):
            self.OnLoadNumber = 1
        else:
            self.OnLoadNumber += 1
        if (self.OnLoadNumber == 2 and self.TurnUser is None):
            player = random.randint(1,2)
            self.TurnUser = self.user1 if player == 1 else self.user2
            await self.channel_layer.group_send(
                self.channelName,
                {
                    'type' : 'MSG_GiveTurn',
                    'player' : self.TurnUser
                })
        self.currentTimer = 30

    async def StopGame(self, user):
        self.thread.stop()
        self.thread.join()
        await self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'MSG_LeaveGame',
                'player' : user.username
            })

    def getUser(self, user):
        if (user == self.user1.sock_user):
            return self.user1
        elif user == self.user2.sock_user:
            return self.user2
        return None

    async def ChangeTurn(self):
        self.TurnUser = self.user1 if self.TurnUser is self.user2 else self.user2
        await self.channel_layer.group_send(
                self.channelName,
                {
                    'type' : 'MSG_GiveTurn',
                    'player' : self.TurnUser
                })
        self.currentTimer = 30
            

    async def EndGame(self, Winner):
        self.thread.stop()
        self.thread.join()
        Looser = self.user1 if Winner is self.user2 else self.user2
        self.Gamestatus = GameState.Ending
        await self.channel_layer.group_send(
                self.channelName,
                {
                    'type' : 'MSG_GameEnd',
                    'winner' : Winner, 
                    'looser' : Looser,
                    'looserBoat' : Looser.CountDestroyedBoats(),
                    'winnerBoat' : Winner.CountDestroyedBoats(),
                })

    async def RCV_HitCase(self, user, case):
        if (self.Gamestatus is not GameState.Playing):
            return
        user = self.getUser(user)
        if user is not self.TurnUser:
            return
        Target = self.user1 if user is self.user2 else self.user2
        Result = Target.Hit(case)
        asyncio.wait(await self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'MSG_HitResult',
                'target' : Target,
                'case' : case,
                'result' : True if Result > 0 else False,
                'destroyedboat' : "None" if Result < 2 else Target.BoatList[Result - 2].Name
            }))
        if (Target.checkPlayerBoats() == True):
            asyncio.wait (await self.EndGame(self.TurnUser))
            # endGame
        else:
            await self.ChangeTurn()

        
