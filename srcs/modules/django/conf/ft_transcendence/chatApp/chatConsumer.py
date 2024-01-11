import json, time
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .enumChat import connexionStatus, channelPrivacy
from authApp import models as userModels
from .classChat import ChannelChat
from .models import MessageModels
from django.db.models import Q


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

		userModels.User.objects.filter(username=self.username).update(connexionStatus=connexionStatus.Connected)

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

		self.sendHistoryTalk(tabChannels)

	def disconnect(self, code):
		userModels.User.objects.filter(username=self.username).update(connexionStatus=connexionStatus.Disconnected)

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

		print(data) #TO DEL

		if data['type'] == 'chat_message':
			self.sendPrivateMessage(str(self.username), data['target'], data['message'])
		elif data['type'] == 'channel_message':
			self.sendChannelMessage(str(self.username), data['target'], data['message'])
		elif data['type'] == 'channel_join':
			self.joinChannel(data['target'])
		elif data['type'] == 'channel_leave':
			self.leaveChannel(data['target'])
		elif data['type'] == 'block_user':
			self.blockUser(data['target'])
		elif data['type'] == 'unblock_user':
			self.unblockUser(data['target'])
		elif data['type'] == 'get_history_chat':
			self.getHistoryChat(data['target'])
		elif data['type'] == 'get_history_channel':
			self.getHistoryChannel(data['target'])

	def joinChannel(self, channelName):
		if channelName not in self.allChannels:
			#TO CHANGE FOR A CREATE CHANNEL BUTTON WITH OPTIONS
			self.allChannels[channelName] = ChannelChat(channelName, channelPrivacy.Public, self)
		else:
			self.allChannels[channelName].joinChannel(self)

		tab = userModels.User.objects.get(username=str(self.username)).channels
		if tab is None:
			tab = []

		if channelName not in tab:
			tab.append(channelName)
			userModels.User.objects.filter(username=str(self.username)).update(channels=tab)

		async_to_sync(self.channel_layer.group_add)(
			'channel' + channelName,
			self.channel_name
		)

	def leaveChannel(self, channelName):
		if channelName not in self.allChannels:
			return

		self.allChannels[channelName].leaveChannel(self)

		tab = userModels.User.objects.get(username=str(self.username)).channels
		if tab is not None and channelName in tab:
			tab.remove(channelName)
			userModels.User.objects.filter(username=str(self.username)).update(channels=tab)

		async_to_sync(self.channel_layer.group_discard)(
			'channel' + channelName,
			self.channel_name
		)

	def sendPrivateMessage(self, sender, receiver, message):
		if userModels.User.objects.filter(username=str(receiver)).exists() is False:
			return

		if self.isBlock(receiver):
			print(sender, 'try to send a message to', receiver, 'but he block him') #TO DEL
			return

		if self.isBlockBy(receiver):
			print(sender, 'try to send a message to user', receiver, 'who block him') #TO DEL
			return

		msg = MessageModels.objects.create(
			message=message,
			sender=str(sender),
			receiver=receiver
		)
		msg.save()

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
			tab = userModels.User.objects.get(username=str(self.username)).channels

			if tab is not None and channel in tab:
				self.allChannels[channel].sendMessageChannel(sender, message)
				print('message from', sender, 'to channel', channel, 'is', message) #TO DEL
				return #TO DEL

		print(sender, 'is not in channel', channel, 'and cant send message') #TO DEL

	def blockUser(self, user):
		if user == str(self.username):
			print(self.username, 'try to block himself') #TO DEL
			return

		if userModels.User.objects.filter(username=str(user)).exists():
			blockedUser = userModels.User.objects.get(username=str(self.username)).blockedUser

			if blockedUser is None:
				blockedUser = []

			if user not in blockedUser:
				blockedUser.append(user)
				userModels.User.objects.filter(username=str(self.username)).update(blockedUser=blockedUser)

			print(user, 'has been block by', self.username) #TO DEL
			return #TO DEL
		print(user, 'has been try to be block by', self.username, 'but', user, 'dont exist') #TO DEL


	def isBlock(self, user):
		if userModels.User.objects.filter(username=str(user)).exists():
			blockedUser = userModels.User.objects.get(username=str(self.username)).blockedUser

			if blockedUser is not None and str(user) in blockedUser:
				return True

		return False

	def isBlockBy(self, user):
		if userModels.User.objects.filter(username=str(user)).exists():
			blockedUser = userModels.User.objects.get(username=str(user)).blockedUser

			if blockedUser is not None and str(self.username) in blockedUser:
				return True

		return False

	def unblockUser(self, user):
		if userModels.User.objects.filter(username=str(user)).exists():
			blockedUser = userModels.User.objects.get(username=str(self.username)).blockedUser

			if blockedUser is not None and user in blockedUser:
				blockedUser.remove(user)
				userModels.User.objects.filter(username=str(self.username)).update(blockedUser=blockedUser)

			print(user, 'has been unblock by', self.username) #TO DEL
			return #TO DEL
		print(user, 'has been try to be unblock by', self.username, 'but', user, 'dont exist') #TO DEL

	def getHistoryChat(self, chatTarget):
		messages = MessageModels.objects.filter(
			(Q(sender=str(self.username)) & Q(receiver=chatTarget)) |
 			(Q(receiver=str(self.username)) & Q(sender=chatTarget))).order_by('-id')[:10]

		for msg in messages.values():
			self.send(text_data=json.dumps({
				'type': 'chat_history',
				'time': str(msg['timeCreation']),
				'sender': msg['sender'],
				'receiver': msg['receiver'],
				'message': msg['message']
			}))

	def getHistoryChannel(self, channelTarget):
		messages = MessageModels.objects.filter(receiver=channelTarget).order_by('-id')[:10]

		for msg in messages.values():
			if self.isBlock(msg['sender']) is False:
				self.send(text_data=json.dumps({
					'type': 'chat_history',
					'time': str(msg['timeCreation']),
					'sender': msg['sender'],
					'receiver': msg['receiver'],
					'message': msg['message']
				}))

	def sendHistoryTalk(self, tabChannels):
		messages = MessageModels.objects.filter(
			(Q(sender=str(self.username)) | (Q(receiver=str(self.username))))).order_by('-id')
		allTalks = [(self.username)]

		#IIIIIIIIIIIIIIIiiiiiiiiiIIIIIIIIIIIIIIIICICICICICIC FAUT TRAVAILLER
		for msg in messages.values():
			if allTalks.__contains__(msg['sender']) is False or allTalks.__contains__(msg['receiver']) is False:
				allTalks.append(msg)

		for x in allTalks[0:10]:
			print(x)

		pass

	#CHANNEL LAYER FUNCTIONS
	def chatPrivateMessage(self, event):
		sender = event['sender']
		message = event['message']

		self.send(text_data=json.dumps({
    		'type': 'chat_private_message',
			'sender': sender,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
    	}))

	def chatChannelMessage(self, event):
		sender = event['sender']
		message = event['message']
		channel = event['channel']

		if self.isBlock(sender):
			print(sender, 'try to send a message on channel', channel, 'to', str(self.username), 'but he block him') #TO DEL
			return

		self.send(text_data=json.dumps({
    		'type': 'chat_channel_message',
			'channel': channel,
			'sender': sender,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
    	}))
