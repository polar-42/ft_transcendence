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

				if self.ball_pos_y < self.ia_pos_y - 0.9:
					self.gameThread.inputGame('ArrowDown', 1)
				elif self.ball_pos_y > self.ia_pos_y + 0.9:
					self.gameThread.inputGame('ArrowUp', 1)
				else:
					self.gameThread.inputGame('StopMovementDown', 1)
					self.gameThread.inputGame('StopMovementUp', 1)

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
		self.ia_pos_x = 4.

	def receiveDataFromGameIA(self, game, isRunning):
		self.isRunning = isRunning
		gameState = game.get_ball()

		ball_pos_x, self.ball_pos_y = gameState.get_pos()
		player, ia = game.get_players()
		ia_pos_x, self.ia_pos_y = ia.get_pos()
