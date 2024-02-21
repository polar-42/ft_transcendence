import json
from channels.generic.websocket import WebsocketConsumer
from . import matchmakingThreads
from asgiref.sync import async_to_sync

pongMatchmaking = matchmakingThreads.pongMatchmaking()

class pongMatchmakingSocket(WebsocketConsumer):

	def connect(self):
		self.user = self.scope['user']
		self.id = self.user.id
		if pongMatchmaking.AddUser(self.user) == True:
			self.accept()
		else:
			self.close(3005)
			return

		async_to_sync(self.channel_layer.group_add)(
			pongMatchmaking.channelName,
			self.channel_name
		)

	def disconnect(self, close_code):
		if close_code != 1006:
			if pongMatchmaking.RemoveUser(self.user) == True:
				print(f"Pong matchmaking user: {self.user} is disconnected")
	
			async_to_sync(self.channel_layer.group_discard)(
				pongMatchmaking.channelName,
				self.channel_name
			)

	def receive(self, text_data):
		data = json.loads(text_data)

	def joinGame(self, event):
		if (self.user.id == event['user1'] or self.user.id == event['user2']):
			self.send(text_data=json.dumps({
				'gameId': event['gameId']
			}))
			self.close()
