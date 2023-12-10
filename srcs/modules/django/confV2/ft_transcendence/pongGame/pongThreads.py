import threading, time, json
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
import asyncio
from . import pongGameClasses

class pongGameLoop(threading.Thread):

    def __init__(self, current) :
        super().__init__()
        self.pong = current
        self.game = pongGameClasses.GameState()
        self.isGameRunning = False

    async def run_async(self):
        x = 0
        while True:
            if self.isGameRunning is True:
                game = self.game.get_ball()
                ball_pos_x, ball_pos_y = game.get_pos()
                ball_gravity, ball_speed = game.get_gravity_speed()

                player1, player2 = self.game.get_players()
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
                self.game.update_ball_gravity_speed(ball_gravity, ball_speed)
                self.game.update_ball_pos(ball_pos_x, ball_pos_y)

                await send_data_async(self.pong, self.game)

                await asyncio.sleep(0.1)
                print('in game loop, x =', x)
                x = x + 1

    def run(self):
        asyncio.run(self.run_async())


    def start_game(self):
        self.isGameRunning = True

    def inputGame(self, input, player):
        if input == 'ArrowUp':
            if player == 0:
                self.game.move_up_player1()
            else:
                self.game.move_up_player2()
        elif input == 'ArrowDown':
            if player == 0:
                self.game.move_down_player1()
            else:
                self.game.move_down_player2()

async def send_data_async(ping_game_instance, game):
    await ping_game_instance.sendDataFromGame(game)


class pongGame():
    is_running = False
    channelName = ""
    users = []

    def __init__(self):
        self.channel_layer = get_channel_layer()
        self.pongGameLoopTask = None
        #self.pongGame = pongGameClasses.GameState()

    async def launchGame(self, channelName, users):
            self.users = users
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

        for x in self.users:
            await x.send(text_data=json.dumps({
    			'type': 'game_data',
    			'ball_pos_x': ball_pos_x,
                'ball_pos_y': ball_pos_y,
                'playerone_pos_y': player1_pos_y,
                'playertwo_pos_y': player2_pos_y,
    		}))

    async def inputGame(self, input, player):
        print('input is', input, 'by', player.username)
        i = 0
        for x in self.users:
            if x == player:
                if i == 0:
                    self.mythread.inputGame(input, x)
            i = i + 1
