import threading, json, random, math, asyncio, time
from channels.layers import get_channel_layer
from .. import pongGameClasses
from .PongIA import pongGameIA
from asgiref.sync import async_to_sync, sync_to_async
from enum import IntEnum
from pongGameApp.pongGameClasses import randomDir


class ConnexionState(IntEnum):
	NeverConnected = 0
	Connected = 1
	Disconnected = 2

class pongGameLoop(threading.Thread):

    def __init__(self, current, socket):
        super().__init__()
        self.pong = current
        tab = [socket, None]
        self.game = pongGameClasses.GameState(tab)
        self.isGameRunning = False
        self.stop_flag = threading.Event()
        self.startGameBool = False
        self.threadIA = None
        self.isThreadRunning = False

    def run_async(self):
        send_data_ia_async(self.pongThreadIA, self.game, self.isThreadRunning)
        x = 30
        y = 0
        sec = 3
        while not self.stop_flag.is_set():
            if self.startGameBool == False:

                send_timer_async(self.pong, self.game, sec)
                time.sleep(0.03)

                y += 1

                if y > 30:
                    sec -= 1
                    y = 0
                    send_data_ia_async(self.pongThreadIA, self.game, self.isThreadRunning)

                if sec <= 0:
                    sec = 3
                    y = 0
                    self.startGameBool = True

            else:
                self.isThreadRunning = True
                self.game.move_players()
                game = self.game.get_ball()
                ball_pos_x, ball_pos_y = game.get_pos()
                ball_dx, ball_dy = game.get_direction()
                ball_speed = game.get_speed()
                player1, player2 = self.game.get_players()                
                player1_pos_x, player1_pos_y = player1.get_pos()
                player2_pos_x, player2_pos_y = player2.get_pos()

                player1_score = player1.get_score()
                player2_score = player2.get_score()

         	    #BALL COLISIONS WITH WALLS
                if not( 3.8 - 0.15 >= ball_pos_y + ball_dy * ball_speed >= -3.8 + 0.15) :
                    ball_dy *= -1

                #BALL COLLISION WITH PLAYER2
                elif (player2_pos_y + 1.07 >= ball_pos_y >= player2_pos_y - 1.07 and ball_pos_x >= player2_pos_x - 0.25) :
                    ball_dx *= -1
                    ball_dy = ball_pos_y - player2_pos_y
                    ball_pos_x = player2_pos_x - 0.17
                    ball_speed *= 1.08
                    self.game.update_ball_touch(2)

                #BALL COLLISION WITH PLAYER1
                elif (player1_pos_y + 1.07 >= ball_pos_y >= player1_pos_y - 1.07     and ball_pos_x <= player1_pos_x + 0.25) :
                    ball_dx *= -1
                    ball_dy = ball_pos_y - player1_pos_y
                    ball_pos_x = player1_pos_x + 0.17
                    ball_speed *= 1.08
                    self.game.update_ball_touch(1)
                    
                #UPDATE SCORE PLAYER1
                elif (ball_pos_x >= player2_pos_x) :
                    player1_score = player1_score + 1
                    ball_pos_x = 0
                    ball_pos_y = 0
                    ball_speed = 0.1
                    ball_dx, ball_dy = randomDir()
                    self.game.update_score(1)
                    self.startGameBool = False
                    self.game.update_ball_speed(0.1)

                #UPDATE SCORE PLAYER2
                elif (ball_pos_x <= player1_pos_x) :
                    player2_score = player2_score + 1
                    ball_pos_x = 0
                    ball_pos_y = 0
                    ball_speed = 0.1
                    ball_dx, ball_dy = randomDir()
                    self.game.update_score(2)
                    self.startGameBool = False
                    self.game.update_ball_speed(0.1)
                #BALL MOVEMENT

                ball_pos_y += ball_dy * ball_speed
                ball_pos_x += ball_dx * ball_speed
                self.game.update_ball_direction(ball_dx, ball_dy)
                self.game.update_ball_pos(ball_pos_x, ball_pos_y)
                self.game.update_ball_speed(ball_speed)
                send_data_async(self.pong, self.game)

                time.sleep(0.03)

                if x >= 2:
                    send_data_ia_async(self.pongThreadIA, self.game, self.isThreadRunning)
                    x = 0
                x = x + 1

    def run(self):
        self.run_async()

    def start_game(self, pongThreadIA):
        self.isGameRunning = True
        self.pongThreadIA = pongThreadIA

    def inputGame(self, input, player):
        if input == 'ArrowUp':
            if player == 0:
                self.game.playerOne.change_dy(0.2)
            else:
                self.game.playerTwo.change_dy(0.2)
        elif input == 'ArrowDown':
            if player == 0:
                self.game.playerOne.change_dy(-0.2)
            else:
                self.game.playerTwo.change_dy(-0.2)
        elif (input == 'StopMovementUp'):
            if player == 0 and self.game.playerOne.get_dy() == 0.2:
                self.game.playerOne.change_dy(0)
            elif self.game.playerTwo.get_dy() == 0.2:
                self.game.playerTwo.change_dy(0)
        elif (input == 'StopMovementDown'):
            if player == 0 and self.game.playerOne.get_dy() == -0.2:
                self.game.playerOne.change_dy(0)
            elif self.game.playerTwo.get_dy() == -0.2:
                self.game.playerTwo.change_dy(0)

    def stop_game(self):
        self.isGameRunning = False

    def stop(self):
        self.stop_flag.set()

