import threading, time, json
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
import asyncio
from . import pongGameClasses

class pongGameLoop(threading.Thread):

    def __init__(self, current, users):
        super().__init__()
        self.pong = current
        self.game = pongGameClasses.GameState(users)
        self.isGameRunning = False
        self.stop_flag = threading.Event()

    async def run_async(self):
        x = 0
        while not self.stop_flag.is_set():
            game = self.game.get_ball()
            ball_pos_x, ball_pos_y = game.get_pos()
            ball_gravity, ball_speed = game.get_gravity_speed()

            player1, player2 = self.game.get_players()
            player1_pos_x, player1_pos_y = player1.get_pos()
            player2_pos_x, player2_pos_y = player2.get_pos()

            player1_score = player1.get_score()
            player2_score = player2.get_score()

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
            #UPDATE SCORE PLAYER1
            elif ball_pos_x + ball_speed <= 0:
                player1_score = player1_score + 1
                ball_pos_x = 355
                ball_pos_y = 195
                self.game.update_score(2)
            #UPDATE SCORE PLAYER2
            elif ball_pos_x + ball_speed + 10 >= 720:
                player2_score = player2_score + 1
                ball_pos_x = 355
                ball_pos_y = 195
                self.game.update_score(1)
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

            await asyncio.sleep(0.03)

            #print('in game loop, x =', x)
            x = x + 1
        print('LOOP GAME FINISH')

    def run(self):
        asyncio.run(self.run_async())

    def start_game(self):
        self.isGameRunning = True

    def inputGame(self, input, player):
        print('player is', player, 'input is', input)
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

    def stop_game(self):
        self.isGameRunning = False

    def stop(self):
        self.stop_flag.set()

async def send_data_async(ping_game_instance, game):
    await ping_game_instance.sendDataFromGame(game)


class pongGame():
    is_running = False
    channelName = ""

    def __init__(self):
        self.channel_layer = get_channel_layer()
        #self.pongGame = pongGameClasses.GameState()

    async def launchGame(self, channelName, users):
        self.users = users
        if channelName != '':
            self.mythread = pongGameLoop(self, users)

            print('game (', channelName, ') is launch')

            self.channelName = channelName

            self.mythread.start_game()
            self.mythread.start()

    async def finishGame(self):
        self.mythread.stop()
        self.mythread.join()


    async def sendDataFromGame(self, pongGame):
        #print('sendDataFromGame')
        game = pongGame.get_ball()
        ball_pos_x, ball_pos_y = game.get_pos()

        player1, player2 = pongGame.get_players()
        player1_pos_x, player1_pos_y = player1.get_pos()
        player2_pos_x, player2_pos_y = player2.get_pos()

        player1_score = player1.get_score()
        player2_score = player2.get_score()

        for x in self.users:
            await x.send(text_data=json.dumps({
    			'type': 'game_data',
    			'ball_pos_x': ball_pos_x,
                'ball_pos_y': ball_pos_y,
                'playerone_pos_y': player1_pos_y,
                'playertwo_pos_y': player2_pos_y,
                'playerone_score': player1_score,
                'playertwo_score': player2_score,
    		}))

        if player1_score >= 3 or player2_score >= 3:
            if player1_score >= 3:
                winner = player1.get_id()
            else:
                winner = player2.get_id()
            await self.channel_layer.group_send(
                self.channelName,
                {
                    'type': 'end_game_by_score',
                    'winner': winner.username,
                    'playerone_score': player1_score,
                    'playertwo_score': player2_score,
                }
            )

    async def inputGame(self, input, player):
        print('input is', input, 'by', player.username)
        i = 0
        for x in self.users:
            if x == player:
                self.mythread.inputGame(input, i)
            i = i + 1

    async def quitGame(self, player):
        print('player', player.username, 'leave the game')

        self.mythread.stop()
        self.mythread.join()

        await self.channel_layer.group_send(
            self.channelName,
            {
                'type': 'end_game',
            }
        )

