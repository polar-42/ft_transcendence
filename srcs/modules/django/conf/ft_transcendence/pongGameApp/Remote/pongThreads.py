import threading, json, random, math, time
from channels.layers import get_channel_layer
from .. import pongGameClasses
from asgiref.sync import async_to_sync
from enum import IntEnum
from . import pongGameManager

class GameState(IntEnum):
	RequestBoat = -1
	Initialisation = 0
	BoatPlacement = 1
	Playing = 2
	RequestHit = 4
	Ending = 3

class ConnexionState(IntEnum):
	NeverConnected = 0
	Connected = 1
	Disconnected = 2

class GameType(IntEnum):
	Normal = 0
	Tournament = 1

class GameEndReason(IntEnum):
	Disconnected = 0
	GiveUp = 1
	Win = 2

class pongGameLoop(threading.Thread):

    def __init__(self, current, users):
        super().__init__()
        self.pong = current
        self.game = pongGameClasses.GameState(users)
        self.stop_flag = threading.Event()
        self.startGameBool = False

    def run_async(self):
        x = 0
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

                if sec <= 0:
                    sec = 3
                    y = 0
                    self.startGameBool = True

            else:

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

                #BALL COLLISION WITH PLAYER2 MAYBE TO CHANGE
                elif ball_pos_y + ball_gravity <= player2_pos_y + 60 and ball_pos_y + ball_gravity >= player2_pos_y and ball_pos_x + 10 + ball_speed >= player2_pos_x:

                    relative_intersect_y = (ball_pos_y + 10 * 2) - (player2_pos_y + 60 / 2)
                    normalized_relative_intersect_y = relative_intersect_y / (60 / 2)
                    bounce_angle = normalized_relative_intersect_y * (math.pi / 4)

                    ball_speed = -4
                    if ball_gravity > 0:
                        ball_gravity = -4
                    else:
                        ball_gravity = 4

                    ball_speed = ball_speed * math.cos(bounce_angle)
                    ball_gravity = ball_gravity * -math.sin(bounce_angle)

                    total_speed = abs(ball_speed) + abs(ball_gravity)
                    ball_speed = (ball_speed / total_speed) * 8
                    ball_gravity = (ball_gravity / total_speed) * 8

                    self.game.update_ball_touch(2)

                #BALL COLLISION WITH PLAYER1 MAYBE TO CHANGE
                elif ball_pos_y + ball_gravity >= player1_pos_y and ball_pos_y + ball_gravity <= player1_pos_y + 60 and ball_pos_x + ball_speed <= player1_pos_x + 8:

                    relative_intersect_y = (ball_pos_y + 10 * 2) - (player1_pos_y + 60 / 2)
                    normalized_relative_intersect_y = relative_intersect_y / (60 / 2)
                    bounce_angle = normalized_relative_intersect_y * (math.pi / 4)

                    ball_speed = 4
                    if ball_gravity > 0:
                        ball_gravity = -4
                    else:
                        ball_gravity = 4

                    ball_speed = ball_speed * math.cos(bounce_angle)
                    ball_gravity = ball_gravity * -math.sin(bounce_angle)

                    total_speed = abs(ball_speed) + abs(ball_gravity)
                    ball_speed = (ball_speed / total_speed) * 8
                    ball_gravity = (ball_gravity / total_speed) * 8

                    self.game.update_ball_touch(1)
                #UPDATE SCORE PLAYER1
                elif ball_pos_x + ball_speed <= 0:
                    player1_score = player1_score + 1
                    ball_pos_x = 355
                    ball_pos_y = 195
                    self.game.update_score(2)
                    self.startGameBool = False

                    #RAND TO GET BACK TO GAME
                    if random.randint(1, 2) == 1:
                        ball_speed = 4
                    else:
                        ball_speed = -4
                    if random.randint(1, 2) == 1:
                        ball_gravity = 4
                    else:
                        ball_gravity = -4

                #UPDATE SCORE PLAYER2
                elif ball_pos_x + ball_speed + 10 >= 720:
                    player2_score = player2_score + 1
                    ball_pos_x = 355
                    ball_pos_y = 195
                    self.game.update_score(1)
                    self.startGameBool = False

                    #RAND TO GET BACK TO GAME
                    if random.randint(1, 2) == 1:
                        ball_speed = 4
                    else:
                        ball_speed = -4
                    if random.randint(1, 2) == 1:
                        ball_gravity = 4
                    else:
                        ball_gravity = -4

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

                send_data_async(self.pong, self.game)

                time.sleep(0.03)

                #print('in game loop, x =', x)
                x = x + 1

    def run(self):
        self.run_async()

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

    def stop_game(self):
        self.isGameRunning = False

    def stop(self):
        self.stop_flag.set()

def send_data_async(ping_game_instance, game):
    ping_game_instance.sendDataFromGame(game)


def send_timer_async(ping_game_instance, game, sec):
    ping_game_instance.sendTimerFromGame(game, sec)

class UserPong():
    def __init__(self, user):
        self.sock_user = user
        self.connexionStatus = ConnexionState.NeverConnected
        self.id = user.id
        self.socket = None
        self.username = str(user)

