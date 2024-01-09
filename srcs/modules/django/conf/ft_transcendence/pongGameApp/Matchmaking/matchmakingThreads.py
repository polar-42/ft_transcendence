import threading, time, asyncio, random
from channels.layers import get_channel_layer

class pongMatchmakingLoop(threading.Thread):

    def __init__(self, current) :
        super().__init__()
        self.matchmake = current

    def run(self):
        while True:
            self.queueProcess = True
            random.shuffle(self.matchmake.userList)
            while (len(self.matchmake.userList) > 1):
                asyncio.run(self.matchmake.createGame(self.matchmake.userList[0], self.matchmake.userList[1]))
            self.queueProcess = False
            time.sleep(5)



class pongMatchmaking():
    _MatchList = []
    userList = []
    is_running = False
    channelName = "pongMatchmaking"

    def __init__(self):
        mythread = pongMatchmakingLoop(self)
        mythread.start()
        self.is_running = True
        self.channel_layer = get_channel_layer()


    async def AddUser(self, user):
        if user not in self.userList:
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

    async def createGame(self, user1, user2):
        if (user1.is_authenticated == False or user2.is_authenticated == False):
            if user1.is_authenticated == False:
                self.matchmake.removeUser(user1)
            if user2.is_authenticated == False:
                self.matchmake.removeUser(user2)
            return
        game_id = "PongGame_" + str(user1.id) + "_" + str(user2.id)
        print("PongGame id = " + game_id)
        await (self.channel_layer.group_send(
            self.channelName,
            {
                'type' : 'CreatePongGameMessage',
                'user1': user1.id,
                'user2': user2.id,
                'gameId': game_id
            }
        ))
        self.RemoveUser(user1)
        self.RemoveUser(user2)


