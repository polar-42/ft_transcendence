import threading, time
import random

class MatchmakingLoop(threading.Thread):

    def __init__(self, current):
        super().__init__()
        self.matchmake = current

    def run(self):
        while True:
            random.shuffle(self.matchmake.userList)
            for user in self.matchmake.userList:
                print(f"connectedUser: {user.username}")
            time.sleep(5)

class Matchmaking():
    userList = []
    is_running = False

    def __init__(self):
        mythread = MatchmakingLoop(self)
        mythread.start()
        self.is_running = True
        pass