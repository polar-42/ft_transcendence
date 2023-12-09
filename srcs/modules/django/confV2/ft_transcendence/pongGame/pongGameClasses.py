BALL_HEIGHT = 10
BALL_WIDTH = 10
PLAYER_HEIGHT = 60
PLAYER_WIDTH = 8
PLAYGROUND_HEIGHT = 450
PLAYGROUND_WIDHT = 720

class Ball:
    def __init__(self):
        self.x = PLAYGROUND_WIDHT / 2 - BALL_WIDTH / 2
        self.y = PLAYGROUND_HEIGHT / 2 - BALL_HEIGHT / 2
        self.height = BALL_HEIGHT
        self.width = BALL_WIDTH
        self.speed = 4
        self.gravity = 4

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
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.height = PLAYER_HEIGHT
        self.width = PLAYER_WIDTH
        self.gravity = 4

    def move_up(self):
        i = 0
        while i < self.gravity:
            if self.y - 1 > 0:
                self.y = self.y - 1
            i = i + 1

    def move_down(self):
        i = 0
        while i < self.gravity:
            if self.y + 1 + self.height < PLAYGROUND_HEIGHT:
                self.y = self.y + 1
            i = i + 1

    def get_pos(self):
        return self.x, self.y


class GameState:
    def __init__(self):
        self.ball = Ball()
        self.playerOne = Player(10, (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2))
        self.playerTwo = Player(PLAYGROUND_WIDHT - PLAYER_WIDTH - 10, (PLAYGROUND_HEIGHT / 2) - (PLAYER_HEIGHT / 2))

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

    def get_ball(self):
        return self.ball

    def get_players(self):
        return self.playerOne, self.playerTwo
