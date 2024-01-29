import json, time
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .enumChat import connexionStatus, channelPrivacy
from django.db import models
from authApp import models as userModels
from .classChannel import ChannelChat
from .models import MessageModels, ChannelModels
from django.db.models import Q
from pongGameApp.Remote.pongGameManager import Manager as pongManager
from battleshipApp.BS_MatchmakingManager import GameManager as battleshipManager


def createGeneralChat(allChannels):
	allChannels["general"] = ChannelChat("general", channelPrivacy.Public, None)

class chatSocket(WebsocketConsumer):
	allChannels = {}
	allUsers = {}

	def connect(self):
		if len(self.allChannels) <= 0:
			createGeneralChat(self.allChannels)

		self.user = self.scope['user']
		self.userId = self.scope['user'].id

		self.UserModel = userModels.User.objects.get(id=self.userId)
		self.UserModel.connexionStatus = connexionStatus.Connected
		self.UserModel.save()

		self.userIdentification = self.UserModel.identification
		self.allUsers[self.userIdentification] = self.user
		self.chatId = 'chat_' + self.userIdentification

		print(self.user.identification, 'is connected to chat socket with chatId =', self.chatId) #TO DEL

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

		#TO DEL
		tab = self.UserModel.channels
		if tab is not None:
			print('All', self.user.identification, 'channels:')
			for x in tab:
				print(x)
		tab = self.UserModel.blockedUser
		if tab is not None:
			print('All', self.user.identification, 'blockedUser:')
			for x in tab:
				print(userModels.User.objects.get(identification=x).identification)
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

		self.allUsers.pop(self.userIdentification)

		self.close()

	def receive(self, text_data):
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
		elif data['type'] == 'get_last_chat':
			self.getLastChat()
		elif data['type'] == 'get_all_users':
			self.getAllUsers()
		elif data['type'] == 'get_history_chat':
			self.getHistoryChat(data['target'])
		elif data['type'] == 'get_history_channel':
			self.getHistoryChannel(data['target'])

		#GAMES INVITATION
		elif data['type'] == 'invite_pong':
			self.inviteToPong(data['target'])
		elif data['type'] == 'invite_battleship':
			self.inviteBattleship(data['target'])
		elif data['type'] == 'accept_invitation_pong':
			self.acceptInvitationPong(data['target'])
		elif data['type'] == 'accept_invitation_battleship':
			self.acceptInvitationBattleship(data['target'])

	def joinChannel(self, channelName, privateStatus=channelPrivacy.Public):
		if channelName not in self.allChannels:
			#TO CHANGE FOR A CREATE CHANNEL BUTTON WITH OPTIONS
			self.allChannels[channelName] = ChannelChat(channelName, privateStatus, self)
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
		if userModels.User.objects.filter(identification=receiver).exists() is False or receiver == self.userIdentification:
			print(self.user.identification, 'try to send a message to', receiver, 'but he dont exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(identification=receiver)

		if self.isBlock(receiverModel):
			print(self.user.identification, 'try to send a message to', receiverModel.identification, 'but he block him') #TO DEL
			return

		if self.isBlockBy(receiverModel):
			print(self.user.identification, 'try to send a message to user', receiverModel.identification, 'who block him') #TO DEL
			return

		msg = MessageModels.objects.create(
			message=message,
			sender=self.userIdentification,
			receiver=receiver
		)
		msg.save()

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + receiver,
            {
                'type': 'chatPrivateMessage',
				'sender': self.user.nickname + '-' + self.userIdentification,
				'message': message
            }
        )

	def sendChannelMessage(self, channel, message):
		if channel in self.allChannels:
			tab = self.UserModel.channels

			if tab is not None and channel in tab:
				self.allChannels[channel].sendMessageChannel(self, message)
				print('message from', self.user.identification, 'to channel', channel, 'is', message) #TO DEL
				return #TO DEL

		print(self.user.identification, 'is not in channel', channel, 'and cant send message') #TO DEL

	def blockUser(self, user):
		if userModels.User.objects.filter(identification=user).exists() is False:
			print(user, 'has been try to be block by', self.user.identification, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(identification=user)

		if userModel.id == self.userId:
			print(self.user.identification, 'try to block himself') #TO DEL
			return

		blockedUser = self.UserModel.blockedUser

		if blockedUser is None:
			blockedUser = []

		if userModel.identification not in blockedUser:
			blockedUser.append(userModel.identification)
			self.UserModel.blockedUser = blockedUser
			self.UserModel.save()

		print(userModel.identification, 'has been block by', self.user.identification) #TO DEL

	def unblockUser(self, user):
		if userModels.User.objects.filter(identification=user).exists() is False:
			print(user, 'has been try to be unblock by', self.user.identification, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(identification=user)

		if userModel.id == self.userId:
			print(self.user.identification, 'try to unblock himself') #TO DEL
			return

		blockedUser = self.UserModel.blockedUser

		if blockedUser is None:
			blockedUser = []

		if userModel.identification in blockedUser:
			blockedUser.remove(userModel.identification)
			self.UserModel.blockedUser = blockedUser
			self.UserModel.save()

		print(user, 'has been unblock by', self.user.identification) #TO DEL

	def getLastChat(self):
		allMessageChannels = []
		if self.UserModel.channels is not None:
			for chan in self.UserModel.channels:
				msgs = MessageModels.objects.filter(receiver=chan)
				if msgs is not None:
					allMessageChannels.append(msgs.order_by('-id')[0])

		allMessages = MessageModels.objects.filter(Q(sender=self.userIdentification) | Q(receiver=self.userIdentification))
		allConv = allMessageChannels

		blockedUser = self.UserModel.blockedUser

		for msg in allMessages:
			x = 0
			for conv in allConv:
				if blockedUser is not None and (conv.receiver in blockedUser or conv.sender in blockedUser or msg.sender in blockedUser or msg.receiver in blockedUser):
					x = -1
					break
				elif conv.receiver == msg.receiver and conv.sender == msg.sender:
					x = -1
					break
				elif conv.receiver == msg.sender and conv.sender == msg.receiver:
					x = -1
					break
				elif conv.receiver == msg.receiver:
					x = -1
					break
				x += 1

			if x == len(allConv) or x == 0:
				allConv.append(msg)

		for conv in allConv:
			if userModels.User.objects.filter(identification=conv.sender).exists():
				senderModel = userModels.User.objects.get(identification=conv.sender)
				sender = senderModel.nickname + '-' + senderModel.identification
			else:
				sender = conv.sender

			if userModels.User.objects.filter(identification=conv.receiver).exists():
				receiverModel = userModels.User.objects.get(identification=conv.receiver)
				receiver = receiverModel.nickname + '-' + receiverModel.identification
			else:
				receiver = conv.receiver

			self.send(text_data=json.dumps({
				'type': 'all_chat_history',
				'message': conv.message,
				'sender': sender,
				'receiver': receiver,
				'time': str(conv.timeCreation)
			}))

	def isBlock(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = self.UserModel.blockedUser

			if blockedUser is not None and user.identification in blockedUser:
				return True

		return False

	def isBlockBy(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = userModels.User.objects.get(identification=user.identification).blockedUser

			if blockedUser is not None and self.userIdentification in blockedUser:
				return True

		return False

	def getAllUsers(self):
		allUsers = userModels.User.objects.exclude(Q(identification='IA') | Q(identification='admin'))

		for user in allUsers.values():
			identification = user['nickname'] + '-' + user['identification']
			self.send(text_data=json.dumps({
				'type': 'all_users_data',
				'identification': identification,
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

				self.send(text_data=json.dumps({
					'type': 'all_channels_data',
					'channel_name': chanModel.channelName,
					'description': chanModel.description
				}))

	def getHistoryChat(self, chatTarget):
		if userModels.User.objects.filter(identification=chatTarget).exists() is False:
			return

		modelChatTarget = userModels.User.objects.get(identification=chatTarget)

		messages = MessageModels.objects.filter(
			(Q(sender=str(self.userIdentification)) & Q(receiver=modelChatTarget.identification)) |
 			(Q(receiver=str(self.userIdentification)) & Q(sender=modelChatTarget.identification))).order_by('-id')[:10]

		for msg in messages.values():
			if msg['sender'] == self.userIdentification:
				sender = self.user.nickname + '-' + self.userIdentification
			else:
				sender = modelChatTarget.nickname + '-' + modelChatTarget.identification
			if msg['receiver'] == self.userIdentification:
				receiver = self.user.nickname + '-' + self.userIdentification
			else:
				receiver = modelChatTarget.nickname + '-' + modelChatTarget.identification

			self.send(text_data=json.dumps({
				'type': 'chat_history',
				'sender': sender,
				'receiver': receiver,
				'message': msg['message'],
				'time': str(msg['timeCreation'])
			}))

	def getHistoryChannel(self, channelTarget):
		if ChannelModels.objects.filter(channelName=channelTarget).exists() is False:
			return

		messages = MessageModels.objects.filter(receiver=channelTarget).order_by('-id')[:10]

		for msg in messages.values():
			senderModel = userModels.User.objects.get(identification=msg['sender'])

			if self.isBlock(senderModel) is False:
				self.send(text_data=json.dumps({
					'type': 'chat_history',
					'time': str(msg['timeCreation']),
					'sender': senderModel.nickname + '-' + senderModel.identification,
					'receiver': msg['receiver'],
					'message': msg['message']
				}))

	def inviteToPong(self, receiver):
		if userModels.User.objects.filter(identification=receiver).exists() is False or receiver == self.userIdentification:
			print(self.user.identification, 'try to invite', receiver, 'but he dont exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(identification=receiver)

		if receiverModel.connexionStatus != connexionStatus.Connected:
			print(self.user.identification, 'try to invite', receiverModel.identification, 'but he is not online') #TO DEL
			return

		if self.isBlock(receiverModel):
			print(self.user.identification, 'try to invite', receiverModel.identification, 'but he block him') #TO DEL
			return

		if self.isBlockBy(receiverModel):
			print(self.user.identification, 'try to invite', receiverModel.identification, 'who block him') #TO DEL
			return

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + receiver,
            {
                'type': 'receiveInvitationPong',
				'sender': self.user.nickname + '-' + self.userIdentification
            }
        )

	def inviteBattleship(self, receiver):
		if userModels.User.objects.filter(identification=receiver).exists() is False:
			print(self.user.identification, 'try to invite', receiver, 'but he dont exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(identification=receiver)

		if receiverModel.connexionStatus != connexionStatus.Connected:
			print(self.user.identification, 'try to invite', receiver, 'but he is not online')
			return

		if self.isBlock(receiverModel):
			print(self.user.identification, 'try to invite', receiver, 'but he block him')
			return

		if self.isBlockBy(receiverModel):
			print(self.user.identification, 'try to invite', receiver, 'who block him') #TO DEL
			return

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + receiver,
            {
                'type': 'receiveInvitationBattleship',
				'sender': self.user.nickname + '-' + self.userIdentification
            }
        )

	def acceptInvitationPong(self, sender):
		senderModel = userModels.User.objects.get(identification=sender)
		if senderModel is None:
			return

		gameId = 'privatePong' + self.userIdentification + '_' + sender
		pongManager.createGame(self.user, self.allUsers[sender], gameId, None)

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + sender,
            {
                'type': 'startPong',
				'gameId': gameId
            }
		)

		async_to_sync(self.channel_layer.group_send)(
            self.chatId,
            {
                'type': 'startPong',
				'gameId': gameId
            }
		)

	def acceptInvitationBattleship(self, sender):
		senderModel = userModels.User.objects.get(identification=sender)
		if senderModel is None:
			return

		gameId = 'privateBattleship' + self.userIdentification + '_' + sender
		battleshipManager.CreateGame(battleshipManager, self.user, self.allUsers[sender], gameId, 0, None)

		async_to_sync(self.channel_layer.group_send)(
            'chat_' + sender,
            {
                'type': 'startBattleship',
				'gameId': gameId
            }
		)

		async_to_sync(self.channel_layer.group_send)(
            self.chatId,
            {
                'type': 'startBattleship',
				'gameId': gameId
            }
		)

	#CHANNEL LAYER FUNCTIONS
	#GAMES INVITATION
	def startPong(self, event):
		self.send(text_data=json.dumps({
			'type': 'start_pong_game',
			'gameId': event['gameId']
		}))

	def startBattleship(self, event):
		self.send(text_data=json.dumps({
			'type': 'start_battleship_game',
			'gameId': event['gameId']
		}))

	def receiveInvitationPong(self, event):
		sender = event['sender']

		self.send(text_data=json.dumps({
			'type': 'receive_invitation_pong',
			'sender': sender
		}))

	def receiveInvitationBattleship(self, event):
		sender = event['sender']

		self.send(text_data=json.dumps({
			'type': 'receive_invitation_battleship',
			'sender': sender
		}))

	#CHAT RECEIVE
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

		senderModel = userModels.User.objects.get(identification=sender)
		if self.isBlock(senderModel):
			print(sender, 'try to send a message on channel', channel, 'to', self.user.identification, 'but he block him') #TO DEL
			return

		self.send(text_data=json.dumps({
    		'type': 'chat_channel_message',
			'channel': channel,
			'sender': senderModel.nickname + '-' + senderModel.identification,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
    	}))
