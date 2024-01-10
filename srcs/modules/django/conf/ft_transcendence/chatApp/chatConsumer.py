import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .enumChat import connexionStatus, channelPrivacy
from authApp import models as userModels
from .classChat import ChannelChat

def createGeneralChat(allChannels):
	allChannels["general"] = ChannelChat("general", channelPrivacy.Public, None)

class chatSocket(WebsocketConsumer):
	allChannels = {}

	def connect(self):
		if len(self.allChannels) <= 0:
			createGeneralChat(self.allChannels)

		self.username = self.scope['user']
		self.chatId = 'chat' + str(self.username)

		print(self.username, 'is connected to chat socket')

		userModels.User.objects.get(username=self.username).connexionStatus = connexionStatus.Connected

		tabChannels = userModels.User.objects.get(username=self.username).channels
		if tabChannels is not None:
			for chan in tabChannels:
				self.joinChannel(chan)
		else:
			self.joinChannel("general")

		async_to_sync(self.channel_layer.group_add)(
			self.chatId,
			self.channel_name
		)

		self.accept()

	def disconnect(self, code):
		userModels.User.objects.get(username=self.username).connexionStatus = connexionStatus.Disconnected

		async_to_sync(self.channel_layer.group_discard)(
			self.chatId,
			self.channel_name
		)

		async_to_sync(self.channel_layer.group_discard)(
			"generalChat",
			self.channel_name
		)

		self.close()

	def receive(self, text_data):
		data = json.loads(text_data)

		print(data)

		if data['type'] == 'chat_message':
			self.sendPrivateMessage(str(self.username), data['target'], data['message'])
		elif data['type'] == 'channel_message':
			self.sendChannelMessage(str(self.username), data['target'], data['message'])
		elif data['type'] == 'channel_join':
			self.joinChannel(data['target'])
		elif data['type'] == 'channel_leave':
			self.leaveChannel(data['target'])

	def joinChannel(self, channelName):
		if channelName not in self.allChannels:
			self.allChannels[channelName] = ChannelChat(channelName, channelPrivacy.Public, self)
		else:
			self.allChannels[channelName].joinChannel(self)


		tab = userModels.User.objects.get(username=str(self.username)).channels
		if tab is None:
			tab = []
		tab.append(channelName)
		userModels.User.objects.get(username=str(self.username)).channels = tab

		async_to_sync(self.channel_layer.group_add)(
			'channel' + channelName,
			self.channel_name
		)

	def leaveChannel(self, channelName):
		if channelName in self.allChannels:
			self.allChannels[channelName].leaveChannel(self)

	def sendPrivateMessage(self, sender, receiver, message):
		async_to_sync(self.channel_layer.group_send)(
            'chat' + receiver,
            {
                'type': 'chatPrivateMessage',
				'sender': sender,
				'message': message
            }
        )

	def sendChannelMessage(self, sender, channel, message):
		if channel in self.allChannels:
			self.allChannels[channel].sendMessage(sender, message)

	#CHANNEL LAYER FUNCTIONS
	def chatPrivateMessage(self, event):
		sender = event['sender']
		message = event['message']

		self.send(text_data=json.dumps({
    		'type': 'chat_private_message',
			'sender': sender,
			'message': message,
    	}))

	def chatChannelMessage(self, event):
		sender = event['sender']
		message = event['message']
		channel = event['channel']

		self.send(text_data=json.dumps({
    		'type': 'chat_channel_message',
			'channel': channel,
			'sender': sender,
			'message': message,
    	}))
