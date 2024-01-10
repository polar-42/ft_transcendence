import threading, time

class TimerLoop(threading.Thread):

	def __init__(self, manager):
		super().__init__()
		self.Manager = manager
		self.stopFlag = threading.Event()

	def run(self):
		while not self.stopFlag.is_set():
			for tournament in self.Manager._Tournaments.values():
				tournament.UpdateMatchsTimer()
			time.sleep(1)

	def stop(self):
		self.stopFlag.set()