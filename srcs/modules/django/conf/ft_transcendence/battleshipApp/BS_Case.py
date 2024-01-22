class Case():

	def __init__(self, x, y):
		self.PosX = x
		self.PosY = y
		pass
	def __str__(self) -> str:
		return "posX = " + str(self.PosX) + " PosY = " + str(self.PosY)