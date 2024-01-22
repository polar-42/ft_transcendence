import threading, time
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import asyncio

from . import BS_Match

class MatchmakingLoop(threading.Thread):

    def __init__(self, current) :
        super().__init__()
        self.matchmake = current

    def run(self):
        while True:
            self.queueProcess = True
            random.shuffle(self.matchmake.userList)
            while (len(self.matchmake.userList) > 1):
                self.matchmake.createGame(self.matchmake.userList[0], self.matchmake.userList[1])
            self.queueProcess = False
            time.sleep(5)

class Matchmaking():
    userList = []
    is_running = False
    channelName = "Matchmaking"

    def __init__(self):
        mythread = MatchmakingLoop(self)
        mythread.start()
        self.is_running = True
        self.channel_layer = get_channel_layer()

    def AddUser(self, user):
        if self.userList.__contains__(user) == False:
            self.userList.append(user)
            return True
        return False

    def RemoveUser(self, user):
        if self.userList.__contains__(user) == True:
            self.userList.remove(user)
            return True
        return False

    def getUserList(self):
        return self.userList

    def createGame(self, user1, user2):
        if (user1.is_authenticated == False or user2.is_authenticated == False):
            if user1.is_authenticated == False:
                self.matchmake.removeUser(user1)
            if user2.is_authenticated == False:
                self.matchmake.removeUser(user2)
            return
        from . import BS_MatchmakingManager
        game_id = "Game_" + str(user1.id) + "_" + str(user2.id)
        BS_MatchmakingManager.GameManager.CreateGame(BS_MatchmakingManager.GameManager, user1, user2, game_id, BS_Match.GameType.Normal, None)
        async_to_sync(self.channel_layer.group_send)(
            self.channelName,
            {
                'type' : 'JoinGame',
                'user1': user1.id,
                'user2': user2.id,
                'gameId': game_id
            }
        )
        self.RemoveUser(user1)
        self.RemoveUser(user2)