def send_data_async(ping_game_instance, game):
    ping_game_instance.sendDataFromGame(game)

def send_data_ia_async(threadIA, game, isRunning):
    threadIA.receiveDataFromGameIA(game, isRunning)

def send_timer_async(ping_game_instance, game, sec):
    ping_game_instance.sendTimerFromGame(game, sec)


class UserPong():
    def __init__(self, user):
        self.sock_user = user
        self.connexionStatus = ConnexionState.NeverConnected
        self.id = user.id
        self.socket = None
        self.username = user.user.nickname + '-' + str(user.user.id)

class pongGame():
    is_running = False
    channelName = ""

    def __init__(self):
        self.channel_layer = get_channel_layer()

    def launchGame(self, channelName, socket):
        self.socket = socket
        if channelName != '':
            self.mythread = pongGameLoop(self, UserPong(socket))
            self.pongThreadIA = pongGameIA(self.mythread)

            print('pong between AI and', self.socket.user.nickname,'on channel (', channelName, ') is launch')

            self.channelName = channelName

            self.mythread.start_game(self.pongThreadIA)
            self.mythread.start()
            self.pongThreadIA.start_game()
            self.pongThreadIA.start()

    def finishGame(self):
        self.mythread.stop()
        self.mythread.join()
        self.pongThreadIA.stop()
        self.pongThreadIA.join()

    def sendTimerFromGame(self, pongGame, secondLeft):
        game = pongGame.get_ball()
        ball_pos_x, ball_pos_y = game.get_pos()

        player1, player2 = pongGame.get_players()
        player1_pos_x, player1_pos_y = player1.get_pos()
        player2_pos_x, player2_pos_y = player2.get_pos()

        player1_score = player1.get_score()
        player2_score = player2.get_score()

        self.socket.send(text_data=json.dumps({
            'type': 'game_timer',
    		'ball_pos_x': ball_pos_x,
            'ball_pos_y': ball_pos_y,
            'playerone_pos_y': player1_pos_y,
            'playertwo_pos_y': player2_pos_y,
            'playerone_score': player1_score,
            'playertwo_score': player2_score,
            'second_left': secondLeft,
        }))

    def sendDataFromGame(self, pongGame):
        game = pongGame.get_ball()
        ball_pos_x, ball_pos_y = game.get_pos()

        player1, player2 = pongGame.get_players()
        player1_pos_x, player1_pos_y = player1.get_pos()
        player2_pos_x, player2_pos_y = player2.get_pos()

        player1_score = player1.get_score()
        player2_score = player2.get_score()
        number_ball_touch_player1 = player1.get_ball_touch()
        number_ball_touch_player2 = player2.get_ball_touch()

        self.socket.send(text_data=json.dumps({
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
                winner = player1.player_id
            else:
                winner = 'AI'

            async_to_sync(self.channel_layer.group_send)(
                self.channelName,
                {
                    'type': 'end_game_by_score',
                    'winner': winner,
                    'playerone_score': player1_score,
                    'playertwo_score': player2_score,
                    'number_ball_touch_player1': number_ball_touch_player1,
                    'number_ball_touch_player2': number_ball_touch_player2,
                }
            )

    def inputGame(self, input, player):
        self.mythread.inputGame(input, 0)

    def quitGame(self, player):
        print('player', player.user.nickname, 'leave the game')

        self.mythread.stop()
        self.mythread.join()
        self.pongThreadIA.stop()
        self.pongThreadIA.join()