class StatGame():
    def __init__(self, p1_id, p2_id, p1_score, p2_score, p1_n_ball_touch, p2_n_ball_touch, reason, idTournament=-1):
        self.p1_id = p1_id
        self.p2_id = p2_id
        self.p1_score = p1_score
        self.p2_score = p2_score
        self.p1_n_ball_touch = p1_n_ball_touch
        self.p2_n_ball_touch = p2_n_ball_touch
        self.reason = reason
        self.idTournament = idTournament

class pongGame():
    is_running = False
    channelName = ""

    def __init__(self, user1, user2, gameId, tournament):
        self.channel_layer = get_channel_layer()
        self.gameStatus = GameState.Initialisation
        self.users = [UserPong(user1), UserPong(user2)]
        self.tournament = tournament
        self.channelName = gameId
        self.Status = GameState.Playing

    def getUser(self, user):
        if (user.id == self.users[0].sock_user.id):
            return self.users[0]
        elif user.id == self.users[1].sock_user.id:
            return self.users[1]
        return None

    def connectUser(self, user, socket):
        findedUser = self.getUser(user)
        if findedUser is None or findedUser.connexionStatus != ConnexionState.NeverConnected:
            return
        findedUser.connexionStatus = ConnexionState.Connected
        findedUser.socket = socket
        if self.users[0].connexionStatus == ConnexionState.Connected and self.users[1].connexionStatus == ConnexionState.Connected:
            if self.gameStatus == GameState.Initialisation:
                self.startGame()

    def disconnectUser(self, user):
        findedUser = self.getUser(user)
        if findedUser is None:
            return
        findedUser.connexionStatus = ConnexionState.Disconnected

    def startGame(self):
        self.mythread = pongGameLoop(self, self.users)
        self.mythread.start()

    def finishGame(self):
        self.mythread.stop()

    def sendTimerFromGame(self, pongGame, secondLeft):
        game = pongGame.get_ball()
        ball_pos_x, ball_pos_y = game.get_pos()

        player1, player2 = pongGame.get_players()
        player1_pos_x, player1_pos_y = player1.get_pos()
        player2_pos_x, player2_pos_y = player2.get_pos()

        player1_score = player1.get_score()
        player2_score = player2.get_score()

        for x in self.users:
            x.socket.send(text_data=json.dumps({
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

        for x in self.users:
            x.socket.send(text_data=json.dumps({
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
                self.winner = self.users[0]
            else:
                self.winner = self.users[1]

            p1 = player1.get_player()
            p2 = player2.get_player()

            self.stat = StatGame(p1.id, p2.id, player1_score, player2_score, number_ball_touch_player1, number_ball_touch_player2, 'score')

            if self.tournament is None:
                async_to_sync(self.channel_layer.group_send)(
                    self.channelName,
                    {
                        'type': 'end_game_by_score',
                        'winner': self.winner.username,
                        'playerone_username': p1.username,
                        'playertwo_username': p2.username,
                        'playerone_score': player1_score,
                        'playertwo_score': player2_score,
                        'number_ball_touch_player1': number_ball_touch_player1,
                        'number_ball_touch_player2': number_ball_touch_player2,
                    }
                )

            else:
                self.stat.idTournament = self.tournament.TournamentId
                self.tournament.HandleResult(self.winner.sock_user.id)
                for x in self.users:
                    x.socket.send(text_data=json.dumps({
                        'type': 'return_to_tournament',
                        'id': self.tournament.TournamentId,
                    }))
                    x.socket.close()
                    x.socket.close()

            if self.Status is GameState.Ending:
                return
            self.Status = GameState.Ending
            pongGameManager.Manager.closeGame(self.channelName)

    def inputGame(self, input, player):
        i = 0
        for x in self.users:
            if x.socket == player:
                self.mythread.inputGame(input, i)
            i = i + 1

    def quitGame(self, player):
        if self.Status is not GameState.Playing:
            return

        self.Status = GameState.Ending

        print('player', player.user, 'leave the game')
        if player.id == self.users[0].id:
            p1_score = 0
            p2_score = 3
        else:
            p1_score = 3
            p2_score = 0

        if self.tournament is not None:
            tournamentId = self.tournament.TournamentId
        else:
            tournamentId = -1

        self.stat = StatGame(self.users[0].id, self.users[1].id, p1_score, p2_score, p1_score, p2_score, 'disconnexion', tournamentId)

        if player == self.users[0].socket:
            self.winner = self.users[1]
        else:
            self.winner = self.users[0]

        pongGameManager.Manager.closeGame(self.channelName)

        if self.tournament is not None:
            self.tournament.HandleResult(self.winner.sock_user.id)

            self.winner.socket.send(text_data=json.dumps({
                'type': 'return_to_tournament',
                'id': self.tournament.TournamentId,
            }))

            self.winner.socket.close()
        else:
            self.winner.socket.send(text_data=json.dumps({
                'type': 'game_ending',
				'winner': str(self.winner.sock_user),
				'reason': 'disconnexion',
				'playerone_score': 3,
				'playertwo_score': 0,
				'playerone_username': str(self.winner.sock_user),
				'playertwo_username': str(player),
            }))

