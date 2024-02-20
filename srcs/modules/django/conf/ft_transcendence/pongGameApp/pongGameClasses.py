import random
import math


BALL_HEIGHT = 10
BALL_WIDTH = 10
PLAYER_HEIGHT = 60
PLAYER_WIDTH = 8
PLAYGROUND_HEIGHT = 450
PLAYGROUND_WIDHT = 720

def normalise (dx, dy):
    length = math.sqrt(dx ** 2 + dy ** 2)
    return (dx / length, dy / length)

def randomDir():
    dx = random.random() - 0.5
    dy = dx * (random.random() - 0.5)
    return dx, dy

class Ball:
    def __init__(self):
        self.x = 0.
        self.y = 0.
        self.dx, self.dy = randomDir()
        self.dx, self.dy = normalise(self.dx, self.dy)
        self.effect = 0
        self.speed = 0.1
        self.radius = 0.15

    def change_speed(self, speed):
        self.speed = speed
    def change_effect(self, effect):
        self.effect = effect

    def change_direction(self, dx, dy):
        self.dx = dx
        self.dy = dy

    def change_position(self, x, y):
        self.x = x
        self.y = y

    def get_speed(self):
        return self.speed
    def get_direction(self):
        return self.dx, self.dy
    def get_effect(self):
        return self.effect
    def get_pos(self):
        return self.x, self.y


class Player:
    def __init__(self, x, y, player_id):
        self.player_id = player_id
        self.score = 0
        self.ball_touch = 0
        self.x = x
        self.y = y
        self.height = 2.
        self.width = 0.2
        self.dy = 0

    def change_dy(self, dy):
        self.dy = dy

    def get_dy(self):
        return self.dy

    def change_pos(self, dy):
        if (-2.7 <= self.y + dy <= 2.7):
            self.y += dy

    def add_point(self):
        self.score = self.score + 1

    def add_ball_touch(self):
        self.ball_touch = self.ball_touch + 1

    def get_pos(self):
        return self.x, self.y

    def reset_pos(self):
        self.y = 0

    def get_score(self):
        return self.score

    def get_id(self):
        return self.player_id

    def get_ball_touch(self):
        return self.ball_touch


class GameState:
    def __init__(self, players):
        self.ball = Ball()
        self.playerOne = Player(-5., 0, players[0])
        self.playerTwo = Player(5., 0, players[1])

    def move_players(self):
        self.playerOne.change_pos(self.playerOne.dy)
        self.playerTwo.change_pos(self.playerTwo.dy)

    def update_ball_direction(self, dx, dy):
        dx, dy = normalise(dx, dy)
        self.ball.change_direction(dx, dy)

    def update_ball_speed(self, speed):
        self.ball.speed = speed

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

    def update_ball_effect(self, effect):
        self.ball.change_effect(effect)

    def get_ball(self):
        return self.ball

    def get_players(self):
        return self.playerOne, self.playerTwo
