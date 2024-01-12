import random

BALL_HEIGHT = 10
BALL_WIDTH = 10
PLAYER_HEIGHT = 60
PLAYER_WIDTH = 0.1
PLAYGROUND_HEIGHT = 450
PLAYGROUND_WIDHT = 720

class Ball:
    def __init__(self):
        self.x = 0.
        self.y = 0.
        self.height = 0.15
        self.width = 0.15
        if random.randint(1, 2) == 1:
            self.speed = 0.1
        else:
            self.speed = -0.1
        if random.randint(1, 2) == 1:
            self.gravity = 0.1
        else:
            self.gravity = -0.1

    def change_speed(self, speed):
        self.speed = speed

    def change_gravity(self, gravity):
        self.gravity = gravity

    def change_position(self, x, y):
        self.x = x
        self.y = y

    def get_gravity_speed(self):
        return self.gravity, self.speed

    def get_pos(self):
        return self.x, self.y


class Player:
    def __init__(self, x, y, player_id):
        self.player_id = player_id
        self.score = 0
        self.ball_touch = 0
        self.x = x
        self.y = y
        self.height = PLAYER_HEIGHT
        self.width = PLAYER_WIDTH
        self.gravity = 0.1

    def move_down(self):
        i = 0
        while i < self.gravity:
            if self.y - 0.1 > -3.:
                self.y = self.y - 0.1
            i = i + 1

    def move_up(self):
        i = 0
        while i < self.gravity:
            if self.y + 0.1 < 3.:
                self.y = self.y + 0.1
            i = i + 1

    def add_point(self):
        self.score = self.score + 1

    def add_ball_touch(self):
        self.ball_touch = self.ball_touch + 1

    def get_pos(self):
        return self.x, self.y

    def get_score(self):
        return self.score

    def get_id(self):
        return self.player_id

    def get_ball_touch(self):
        return self.ball_touch


class GameState:
    def __init__(self, players):
        self.ball = Ball()
        self.playerOne = Player(4., 0, players[0])
        self.playerTwo = Player(-4., 0, players[1])

    def move_up_player1(self):
        self.playerOne.move_up()

    def move_down_player1(self):
        self.playerOne.move_down()

    def move_up_player2(self):
        self.playerTwo.move_up()

    def move_down_player2(self):
        self.playerTwo.move_down()

    def update_ball_gravity_speed(self, gravity, speed):
        self.ball.change_gravity(gravity)
        self.ball.change_speed(speed)

    def update_ball_pos(self, x, y):
        self.ball.change_position(x, y)

    def update_score(self, player):
        if player == 1:
            self.playerOne.add_point()
        elif player == 2:
            self.playerTwo.add_point()

    def update_ball_touch(self, player):
        if player == 1:
            self.playerOne.add_ball_touch()
        elif player == 2:
            self.playerTwo.add_ball_touch()

    def get_ball(self):
        return self.ball

    def get_players(self):
        return self.playerOne, self.playerTwo
