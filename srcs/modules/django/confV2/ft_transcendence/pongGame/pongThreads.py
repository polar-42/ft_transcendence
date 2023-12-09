import threading, time
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
import asyncio
from . import pongGameClasses

class pongGameLoop(threading.Thread):

    def __init__(self, current) :
        super().__init__()
        self.pong = current
        self.pongGame = pongGameClasses.GameState()
        self.isGameRunning = False

    def run(self):
        x = 0
        while True:
            if self.isGameRunning is True:
                game = self.pongGame.get_ball()
                ball_pos_x, ball_pos_y = game.get_pos()
                ball_gravity, ball_speed = game.get_gravity_speed()

                player1, player2 = self.pongGame.get_players()
                player1_pos_x, player1_pos_y = player1.get_pos()
                player2_pos_x, player2_pos_y = player2.get_pos()

         	    #BALL CCOLISIONS WITH WALLS
                if ball_pos_y + ball_gravity <= 0 or ball_pos_y + ball_gravity + 10 >= 450:
                    ball_gravity = ball_gravity * -1
                    ball_pos_y += ball_gravity
                    ball_pos_x += ball_speed
                #BALL COLLISION WITH PLAYER2
                elif ball_pos_y + ball_gravity <= player2_pos_y + 60 and ball_pos_y + ball_gravity >= player2_pos_y and ball_pos_x + 10 + ball_speed >= player2_pos_x:
                    ball_speed = ball_speed * -1
                    ball_pos_y += ball_gravity
                    ball_pos_x += ball_speed
                #BALL COLLISION WITH PLAYER1
                elif ball_pos_y + ball_gravity >= player1_pos_y and ball_pos_y + ball_gravity <= player1_pos_y + 60 and ball_pos_x + ball_speed <= player1_pos_x + 8:
                    ball_speed = ball_speed * -1
                    ball_pos_y += ball_gravity
                    ball_pos_x += ball_speed
                #BALL COLLISION WITH WALL BEHIND PLAYER
                elif ball_pos_x + ball_speed <= 0 or ball_pos_x + ball_speed + 10 >= 720:
                    ball_speed = ball_speed * -1
                    ball_pos_y += ball_gravity
                    ball_pos_x += ball_speed
	            #BALL MOVEMENT
                else:
                    ball_pos_y += ball_gravity
                    ball_pos_x += ball_speed
                self.pongGame.update_ball_gravity_speed(ball_gravity, ball_speed)
                self.pongGame.update_ball_pos(ball_pos_x, ball_pos_y)

                asyncio.run(self.pong.sendDataFromGame(self.pongGame))

                time.sleep(0.1)
                print('in game loop, x =', x)
                x = x + 1
                #print('game_loop')


    def start_game(self):
        self.isGameRunning = True



class pongGame():
    is_running = False
    channelName = ""

    def __init__(self):
        self.channel_layer = get_channel_layer()

    async def launchGame(self, channelName):
            if channelName != '':
                self.mythread = pongGameLoop(self)

                print('game (', channelName, ') is launch')
                self.channelName = channelName

                self.mythread.start()
                self.mythread.start_game()

    async def sendDataFromGame(self, pongGame):

        game = pongGame.get_ball()
        ball_pos_x, ball_pos_y = game.get_pos()

        player1, player2 = pongGame.get_players()
        player1_pos_x, player1_pos_y = player1.get_pos()
        player2_pos_x, player2_pos_y = player2.get_pos()

        await self.channel_layer.group_send(
            self.channelName,
            {
                'type': 'gameData',
                #'ball_pos_x': ball_pos_x,
                #'ball_pos_y': ball_pos_y,
                #'playerone_pos_y': player1_pos_y,
                #'playertwo_pos_y': player2_pos_y,
			}
		)

    #async def AddUser(self, user):
    #    if self.userList.__contains__(user) == False:
    #        self.userList.append(user)
    #        return True
    #    return False

    #def RemoveUser(self, user):
    #    if self.userList.__contains__(user) == True:
    #        self.userList.remove(user)
    #        return True
    #    return False

    #def getUserList(self):
    #    return self.userList

    #async def createGame(self, user1, user2):
    #    if (user1.is_authenticated == False or user2.is_authenticated == False):
    #        if user1.is_authenticated == False:
    #            self.matchmake.removeUser(user1)
    #        if user2.is_authenticated == False:
    #            self.matchmake.removeUser(user2)
    #        return
    #    game_id = "PongGame_" + str(user1.id) + "_" + str(user2.id)
    #    print("PongGame id = " + game_id)
    #    await (self.channel_layer.group_send(
    #        self.channelName,
    #        {
    #            'type' : 'CreatePongGameMessage',
    #            'user1': user1.id,
    #            'user2': user2.id,
    #            'gameId': game_id
    #        }
    #    ))
    #    self.RemoveUser(user1)
    #    self.RemoveUser(user2)



