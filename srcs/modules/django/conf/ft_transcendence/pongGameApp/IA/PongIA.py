import threading, asyncio, time

class pongGameIA(threading.Thread):

	def __init__(self, gameThread):
		super().__init__()
		self.stop_flag = threading.Event()
		self.isRunning = False
		self.gameThread = gameThread

	def run_ia_async(self):
		while not self.stop_flag.is_set():

			if self.isRunning is True:

				if self.ball_pos_y < self.ia_pos_y - 0.7:
					self.gameThread.inputGame('ArrowDown', 1)
					if self.ia_pos_y - 0.2 < 2.7:
						self.ia_pos_y -= 0.2
				elif self.ball_pos_y > self.ia_pos_y + 0.7:
					self.gameThread.inputGame('ArrowUp', 1)
					if self.ia_pos_y + 0.2 > -2.7:
						self.ia_pos_y += 0.2
				else:
					self.gameThread.inputGame('StopMovementDown', 1)
					self.gameThread.inputGame('StopMovementUp', 1)

				print('self.ia_pos_y =', self.ia_pos_y, 'self.ball_pos_y =', self.ball_pos_y)

			time.sleep(0.03)

	def run(self):
		self.run_ia_async()

	def stop(self):
		self.stop_flag.set()

	def start_game(self):
		self.ball_dy = 0
		self.ball_dx = 0
		self.ball_pos_x = 0
		self.ball_pos_y = 0
		self.ia_pos_y = 0
		self.ia_pos_x = 4
		self.ball_speed = 0

	def receiveDataFromGameIA(self, game, isRunning):
		self.isRunning = isRunning
		ball = game.get_ball()

		self.ball_pos_x, self.ball_pos_y = ball.get_pos()
		self.ball_dx, self.ball_dy = ball.get_direction()
		self.ball_speed = ball.get_speed()

		i = 0
		while i < 30:
			if not(3.8 - 0.15 >= self.ball_pos_y + self.ball_dy * self.ball_speed >= -3.8 + 0.15):
				self.ball_dy *= -1

			self.ball_pos_y += self.ball_dy * self.ball_speed
			self.ball_pos_x += self.ball_dx * self.ball_speed
			i += 1

		player, ia = game.get_players()
		ia_pos_x, self.ia_pos_y = ia.get_pos()
