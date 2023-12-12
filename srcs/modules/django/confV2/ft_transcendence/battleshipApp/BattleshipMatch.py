import asyncio
from channels.layers import get_channel_layer
from enum import Enum
import threading, time
import random

class GameState(Enum):
    Initialisation = 0
    BoatPlacement = 1
    Playing = 2
    Ending = 3
    

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

    async def JoinGame(self, gameId, user, ChannelName):
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

    user1Boats = None
    user2Boats = None
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
        if self.user1 is not None and self.user1 is not user:
            self.user2 = user
            print("Game " + str(self.gameId) + " was joined by user " + str(self.user2.username) + ".")
        elif self.user1 is None:
            self.user1 = user
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
        if (user is self.user1):
            self.user1Boats = BoatList if self.user1Boats is None else None
        elif (user is self.user2):
            self.user2Boats = BoatList if self.user2Boats is None else None
        if (self.user2Boats is not None and self.user1Boats is not None):
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
        await self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'MSG_LeaveGame',
                'player' : user.username
            })
        self.thread.stop()
        self.thread.join()
        