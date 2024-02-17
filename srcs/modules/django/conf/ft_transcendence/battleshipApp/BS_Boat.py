from .BS_Case import Case

class Boat():
	def __init__(self, name, size, orientation, posX, posY):
		self.Name = name
		self.BoatArray = []
		self. HittedArray = []
		while size > 0:
			if (orientation == 'V'):
				self.BoatArray.append(Case(posX, posY + size - 1))
			else:
				self.BoatArray.append(Case(posX + size - 1, posY))
			size -= 1

	def Hit(self, posX, posY):
		for case in self.BoatArray:
			if case.PosX == posX and case.PosY == posY:
				if self.HittedArray.__contains__(case) == True:
					return 0
				else:
					self.HittedArray.append(case)
					if (len (self.HittedArray) == len (self.BoatArray)):
						return 2
					return 1
		return 0

	def GetBoatStatus(self):
		return (len (self.HittedArray) == len (self.BoatArray))
