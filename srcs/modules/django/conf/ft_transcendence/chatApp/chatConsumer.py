import json, time, datetime
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .enumChat import connexionStatus, channelPrivacy
from authApp import models as userModels
from .classChannel import ChannelChat
from .models import MessageModels, ChannelModels
from django.db.models import Q
from django.contrib.auth.hashers import check_password
from pongGameApp.Remote.pongGameManager import Manager as pongManager
from battleshipApp.BS_MatchmakingManager import GameManager as battleshipManager

from ft_transcendence import ColorPrint

def createGeneralChat(allChannels):
	allChannels["General"] = ChannelChat("General", "General channel", channelPrivacy.Public, None, None)

UsersSockets = {}

class chatSocket(WebsocketConsumer):
	allChannels = {}
	allUsers = {}


	def initAllChannels(allChannelsDict):
		allChannelsSet = ChannelModels.objects.all()
		for item in allChannelsSet:
			channelName = item.channelName
			allChannelsDict[channelName] = ChannelChat(channelName, item.description, item.privacyStatus, item.password, item.admin)


	initAllChannels(allChannels)
	def connect(self):
		if len(self.allChannels) <= 0:
			createGeneralChat(self.allChannels)

		self.user = self.scope['user']
		self.id = self.scope['user'].id

		self.UserModel = userModels.User.objects.get(id=self.id)
		self.UserModel.connexionStatus = connexionStatus.Connected
		self.UserModel.sessionCount += 1
		self.UserModel.save()

		self.id = self.UserModel.id
		ColorPrint.prBlue(self.allUsers)
		for user in self.allUsers:
			async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(user),
				{
					'type': 'updateStatus',
					'id': self.id,
					'status': connexionStatus.Connected
				}
			)

		self.allUsers[self.id] = self.user
		self.chatId = 'chat_' + str(self.id)

		print(self.user.id, 'is connected to chat socket with chatId =', self.chatId) #TO DEL

		tabChannels = self.UserModel.channels


		async_to_sync(self.channel_layer.group_add)(
				self.chatId,
				self.channel_name
				)

		self.accept()
		global UsersSockets
		UsersSockets[self.id] = self
		ColorPrint.prBlue(UsersSockets)
		if tabChannels is not None:
			for chan in tabChannels:
				privacyStatus = ChannelModels.objects.get(channelName=chan).privacyStatus
				password = ChannelModels.objects.get(channelName=chan).password
				self.joinChannel(chan, privacyStatus, password, 0)

		else:
			tabChannels = []
			self.joinChannel('General', 0, None, 0)
			tabChannels.append('General')

		self.UserModel.channels = tabChannels
		self.UserModel.save()
		#TO DEL
		tab = self.UserModel.channels
		if tab is not None:
			print('All', self.user.id, 'channels:')
			for x in tab:
				print(x)
		tab = self.UserModel.blockedUser
		if tab is not None:
			print('All', self.user.id, 'blockedUser:')
			for x in tab:
				print(userModels.User.objects.get(id=x).nickname)

	def disconnect(self, code):
		self.UserModel = userModels.User.objects.get(id=self.id)
		self.UserModel.sessionCount -= 1
		# self.UserModel.connexionStatus = connexionStatus.Disconnected
		self.UserModel.connexionStatus = connexionStatus.Connected if self.UserModel.sessionCount != 0 else connexionStatus.Disconnected

		self.UserModel.save()

		async_to_sync(self.channel_layer.group_discard)(
				self.chatId,
				self.channel_name
		)

		async_to_sync(self.channel_layer.group_discard)(
				"generalChat",
				self.channel_name
		)

		self.allUsers.pop(self.id)

		self.updateConnexionStatus()
		global UsersSockets
		del UsersSockets[self.id]
		ColorPrint.prBlue(UsersSockets)
		self.close()

	def updateConnexionStatus(self):
		print('updateConnexionStatus')
		for user in self.allUsers:
			async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(user),
				{
					'type': 'updateStatus',
					'id': self.id,
					'status': self.UserModel.connexionStatus
				}
			)

	def receive(self, text_data):
		self.UserModel = userModels.User.objects.get(id=self.id)
		data = json.loads(text_data)
		ColorPrint.prRed(data)
		match(data['type']):
			case 'chat_message':
				self.sendPrivateMessage(str(data['target']), data['message'])
			case 'channel_message':
				self.sendChannelMessage(str(data['target']), data['message'])
			case 'create_channel':
				self.createChannel(data['channel_name'], data['channel_description'], data['privacy_status'], data['password'], data['adminId'])
			case 'channel_join':
				if data['privacy_status'] is False:
					self.joinChannel(data['target'], False, None, 1)
				else:
					self.joinChannel(data['target'], data['privacy_status'], data['password'], 1)
			case 'channel_leave':
				self.leaveChannel(data['target'])
			case 'block_user':
				self.blockUser(data['target'])
			case 'unblock_user':
				self.unblockUser(data['target'])
			case 'get_last_chats':
				self.getLastChats()
			case 'get_all_users':
				self.getAllUsers()
			case 'get_user':
				self.getUser(data['target'])
			case 'get_channel':
				self.getChannel(data['target'])
			case 'get_history_chat':
				self.getHistoryChat(data['target'], data['msgId'])
			case 'get_history_channel':
				self.getHistoryChannel(data['target'], data['msgId'])
			case 'search_conv':
				self.searchConv(data['input'])
			case 'edit_description':
				self.editDescription(data['channel_name'], data['description'])
			case 'kick_user':
				self.kickUser(data['channel'], data['user'])
			#GAMES INVITATION
			case 'invite_pong':
				self.inviteToPong(data['target'])
			case 'invite_battleship':
				self.inviteBattleship(data['target'])
			case 'accept_invitation_pong':
				self.acceptInvitationPong(data['target'])
			case 'accept_invitation_battleship':
				self.acceptInvitationBattleship(data['target'])
			case 'invit_to_friend':
				self.InviteToFriend(data['target'])
			case 'receiveFriendInvitation':
				self.receiveFriendInvitation(data['sender'])
			case 'responseFriendInvitation':
				self.friendshipRequestResponse(data['result'], data['sender'])
			case 'refuse_invitation':
				self.refuseInvitation(data['target'], data['sender'])
			case 'refused_invitation':
				self.receiveRefusedInvitation(data)
			case 'msg_read':
				self.readMessage(data)
			case 'MSG_RetrieveFriendInvitation':
				self.RetrieveFriendInvitation()
			case 'MSG_RetrieveFriendConversation':
				self.RetrieveFriendConversation(data['limiter'])

	def joinChannel(self, channelName, privacyStatus, password, atConnection):
		if self.allChannels[channelName] is None:
			return
		else:
			if	privacyStatus is True and check_password(password, self.allChannels[channelName].ChanModel.password) is False:
				self.send(json.dumps({
					'type': 'join_channel_response',
					'channel_name': channelName,
					'state': 'failed',
					'reason': 'Wrong password'
					})
			  )
				return

			self.allChannels[channelName].joinChannel(self)
			tab = self.UserModel.channels
			if tab is None:
				tab = []

			if channelName not in tab:
				tab.append(channelName)
				self.UserModel.channels = tab
				print(self.UserModel.channels)
				self.UserModel.save()

			print(self)

			if (atConnection == 1):
				self.send(json.dumps({
					'type': 'join_channel_response',
					'channel_name': channelName,
					'state': 'success'
					})
			  )

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
		if len(message) <= 0:
			return
		if userModels.User.objects.filter(id=receiver).exists() is False or receiver == str(self.id):
			print(self.user.id, 'try to send a message to', receiver, 'but he dont exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(id=receiver)

		if self.isBlock(receiverModel):
			print(self.user.id, 'try to send a message to', receiverModel.id, 'but he block him') #TO DEL
			return

		if self.isBlockBy(receiverModel):
			print(self.user.id, 'try to send a message to user', receiverModel.id, 'who block him') #TO DEL
			return

		allMessages = MessageModels.objects.filter(
					(Q(sender=str(self.id)) & Q(receiver=receiver)) |
					(Q(receiver=str(self.id)) & Q(sender=receiver))).order_by('-id')
		if len(allMessages) > 0:
			allMessages[0].isRead = True
			allMessages[0].save()
			print('allMessages[0]:', allMessages[0])
		for messageB in allMessages:
			ColorPrint.prBlue(messageB.timeCreation)
		msg = MessageModels.objects.create(
				message=message,
				sender=self.id,
				receiver=receiver,
				type='P'
				)
		msg.save()
		for messageB in allMessages:
			ColorPrint.prBlue(messageB.timeCreation)


		print(msg.sender, ' send', msg.message, 'to', msg.receiver)
		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(receiver),
				{
					'type': 'chatPrivateMessage',
					'sender': self.id,
					'senderNickname': self.UserModel.nickname,
					'message': message
				})

	def sendChannelMessage(self, channel, message):
		if len(message) <= 0:
			return
		if channel in self.allChannels:
			tab = self.UserModel.channels

			if tab is not None and channel in tab:
				self.allChannels[channel].sendMessageChannel(self, message)
				print('message from', self.user.id, 'to channel', channel, 'is', message) #TO DEL
				return #TO DEL

		print(self.user.id, 'is not in channel', channel, 'and cant send message') #TO DEL

	def blockUser(self, user):
		if userModels.User.objects.filter(id=user).exists() is False:
			print(user, 'has been try to be block by', self.user.id, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(id=user)

		if userModel.id == self.id:
			print(self.user.id, 'try to block himself') #TO DEL
			return

		blockedUser = self.UserModel.blockedUser

		if blockedUser is None:
			blockedUser = []

		if str(userModel.id) not in blockedUser:
			blockedUser.append(str(userModel.id))
			self.UserModel.blockedUser = blockedUser
			self.UserModel.save()
		else:
			blockedUser.remove(str(userModel.id))
			self.UserModel.blockedUser = blockedUser
			self.UserModel.save()

		print(userModel.id, 'has been block by', self.user.id) #TO DEL

	def unblockUser(self, user):
		if userModels.User.objects.filter(id=user).exists() is False:
			print(user, 'has been try to be unblock by', self.user.id, 'but', user, 'dont exist') #TO DEL
			return

		userModel = userModels.User.objects.get(id=user)

		if userModel.id == self.userId:
			print(self.user.id, 'try to unblock himself') #TO DEL
			return

		blockedUser = self.UserModel.id

		if blockedUser is None:
			blockedUser = []

		if userModel.id in blockedUser:
			blockedUser.remove(userModel.id)
			self.UserModel.blockedUser = blockedUser
			self.UserModel.save()

		print(user, 'has been unblock by', self.user.id) #TO DEL

	def getLastChats(self):
		allConv = []
		if self.UserModel.channels is not None:
			print(self.UserModel.channels)
			for chan in self.UserModel.channels:
				chanMsgs = MessageModels.objects.filter(type='C').filter(Q(sender=chan) | Q(receiver=chan)).order_by('-id')
				if chanMsgs.exists():
					lastMsg = chanMsgs[0].message
					lastMsgSender = userModels.User.objects.get(id=chanMsgs[0].sender).nickname
					timestamp = chanMsgs[0].timeCreation

					tabMsg = chanMsgs[0].readBy
					if tabMsg is not None and str(self.id) not in tabMsg:
						isRead = False
					else:
						isRead = True

				else:
					lastMsg = ''
					lastMsgSender = ''
					timestamp = datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
					isRead = True

				data = {
						'type': 'channel',
						'name': chan,
						'last_msg':
						{
				   			'sender': lastMsgSender,
				   			'msg': lastMsg
						},
						'timestamp': timestamp,
						'isRead': isRead,
						'friend' : 'unknown',
						}

				allConv.append(data)

		allMessages = MessageModels.objects.filter(type='P').filter(Q(sender=str(self.id)) | Q(receiver=str(self.id))).order_by('-id').values()
		contactList = []
		for msg in allMessages:
			if (msg['sender'] == str(self.id)):
				contact = msg['receiver']
				msgSender = 'Me'
			else:
				contact = msg['sender']
				msgSender = contact
			if contact not in contactList:
				contactList.append(contact)

		for contact in contactList:
			ColorPrint.prGreen(contact)
			friendStatus = 'friend'
			if userModels.User.objects.get(id=contact).PendingInvite is not None and self.id in userModels.User.objects.get(id=contact).PendingInvite:
				friendStatus = 'unknown'
			elif self.UserModel.Friends is not None and int(contact) in self.UserModel.Friends:
				friendStatus = 'unknown'
			msg = allMessages.filter(Q(sender=contactList[0]) | Q(receiver=contactList[0])).order_by('-id')[0]
			connexionStatus = userModels.User.objects.get(id=contact).connexionStatus

			lastMsg = MessageModels.objects.filter(
					(Q(sender=str(self.id)) & Q(receiver=contact)) |
					(Q(receiver=str(self.id)) & Q(sender=contact))).order_by('-id')[0]

			if lastMsg.sender == str(self.id):
				sender = "Me"
				isRead = True
			else:
				isRead = lastMsg.isRead
				sender = userModels.User.objects.get(id=lastMsg.sender).nickname

			allConv.append({
				'type': 'private',
				'name': userModels.User.objects.get(id=contact).nickname,
				'id': userModels.User.objects.get(id=contact).id,
				'connexionStatus': connexionStatus,
				'last_msg': {
					'msg': lastMsg.message,
					'sender': sender
					},
				'timestamp': lastMsg.timeCreation,
				'isRead': isRead,
				'friend': friendStatus,
				})


		def cmpTimeStamp(msg):
			return msg['timestamp']

		allConv.sort(key = cmpTimeStamp, reverse = True)
		for conv in allConv:
			conv['timestamp'] = str(conv['timestamp'])

		self.send(text_data=json.dumps({
			'type': 'last_chats',
			'data': allConv
			})
			)

	def isBlock(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = self.UserModel.blockedUser

			if blockedUser is not None and str(user.id) in blockedUser:
				return True

		return False

	def isBlockBy(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = userModels.User.objects.get(id=user.id).blockedUser

			if blockedUser is not None and str(self.id) in blockedUser:
				return True

		return False

	def getAllUsers(self):
		allUsers = userModels.User.objects.exclude(Q(id='IA') | Q(id='admin'))

		for user in allUsers.values():
			id = user['nickname'] + '-' + user['id']
			self.send(text_data=json.dumps({
				'type': 'all_users_data',
				'id': id,
				'online_status': user['connexionStatus']
				}))

	def getUser(self, target):
		user = userModels.User.objects.get(id=target)
		friendStatus = 'friend'
		if user.PendingInvite is not None and self.id in user.PendingInvite:
			friendStatus = 'unknown'
		elif user.Friends is not None and self.id in user.Friends:
			friendStatus = 'unknown'
		self.send(text_data=json.dumps({
			'type': 'get_user_data',
			'name': user.nickname,
			'id':  user.id,
			'connexion_status': user.connexionStatus,
			'conversation': user.allPrivateTalks,
			'friend' : friendStatus,
			'blocked' : 'unblocked' if self.UserModel.blockedUser is None or str(user.id) not in self.UserModel.blockedUser else 'blocked'
			})
		)

	def getChannel(self, target):
		channel = ChannelModels.objects.get(channelName=target)
		msgsObjs = MessageModels.objects.filter(receiver=channel.channelName)
		if channel.admin == self.UserModel.id:
			admin = True
		else:
			admin = False
		channelMessages = []
		channelUsers = []
		print(channel.description)
		for msg in msgsObjs:
			channelMessages.append({
				'id': msg.id,
				'sender': msg.sender,
				'receiver': msg.receiver,
				'message': msg.message,
				'timestamp': str(msg.timeCreation)
				})

		for userName in channel.users:
			user = userModels.User.objects.get(id=userName)
			channelUsers.append({
				'name': user.nickname,
				'id': user.id,
				'connexion_status': user.connexionStatus
				})

		self.send(text_data=json.dumps({
								  'type': 'get_channel_data',
								  'name': channel.channelName,
								  'admin': admin,
								  'description': channel.description,
								  'users': channelUsers,
								  'conversation': channelMessages
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

	def getHistoryChat(self, chatTarget, msgId):
		if userModels.User.objects.filter(id=chatTarget).exists() is False:
			return

		print('conv between ', self.id, ' and ', chatTarget)
		modelChatTarget = userModels.User.objects.get(id=chatTarget)
		if msgId == 0:
			ColorPrint.prGreen('0')
			self.send(json.dumps({
				'type': 'actualize_chat_history',
				'data': {}
				})
			 )
			return
		elif msgId == -1:
			type = 'chat_history'
			messages = MessageModels.objects.filter(
					(Q(sender=str(self.id)) & Q(receiver=modelChatTarget.id)) |
					(Q(receiver=str(self.id)) & Q(sender=modelChatTarget.id))).order_by('-id')[:10]
		else:
			ColorPrint.prGreen('2')
			type = 'actualize_chat_history'
			messages = MessageModels.objects.filter(
					(Q(sender=str(self.id)) & Q(receiver=modelChatTarget.id)) & Q(id__lt=int(msgId))  |
					(Q(receiver=str(self.id)) & Q(sender=modelChatTarget.id) & Q(id__lt=int(msgId)))).order_by('-id')[:10]

		response = []
		for msg in messages.values():

			if msg['sender'] == str(self.id):
				received = False
				contact = self.id
			else:
				received = True
				contact = msg['sender']

			if msg['sender'] != str(self.id):
				msgModel = MessageModels.objects.get(id=msg['id'])
				msgModel.isRead = True
				msgModel.save()

			response.append({
				'id': msg['id'],
				'time': str(msg['timeCreation']),
				'contact': contact,
				'received': received,
				'message': msg['message']
				})

		if self.isStillNotification() is True:
			isStillUnreadMessage = True
		else:
			isStillUnreadMessage = False

		self.send(json.dumps({
			'type': type,
			'data': response,
			'isStillUnreadMessage': isStillUnreadMessage
			})
			)

	def getHistoryChannel(self, channelTarget, msgId):
		if ChannelModels.objects.filter(channelName=channelTarget).exists() is False:
			return

		print('msgId =', msgId)

		if int(msgId) == 0:
			self.send(json.dumps({
				'type': 'actualize_channel_history',
				'data': {}
				})
			 )
		elif int(msgId) == -1:
			type = 'channel_history'
			messages = MessageModels.objects.filter(receiver=channelTarget).order_by('-id')[:10]
		else:
			type = 'actualize_channel_history'
			messages = MessageModels.objects.filter(Q(receiver=channelTarget) & Q(id__lt=int(msgId))).order_by('-id')[:10]


		response = []

		for msg in messages.values():
			senderModel = userModels.User.objects.get(id=msg['sender'])

			msgModel = MessageModels.objects.get(id=msg['id'])
			tabReadBy = msgModel.readBy
			if tabReadBy is not None and str(self.id) not in tabReadBy:
				tabReadBy.append(str(self.id))
				msgModel.readBy = tabReadBy
				msgModel.save()

			if self.isBlock(senderModel) is False:
				response.append({
					'id': msg['id'],
					'time': str(msg['timeCreation']),
					'sender': senderModel.nickname,
					'senderID':  senderModel.id,
					'message': msg['message']
					})

		if self.isStillNotification() == True:
			isStillUnreadMessage = True
		else:
			isStillUnreadMessage = False

		print('response =', response)

		self.send(json.dumps({
			'type': type,
			'data': response,
			'isStillUnreadMessage': isStillUnreadMessage
			})
			)

	def isStillNotification(self):
		isStillUnreadMessage = False

		allChannels = userModels.User.objects.get(id=self.id).channels
		for chan in allChannels:
			lastMsg = MessageModels.objects.filter(type='C').filter(receiver=chan).order_by('-id')
			if len(lastMsg) > 0 and str(self.id) not in lastMsg[0].readBy:
				isStillUnreadMessage = True
				return isStillUnreadMessage

		if isStillUnreadMessage == False:
			allMessages = MessageModels.objects.filter(type='P').filter(receiver=self.id).order_by('-id')
			for msg in allMessages:
				if msg.isRead == False:
					isStillUnreadMessage = True
					return isStillUnreadMessage

		return (isStillUnreadMessage)

	def inviteToPong(self, receiver):
		if userModels.User.objects.filter(id=receiver).exists() is False or receiver == self.id:
			print(self.user.id, 'try to invite', receiver, 'but he doesn"t exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(id=receiver)

		if receiverModel.connexionStatus != connexionStatus.Connected:
			print(self.user.id, 'try to invite', receiverModel.id, 'but he is not online') #TO DEL
			return

		if self.isBlock(receiverModel):
			print(self.user.id, 'try to invite', receiverModel.id, 'but he block him') #TO DEL
			return

		if self.isBlockBy(receiverModel):
			print(self.user.id, 'try to invite', receiverModel.id, 'who block him') #TO DEL
			return

		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(receiver),
				{
					'type': 'receiveInvitationPong',
					'sender': self.UserModel.nickname,
					'sender_id': self.id
					}
				)

	def inviteBattleship(self, receiver):
		if userModels.User.objects.filter(id=receiver).exists() is False:
			print(self.user.id, 'try to invite', receiver, 'but he dont exist') #TO DEL
			return

		receiverModel = userModels.User.objects.get(id=receiver)

		if receiverModel.connexionStatus != connexionStatus.Connected:
			print(self.user.id, 'try to invite', receiver, 'but he is not online')
			return

		if self.isBlock(receiverModel):
			print(self.user.id, 'try to invite', receiver, 'but he block him')
			return

		if self.isBlockBy(receiverModel):
			print(self.user.id, 'try to invite', receiver, 'who block him') #TO DEL
			return

		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(receiver),
				{
					'type': 'receiveInvitationBattleship',
					'sender': self.UserModel.nickname,
					'sender_id': self.id
					}
				)

	def acceptInvitationPong(self, sender):
		senderModel = userModels.User.objects.get(id=sender)
		if senderModel is None:
			return

		gameId = 'privatePong' + str(self.id) + '_' + str(sender)
		pongManager.createGame(self.user, self.allUsers[sender], gameId, None)

		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(sender),
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
		senderModel = userModels.User.objects.get(id=sender)
		if senderModel is None:
			return

		gameId = 'privateBattleship' + str(self.id) + '_' + str(sender)
		battleshipManager.CreateGame(battleshipManager, self.user, self.allUsers[sender], gameId, 0, None)

		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(sender),
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

	def refuseInvitation(self, target, sender):
		senderModel = userModels.User.objects.get(id=sender)
		if senderModel is None:
			return

		async_to_sync(self.channel_layer.group_send)(
				'chat_' + str(target),
				{
					'type': 'refusedInvitation',
					'userId': senderModel.id,
					'userName': senderModel.nickname
				})

	def readMessage(self, data):
		ColorPrint.prLGreen('Data = ' + str(data))
		if MessageModels.objects.filter(receiver=data['receiver']).exists() is False:
			return

		lastMsg = MessageModels.objects.filter(receiver=data['receiver']).order_by('-id')[:1]
		lastMsg = MessageModels.objects.get(id=lastMsg[0].id)

		if ChannelModels.objects.filter(channelName=data['receiver']).exists():
			tabReadBy = lastMsg.readBy
			tabReadBy.append(str(self.id))
			lastMsg.readBy = tabReadBy
		else:
			lastMsg.isRead = True

		lastMsg.save()

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
		self.send(text_data=json.dumps({
			'type': 'receive_invitation_pong',
			'sender': event['sender'],
			'sender_id': event['sender_id']
			}))

	def receiveInvitationBattleship(self, event):
		sender = event['sender']

		self.send(text_data=json.dumps({
			'type': 'receive_invitation_battleship',
			'sender': event['sender'],
			'sender_id': event['sender_id']
			}))

	def refusedInvitation(self, event):
		self.send(json.dumps({
			'type': 'refused_invitation',
			'sender_id': event['userId'],
			'sender': event['userName']
			}))

	#CHAT RECEIVE
	def chatPrivateMessage(self, event):
		sender = event['sender']
		senderNickname = event['senderNickname']
		message = event['message']

		self.send(text_data=json.dumps({
			'type': 'chat_private_message',
			'sender': sender,
			'senderNickname': senderNickname,
			'receiver': self.id,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
			}))

	def chatChannelMessage(self, event):
		sender = event['sender']
		message = event['message']
		channel = event['channel']

		senderModel = userModels.User.objects.get(id=sender)
		if self.isBlock(senderModel):
			print(sender, 'try to send a message on channel', channel, 'to', self.user.id, 'but he block him') #TO DEL
			return

		self.send(text_data=json.dumps({
			'type': 'chat_channel_message',
			'channel': channel,
			'sender': senderModel.nickname,
			'senderID':  senderModel.id,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
			}))

	def updateStatus(self, event):
		userId = event['id']
		newStatus = event['status']

		print('updateStatus', userId, 'is', newStatus)
		self.send(text_data=json.dumps({
			'type': 'update_connexion_status',
			'user_id': userId,
			'new_status': newStatus,
		}))

	def searchConv(self, input):
		allUsers = userModels.User.objects.exclude(Q(id=5) | Q(id = self.UserModel.id))
		print('allUsers: ', allUsers)
		response = []

		for chan in self.allChannels.keys():
			print('channel: ', self.allChannels[chan])
			if chan.find(input) >= 0:
				print('user:', self.id, 'chan users:', self.allChannels[chan].ChanModel.users)
				if self.id in self.allChannels[chan].ChanModel.users:
					member =  True
				else :
					member = False
				response.append({
					'type': 'channel',
					'name': chan,
					'users': self.allChannels[chan].ChanModel.users,
					'description': self.allChannels[chan].ChanModel.description,
					'member': member,
					'privacy_status': self.allChannels[chan].ChanModel.privacyStatus,
					'last_msg': "",
					'friend' : 'unknown'
					})



		for user in allUsers:
			if user.nickname.find(input) >= 0:
				msgs = MessageModels.objects.filter(
					(Q(sender=str(self.id)) & Q(receiver=user.id)) |
					(Q(receiver=str(self.id)) & Q(sender=user.id))).order_by('-id')

				connexionStatus = user.connexionStatus
				friendStatus = 'friend'
				if user.PendingInvite is not None and self.id in user.PendingInvite:
					friendStatus = 'unknown'
				elif user.Friends is not None and self.id in user.Friends:
					friendStatus = 'unknown'
				if msgs.count() > 0:
					if msgs[0].sender == self.UserModel.id:
						sender = 'Me'
					else:
						sender = userModels.User.objects.get(id=msgs[0].sender).nickname
					response.append({
						'type': 'private_message',
						'name': user.nickname,
						'id': user.id,
						'connexion_status': connexionStatus,
						'last_msg': {
							'message': msgs[0].message,
							'sender': sender
							},
						'friend': friendStatus,
						})
				else:
					response.append({
						'type': 'private_message',
						'name': user.nickname,
						'id': user.id,
						'connexion_status': connexionStatus,
						'last_msg': '',
						'friend': friendStatus,
						})

		def getConvName(conv):
			return(conv['name'].lower())

		response.sort(key = getConvName)
		print(response)
		self.send(json.dumps({
			'type': 'search_conv',
			'data': response
			}))


	def createChannel(self, channelName, channelDescription, privacyStatus, password, adminId):
		if ChannelModels.objects.filter(channelName=channelName).exists() is False:
			if (privacyStatus != 1):
				password = None
			print(channelName, channelDescription, privacyStatus, password,  adminId)
			import re
			if (re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/]", channelName) != None):
				return
			elif (re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/]", channelDescription) != None):
				return
			elif (password != None and (re.search(r"[\<\>\'\"\{\}\[\]\\\|\(\)\/]", password) != None)):
				return
			self.allChannels[channelName] = ChannelChat(channelName, channelDescription, privacyStatus, password,  adminId)
			# self.allChannels[channelName].joinChannel(self.UserModel)
			self.UserModel.channels.append(channelName)
			self.UserModel.save()
			async_to_sync(self.channel_layer.group_add)(
				'channel_' + channelName,
				self.channel_name
			)
			# self.joinChannel(channelName, False, None, 1)
			ColorPrint.prBlue(self.allChannels[channelName].usersSocket)
			self.send(json.dumps({
				'type': 'channel_creation',
				'state': 'success',
				'channel_name': self.allChannels[channelName].channelName
				})
			 )
		else:
			self.send(json.dumps({
				'type': 'channel_creation',
				'state': 'failed',
				'reason': 'Channel already exists'
				})
			 )

	def editDescription(self, channelName, newDescription):

		if ChannelModels.objects.filter(channelName=channelName).exists() is False:
			self.send(json.dumps({
				'type': 'edit_description',
				'channel_name': channelName,
				'state': 'failed'
				}))

		channel = ChannelModels.objects.get(channelName=channelName)
		channel.description = newDescription
		ColorPrint.prGreen(channel)
		channel.save()
		self.send(json.dumps({
			'type': 'edit_description',
			'channel_name': channelName,
			'state': 'success'
			}))

	def kickUser(self, channelName, userId):
		channel = ChannelModels.objects.get(channelName=channelName)

		if str(userId) not in channel.users:
			return
		channel.users.remove(str(userId))

		channel.save()

	def InviteToFriend(self, target):
		if userModels.User.objects.filter(id=target).exists() is False or target == self.id:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he doesn't exist.".format(usrID=self.user.id, targetID=target))
			return

		if self.UserModel.Friends is not None and target in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but they was already friend.".format(usrID=self.user.id, targetID=target))
			return

		TargetModel = userModels.User.objects.get(id=target)

		if TargetModel.PendingInvite is not None and self.id in TargetModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he already have a pending request.".format(usrID=self.user.id, targetID=target))
			return

		if self.isBlock(TargetModel):
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he block him.".format(usrID=self.user.id, targetID=target))
			return

		if self.isBlockBy(TargetModel):
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} who block him.".format(usrID=self.user.id, targetID=target))
			return

		if TargetModel.PendingInvite is not None and self.id in TargetModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he already have a pending request.".format(usrID=self.user.id, targetID=target))
			return

		if self.UserModel.PendingInvite is not None and target in self.UserModel.PendingInvite:
			self.UserModel.PendingInvite.remove(target)
			if self.UserModel.Friends is not None:
				self.UserModel.Friends.append(target)
			else:
				self.UserModel.Friends = [target]
			self.UserModel.save()
			if TargetModel.Friends is not None:
				TargetModel.Friends.append(self.id)
			else:
				TargetModel.Friends = [self.id]
			TargetModel.save()
			return

		if TargetModel.PendingInvite is not None:
			TargetModel.PendingInvite.append(self.id)
		else:
			TargetModel.PendingInvite = [self.id]
		TargetModel.save()

		async_to_sync(self.channel_layer.group_send)(
		'chat_' + str(target),
		{
			'type': 'receiveFriendInvitation',
			'sender': self.id
		})

	def receiveFriendInvitation(self, sender):
		ColorPrint.prGreen('FriendShipRequestReceived')
		if userModels.User.objects.filter(id=sender['sender']).exists() is False or sender['sender'] == self.id:
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but he dont exist.".format(usrID=self.user.id, targetID=sender['sender']))
			return

		if self.UserModel.Friends is not None and sender['sender'] in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but they was already friend.".format(usrID=self.user.id, targetID=sender['sender']))
			return

		targetModel = userModels.User.objects.get(id=sender['sender'])

		if self.isBlock(targetModel):
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but he block him.".format(usrID=self.user.id, targetID=sender['sender']))
			return

		if self.isBlockBy(targetModel):
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} who block him.".format(usrID=self.user.id, targetID=sender['sender']))
			return

		self.send(text_data=json.dumps({
			'type': 'receive_friendship_invitation',
			'sender': sender['sender']
			}))

	def friendshipRequestResponse(self, result, sender):
		if userModels.User.objects.filter(id=sender).exists() is False or sender == self.id:
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but he dont exist.".format(usrID=self.user.id, targetID=sender))
			return

		if self.UserModel.Friends is not None and sender in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but they was already friend.".format(usrID=self.user.id, targetID=sender))
			return

		if self.UserModel.PendingInvite is None or sender not in self.UserModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try answering a friendship request from {targetID} but invite not exisiting.".format(usrID=self.user.id, targetID=sender))
			return

		senderModel = userModels.User.objects.get(id=sender)

		if self.isBlock(senderModel):
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but he block him.".format(usrID=self.user.id, targetID=sender))
			result = False

		if self.isBlockBy(senderModel):
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} who block him.".format(usrID=self.user.id, targetID=sender))
			result = False

		if result == True:
			self.UserModel.PendingInvite.remove(sender)
			if self.UserModel.Friends is not None:
				self.UserModel.Friends.append(sender)
			else:
				self.UserModel.Friends = [sender]
			self.UserModel.save()
			TargetModel = userModels.User.objects.get(id=sender)
			if TargetModel.Friends is not None:
				TargetModel.Friends.append(self.id)
			else:
				TargetModel.Friends = [self.id]
			TargetModel.save()
		if result == False:
			self.UserModel.PendingInvite.remove(sender)
			self.UserModel.save()
			return

	def RetrieveFriendInvitation(self):
		invitList = []
		if self.UserModel.PendingInvite is not None:
			for invit in self.UserModel.PendingInvite:
				invitList.append({
					'senderNick' : userModels.User.objects.get(id=invit).nickname,
					'id' : invit
				})
		self.send(text_data=json.dumps({
			'type': 'ReceiveFriendshipPendingInvit',
			'pendingInvit' : invitList
		}))

	def RetrieveFriendConversation(self, limiter):
		allMessages = MessageModels.objects.filter(type='P').filter(Q(sender=self.id) | Q(receiver=self.id)).order_by('-id').values()
		allUsers = userModels.User.objects.exclude(Q(id=5) | Q(id = self.user.id))

		contactList = []
		for msg in allMessages:
			if (msg['sender'] == self.id):
				contact = msg['receiver']
				msgSender = 'Me'
			else:
				contact = msg['sender']
				msgSender = contact
			if contact not in contactList:
				contactList.append(contact)

		allConv = []

		for user in allUsers:
			if self.UserModel.Friends is not None and user.id in self.UserModel.Friends and user.nickname.startswith(limiter):
				ColorPrint.prGreen(user.id)
				lastMsg = None
				isRead = True
				connexionStatus = user.connexionStatus
				if user.id in contactList:
					lastMsg = MessageModels.objects.filter(
							(Q(sender=str(self.id)) & Q(receiver=user.id)) |
							(Q(receiver=str(self.id)) & Q(sender=user.id))).order_by('-id')[0]
					if lastMsg.sender == self.id:
						isRead = True
					else:
						isRead = lastMsg.isRead
					last_msg = {
						'msg': lastMsg.message,
						'sender': user.nickname
					}
				else:
					last_msg = None
				allConv.append({
					'type': 'private',
					'name': user.nickname,
					'id': user.id,
					'connexionStatus': connexionStatus,
					'last_msg': last_msg,
					'timestamp': lastMsg.timeCreation if lastMsg is not None else datetime.datetime.min.replace(tzinfo=datetime.timezone.utc),
					'isRead': isRead,
					'friend': 'unknown',
					})

		def cmpTimeStamp(msg):
			return msg['timestamp']

		allConv.sort(key = cmpTimeStamp, reverse = False)
		for conv in allConv:
			if conv['timestamp'] == datetime.datetime.min:
				conv['timestamp'] = ''
			else:
				conv['timestamp'] = str(conv['timestamp'])
		self.send(text_data=json.dumps({
			'type': 'ReceiveFriendsConversation',
			'data': allConv
			}))
