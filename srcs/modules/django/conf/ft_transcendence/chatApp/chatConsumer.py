import json, time
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .enumChat import connexionStatus, channelPrivacy
from django.db import models
from authApp import models as userModels
from .classChat import ChannelChat
from .models import MessageModels, ChannelModels
from django.db.models import Q


def createGeneralChat(allChannels):
	allChannels["general"] = ChannelChat("general", channelPrivacy.Public, None)

class chatSocket(WebsocketConsumer):
	allChannels = {}

	def connect(self):
		if len(self.allChannels) <= 0:
			createGeneralChat(self.allChannels)

		self.user = self.scope['user']
		self.userId = self.scope['user'].id

		self.UserModel = userModels.User.objects.get(id=self.userId)
		self.UserModel.connexionStatus = connexionStatus.Connected
		self.UserModel.save()

		self.userIdentification = self.UserModel.identification

		self.chatId = 'chat_' + self.userIdentification

		print(self.user.username, 'is connected to chat socket with chatId =', self.chatId)

		tabChannels = self.UserModel.channels
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
		self.getAllUsers()
		self.getAllChannels()

		#TO DEL
		tab = self.UserModel.channels
		if tab is not None:
			print('All', self.user.username, 'channels:')
			for x in tab:
				print(x)
		tab = self.UserModel.blockedUser
		if tab is not None:
			print('All', self.user.username, 'blockedUser:')
			for x in tab:
				print(userModels.User.objects.get(id=x).identification)
		#TO DEL

	def disconnect(self, code):
		self.UserModel.connexionStatus = connexionStatus.Disconnected
		self.UserModel.save()

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
		self.UserModel = userModels.User.objects.get(id=self.userId)
		data = json.loads(text_data)

		print(data) #TO DEL

		if data['type'] == 'chat_message':
			self.sendPrivateMessage(data['target'], data['message'])
		elif data['type'] == 'channel_message':
			self.sendChannelMessage(data['target'], data['message'])
		elif data['type'] == 'channel_join':
			self.joinChannel(data['target'])
		elif data['type'] == 'channel_leave':
			self.leaveChannel(data['target'])
		elif data['type'] == 'block_user':
			self.blockUser(data['target'])
		elif data['type'] == 'unblock_user':
			self.unblockUser(data['target'])
		elif data['type'] == 'get_all_users':
			self.getAllUsers()
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

		tab = self.UserModel.channels
		if tab is None:
			tab = []

		if channelName not in tab:
			tab.append(channelName)
			self.UserModel.channels = tab
			self.UserModel.save()

		async_to_sync(self.channel_layer.group_add)(
			'channel_' + channelName,
			self.channel_name
		)

	def leaveChannel(self, channelName):
		if channelName not in self.allChannels or channelName == "general":
			return

		self.allChannels[channelName].leaveChannel(self)

		tab = self.UserModel.channels
		if tab is not None and channelName in tab:
			tab.remove(channelName)
			self.UserModel.channels = tab
			self.UserModel.save()

		async_to_sync(self.channel_layer.group_discard)(
			'channel_' + channelName,
			self.channel_name
		)

	def sendPrivateMessage(self, receiver, message):
		if userModels.User.objects.filter(identification=receiver).exists() is False:
			print(self.user.username, 'try to send a message to', receiver, 'but he dont exist')
			return

		receiverModel = userModels.User.objects.get(identification=receiver)

		if self.isBlock(receiverModel):
			print(self.user.username, 'try to send a message to', receiver, 'but he block him')
			return

		if self.isBlockBy(receiverModel):
			print(self.user.username, 'try to send a message to user', receiver, 'who block him') #TO DEL
			return

		msg = MessageModels.objects.create(
			message=message,
			sender=self.userId,
			receiver=receiverModel.id
		)
		msg.save()

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + receiver,
            {
                'type': 'chatPrivateMessage',
				'sender': self.userIdentification,
				'message': message
            }
        )

	def sendChannelMessage(self, channel, message):
		if channel in self.allChannels:
			tab = self.UserModel.channels

			if tab is not None and channel in tab:
				self.allChannels[channel].sendMessageChannel(self, message)
				print('message from', self.user.username, 'to channel', channel, 'is', message) #TO DEL
				return #TO DEL

		print(self.user.username, 'is not in channel', channel, 'and cant send message') #TO DEL

	def blockUser(self, user):
		if userModels.User.objects.filter(identification=user).exists() is False:
			print(user, 'has been try to be block by', self.user.username, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(identification=user)

		if userModel.id == self.userId:
			print(self.user.username, 'try to block himself') #TO DEL
			return

		if userModels.User.objects.filter(id=userModel.id).exists():
			blockedUser = userModels.User.objects.get(id=self.userId).blockedUser

			if blockedUser is None:
				blockedUser = []

			if str(userModel.id) not in blockedUser:
				blockedUser.append(str(userModel.id))
				self.UserModel.blockedUser = blockedUser
				self.UserModel.save()

			print(user, 'has been block by', self.user.username) #TO DEL
			return #TO DEL

	def unblockUser(self, user):
		if userModels.User.objects.filter(identification=user).exists() is False:
			print(user, 'has been try to be unblock by', self.user.username, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(identification=user)

		if userModel.id == self.userId:
			print(self.user.username, 'try to unblock himself') #TO DEL
			return

		if userModels.User.objects.filter(id=userModel.id).exists():
			blockedUser = userModels.User.objects.get(id=self.userId).blockedUser

			if blockedUser is None:
				blockedUser = []

			if str(userModel.id) in blockedUser:
				blockedUser.remove(str(userModel.id))
				self.UserModel.blockedUser = blockedUser
				self.UserModel.save()

			print(user, 'has been unblock by', self.user.username) #TO DEL

	def isBlock(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = self.UserModel.blockedUser

			if blockedUser is not None and str(user.id) in blockedUser:
				return True

		return False

	def isBlockBy(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = userModels.User.objects.get(username=user.username).blockedUser

			if blockedUser is not None and str(self.userId) in blockedUser:
				return True

		return False

	def getAllUsers(self):
		allUsers = userModels.User.objects.exclude(Q(username='IA') | Q(username='admin'))

		for user in allUsers.values():
			self.send(text_data=json.dumps({
				'type': 'all_users_data',
				'username': user['identification'],
				'online_status': user['connexionStatus']
			}))

	def getAllChannels(self):
		tab = self.UserModel.channels
		if tab is None:
			self.send(text_data=json.dumps({
				'type': 'all_channels_data',
				'data': 'no_channels'
			}))
		else:
			for chan in tab:
				chanModel = ChannelModels.objects.get(channelName=chan)

				#print('chanModel =', chanModel.channelName)

				self.send(text_data=json.dumps({
					'type': 'all_channels_data',
					'channel_name': chanModel.channelName,
					'description': chanModel.description
				}))

	def getHistoryChat(self, chatTarget):
		if userModels.User.objects.filter(identification=chatTarget).exists() is False:
			return

		idChatTarget = userModels.User.objects.get(identification=chatTarget).id

		messages = MessageModels.objects.filter(
			(Q(sender=str(self.userId)) & Q(receiver=idChatTarget)) |
 			(Q(receiver=str(self.userId)) & Q(sender=idChatTarget))).order_by('-id')[:10]

		for msg in messages.values():
			if msg['sender'] == str(self.userId):
				sender = self.userIdentification
			else:
				sender = chatTarget
			if msg['receiver'] == str(self.userId):
				receiver = self.userIdentification
			else:
				receiver = chatTarget

			self.send(text_data=json.dumps({
				'type': 'chat_history',
				'time': str(msg['timeCreation']),
				'sender': sender,
				'receiver': receiver,
				'message': msg['message']
			}))

	def getHistoryChannel(self, channelTarget):
		if ChannelModels.objects.filter(channelName=channelTarget).exists() is False:
			return

		messages = MessageModels.objects.filter(receiver=channelTarget).order_by('-id')[:10]

		for msg in messages.values():
			senderModel = userModels.User.objects.get(id=int(msg['sender']))

			if self.isBlock(senderModel) is False:
				self.send(text_data=json.dumps({
					'type': 'chat_history',
					'time': str(msg['timeCreation']),
					'sender': senderModel.identification,
					'receiver': msg['receiver'],
					'message': msg['message']
				}))

	def sendHistoryTalk(self, tabChannels):
		#messagesSent = MessageModels.objects.filter(sender=str(self.user)).annotate(receive_count=models.Count('receiver')).filter(receive_count=1)
		#messagesReceive = MessageModels.objects.filter(receiver=str(self.user)).annotate(sent_count=models.Count('sender')).filter(sent_count=1)
		##print(messagesSent.values())
		##print(messagesReceive.values())

		#messages = (messagesReceive | messagesSent).order_by('-id')

		#print('ICI:')
		#for x in messages.values()[0:10]:
		#	print(x)
		#print('FIN')

		#messages = MessageModels.objects.filter(
		#	(Q(sender=str(self.user)) | (Q(receiver=str(self.user))))).order_by('-id')
		#allTalks = []


		#for msg in messages.values():
		#	print('for msg =', msg)
		#	print('allTalks.__contains__(msg["sender"]) =', allTalks.__contains__(msg['sender']))
		#	print('allTalks.__contains__(msg["receiver"])', allTalks.__contains__(msg['receiver']))
		#	print()
		#	if allTalks.__contains__(msg['sender']) == str(self.user) and allTalks.__contains__(msg['receiver']) is False:
		#		allTalks.append(msg)
		#	elif allTalks.__contains__(msg['receiver']) == str(self.user) and allTalks.__contains__(msg['sender']) is False:
		#		allTalks.append(msg)

		#print('ICI:')
		#for x in allTalks[0:10]:
		#	print(x)
		#print('FIN')

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


		senderModel = userModels.User.objects.get(id=sender)
		if self.isBlock(senderModel):
			print(sender, 'try to send a message on channel', channel, 'to', self.user.username, 'but he block him') #TO DEL
			return

		self.send(text_data=json.dumps({
    		'type': 'chat_channel_message',
			'channel': channel,
			'sender': sender,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
    	}))
