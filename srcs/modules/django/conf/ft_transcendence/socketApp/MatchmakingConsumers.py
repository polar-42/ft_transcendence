import asyncio
import json
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from . import BattleshipMatchmaking
from asgiref.sync import async_to_sync


Matchmake = BattleshipMatchmaking.Matchmaking()

class socket(WebsocketConsumer):

	def connect(self):
		self.user = self.scope['user']
		if Matchmake.AddUser(self.user) == True:
			self.accept()
		else:
			self.close()
			return

		async_to_sync(self.channel_layer.group_add)(
			Matchmake.channelName,
			self.channel_name
		)
		# print(f"Utilisateur connecté: {self.scope['user']}")


	def disconnect(self, close_code):
		if Matchmake.RemoveUser(self.user) == True:
			print(f"Utilisateur déconnecté: {self.user}")

	def receive(self, text_data):
		data = json.loads(text_data)

	def CreateGameMessage(self, event):
		if (self.user.id == event['user1'] or self.user.id == event['user2']):
			print ("Send message to " + self.user.username)
			(self.send)(text_data=json.dumps({
				'gameId': event['gameId']
			}))
			(self.close)()
			self.channel_layer.group_discard(
				Matchmake.channelName,
				self.channel_name
			)

