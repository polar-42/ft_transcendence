import threading, time, asyncio, random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..Remote.pongGameManager import Manager

class pongMatchmakingLoop(threading.Thread):

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


class pongMatchmaking():
    userList = []
    is_running = False
    channelName = "pongMatchmaking"

    def __init__(self):
        mythread = pongMatchmakingLoop(self)
        mythread.start()
        self.is_running = True
        self.channel_layer = get_channel_layer()

    def AddUser(self, user):
        if user not in self.userList:
            print("-----------------------------------------")
            self.userList.append(user)
            return True
        return False

    def RemoveUser(self, user):
        if user in self.userList:
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
        gameId = "PongGame_" + str(user1.id) + "_" + str(user2.id)
        print("user1 =", user1, "user2 =", user2, "gameId =", gameId)
        Manager.createGame(user1, user2, gameId, None)

        async_to_sync(self.channel_layer.group_send)(
            self.channelName,
            {
                'type': 'joinGame',
                'user1': user1.id,
                'user2': user2.id,
                'gameId': gameId,
            }
        )

        self.RemoveUser(user1)
        self.RemoveUser(user2)


