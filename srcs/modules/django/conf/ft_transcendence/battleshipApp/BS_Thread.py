import threading, time
from .BS_Enum import GameState
from ft_transcendence import ColorPrint

class GameLoop(threading.Thread):
	def __init__(self, current) :
		super().__init__()
		self.match = current
		self.stopFlag = threading.Event()

	def run(self):
		while not self.stopFlag.is_set():
			if self.match.currentTimer != -1:
				self.match.currentTimer -= 1
				# ColorPrint.prGreen("Debug! GAME {gID}: Timer : {curTime}.".format(gID=self.match.gameId, curTime=self.match.currentTimer))
				if self.match.Gamestatus is GameState.Ending:
					self.match.CloseGame()
					return
				time.sleep(1)

			if  self.match.currentTimer == 0:
				self.match.ForceStep()
				if self.match.Gamestatus is GameState.Ending:
					self.match.CloseGame()
					return

	def stop(self):
		self.stopFlag.set()