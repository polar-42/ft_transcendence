from ft_transcendence import ColorPrint
from .BS_Enum import ConnexionState
from .BS_Boat import Boat

class User():
	def __init__(self, user):
		self.BoatHit = 0
		self.HitTry = 0
		self.DestroyedBoat = 0
		self.HitTaken = 0
		self.BoatList = []
		self.sock_user = user
		self.Name = self.sock_user.nickname
		self.ConnexionStatus = ConnexionState.NeverConnected
		return

	def SendMessage(self, msg):
		if (self.ConnexionStatus != ConnexionState.Connected):
			ColorPrint.prYellow("Warning! Trying to send message to not connected user : {username}.".format(username=self.Name))
			return
		if (self.socket == None):
			ColorPrint.prRed("Error! Trying to send message to user : {username} with None socket.".format(username=self.Name) )
			return
		if self.socket.Connected == False:
				return
		(self.socket.send)(text_data=msg)

	def ParseBoats(self, boatsList):
		if (len(self.BoatList) != 0):
			self.BoatList.clear()
			return
		else:
			for boat in boatsList:
				ori = 'H' if boat['horizontal'] is True else 'V'
				if (boat['ArrayX'] < 0 or boat['ArrayY'] < 0):
					return False
				self.BoatList.append(Boat(boat['name'], boat['size'], ori, boat['ArrayX'], boat['ArrayY']))
		return True

	def Hit(self, case):
		result = 0
		pos = 0
		for boat in self.BoatList:
			result = boat.Hit(case['ArrayPosX'], case['ArrayPosY'])
			if (result > 0):
				self.HitTaken += 1
				return result if result == 1 else result + pos
			pos += 1
		return False

	def CountDestroyedBoats(self):
		count = 0
		for boat in self.BoatList:
			if (len(boat.BoatArray) == len(boat.HittedArray)):
				count += 1
		return count

	def checkPlayerBoats(self):
		count = 0
		for boat in self.BoatList:
			if (len(boat.BoatArray) == len(boat.HittedArray)):
				count += 1
		return (count == len(self.BoatList))
	
	def RetrieveBoatResult(self):
		boatResult = []
		for boat in self.BoatList:
			boatResult.append(boat.GetBoatStatus())
		return boatResult
