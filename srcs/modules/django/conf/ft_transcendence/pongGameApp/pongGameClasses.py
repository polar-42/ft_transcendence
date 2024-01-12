import random
import math

def normalise (dx, dy)
    length = sqrt(dx ** 2 + dy ** 2)
    return (dx / length, dy / length)

class Ball:
    def __init__(self):
        self.x = 0.
        self.y = 0.
        self.dx = randomDir()
        self.dy = randomDir()
        self.dx, self.dy = normalise(self.dx, self.dy)
        self.speed = 0.1
        self.radius = 0.15

    def randomDir(self)
        if random.randint(1, 2) == 1:
            return 1
        return -1

    def change_speed(self, speed)
        self.speed = speed

    def change_direction(self, dx, dy)
        self.dx = dx
        self.dy = dy

    def change_position(self, x, y):
        self.x = x
        self.y = y

    def get_speed(self)
        return speed
    def get_direction(self):
        return self.dx, self.dy

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
        self.speed = 0.1

    def move_down(self):
        if self.y - self.speed > -3.:
            self.y = self.y - 0.1

    def move_up(self):
        if self.y + self.speed < 3.:
            self.y = self.y + 0.1

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

    def update_ball_direction(self, dx, dy):
        self.dx, self.dy = normalise(dx, dy)

    def update_ball_speed(self, speed)
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

    def get_ball(self):
        return self.ball

    def get_players(self):
        return self.playerOne, self.playerTwo
