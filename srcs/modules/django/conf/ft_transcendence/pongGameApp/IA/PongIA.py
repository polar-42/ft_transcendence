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

				if self.ball_pos_y < self.ia_pos_y:
					self.gameThread.inputGame('ArrowDown', 1)
					self.ia_pos_y -= 0.1
					if self.ia_pos_y < -3.:
						self.ia_pos_y = -3.
				elif self.ball_pos_y > self.ia_pos_y:
					self.gameThread.inputGame('ArrowUp', 1)
					self.ia_pos_y += 0.1
					if self.ia_pos_y > 3.:
						self.ia_pos_y = 3.

				self.ball_pos_y += self.ball_gravity

				if self.ball_pos_y < -4. or self.ball_pos_y >= 4:
					self.ball_gravity *= -1

			else:
				if self.ia_pos_y + 0.1 < -3.:
					self.gameThread.inputGame('ArrowUP', 1)
					self.ia_pos_y += 0.1
				elif self.ia_pos_y - 0.1 > 3.:
					self.gameThread.inputGame('ArrowDown', 1)
					self.ia_pos_y -= 0.1


			time.sleep(0.03)

	def run(self):
		self.run_ia_async()

	def stop(self):
		self.stop_flag.set()

	def start_game(self):
		self.ball_gravity = 0
		self.ball_speed = 0
		self.ball_pos_y = 0
		self.ia_pos_y = 0
		self.player_pos_y = 0

	def receiveDataFromGameIA(self, game, isRunning):
		self.isRunning = isRunning
		gameState = game.get_ball()

		ball_pos_x, self.ball_pos_y = gameState.get_pos()
		self.ball_gravity, self.ball_speed = gameState.get_gravity_speed()

		player, ia = game.get_players()
		player_pos_x, self.player_pos_y = player.get_pos()
		ia_pos_x, self.ia_pos_y = ia.get_pos()
		self.ia_pos_y += 0.1
		self.ball_pos_y += 0.1
