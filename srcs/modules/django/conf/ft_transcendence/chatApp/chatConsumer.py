import json, time, datetime
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .enumChat import connexionStatus, channelPrivacy
from django.db import models
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
		self.identification = self.scope['user'].identification

		self.UserModel = userModels.User.objects.get(identification=self.identification)
		self.UserModel.connexionStatus = connexionStatus.Connected
		self.UserModel.save()

		self.identification = self.UserModel.identification
		self.allUsers[self.identification] = self.user
		self.chatId = 'chat_' + self.identification

		print(self.user.identification, 'is connected to chat socket with chatId =', self.chatId) #TO DEL

		tabChannels = self.UserModel.channels


		async_to_sync(self.channel_layer.group_add)(
				self.chatId,
				self.channel_name
				)

		self.accept()

		if tabChannels is not None:
			for chan in tabChannels:
				privacyStatus = ChannelModels.objects.get(channelName=chan).privacyStatus
				password = ChannelModels.objects.get(channelName=chan).password
				self.joinChannel(chan, privacyStatus, password, 0)
				# self.allChannels[chan].joinChannel(self)
				# async_to_sync(self.channel_layer.group_add)(
				# 		'channel_' + chan,
				# 		chan
				# 		)

		else:
			tabChannels = []
			self.joinChannel('General', 0, None, 0)
			# self.allChannels['General'].joinChannel(self)
			# async_to_sync(self.channel_layer.group_add)(
			# 		'channel_General',
			# 		'General'
			# 		)
			# tabChannels.append('General')

		self.UserModel.channels = tabChannels
		self.UserModel.save()
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
				print(userModels.User.objects.get(identification=x).nickname)

	def disconnect(self, code):
		self.UserModel = userModels.User.objects.get(identification=self.identification)
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

		self.allUsers.pop(self.identification)

		self.close()

	def receive(self, text_data):
		self.UserModel = userModels.User.objects.get(identification=self.identification)
		data = json.loads(text_data)

		match(data['type']):
			case 'chat_message':
				self.sendPrivateMessage(data['target'], data['message'])
			case 'channel_message':
				self.sendChannelMessage(data['target'], data['message'])
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
				self.invit_to_friend(data['target'])
			case 'receiveFriendInvitation':
				self.receiveFriendInvitation(data['sender'])

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
		if userModels.User.objects.filter(identification=receiver).exists() is False or receiver == self.identification:
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
				sender=self.identification,
				receiver=receiver,
				type='P'
				)
		msg.save()

		print(msg.sender, ' send ', msg.message, ' to ', msg.receiver)
		async_to_sync(self.channel_layer.group_send)(
				'chat_' + receiver,
				{
					'type': 'chatPrivateMessage',
					'sender': self.identification,
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

	def getLastChats(self):
		allConv = [] 
		if self.UserModel.channels is not None:
			print(self.UserModel.channels)
			for chan in self.UserModel.channels:
				chanMsgs = MessageModels.objects.filter(type='C').filter(Q(sender=chan) | Q(receiver=chan)).order_by('-id')
				if chanMsgs.exists():
					lastMsg = chanMsgs[0].message
					lastMsgSender = chanMsgs[0].sender
					timestamp = chanMsgs[0].timeCreation
				else:
					lastMsg = ''
					lastMsgSender = ''
					timestamp = datetime.datetime.min.replace(tzinfo=datetime.timezone.utc) 

				data = {
						'type': 'channel',
						'name': chan,
						'last_msg': { 
				   'sender': lastMsgSender, 
				   'msg': lastMsg },
						'timestamp': timestamp 
						}
				allConv.append(data)

		allMessages = MessageModels.objects.filter(type='P').filter(Q(sender=self.identification) | Q(receiver=self.identification)).order_by('-id').values()
		contactList = []
		for msg in allMessages:
			if (msg['sender'] == self.identification):
				contact = msg['receiver']
				msgSender = 'Me'
			else:
				contact = msg['sender']
				msgSender = contact
			if contact not in contactList:
				contactList.append(contact)
		for contact in contactList:
			msg = allMessages.filter(Q(sender=contactList[0]) | Q(receiver=contactList[0])).order_by('-id')[0]
			connexionStatus = userModels.User.objects.get(identification=contact).connexionStatus
			allConv.append({
				'type': 'private',
				'name': userModels.User.objects.get(identification=contact).nickname,
				'id': userModels.User.objects.get(identification=contact).identification,
				'connexionStatus': connexionStatus,
				'last_msg': {
					'msg': msg['message'],
					'sender': msgSender },
				'timestamp': msg['timeCreation']
				})

		def cmpTimeStamp(msg):
			return msg['timestamp']

		print(allConv)
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

			if blockedUser is not None and user.identification in blockedUser:
				return True

		return False

	def isBlockBy(self, user):
		if userModels.User.objects.filter(id=user.id).exists():
			blockedUser = userModels.User.objects.get(identification=user.identification).blockedUser

			if blockedUser is not None and self.identification in blockedUser:
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

	def getUser(self, target):
		user = userModels.User.objects.get(identification=target)
		self.send(text_data=json.dumps({
			'type': 'get_user_data',
			'name': user.nickname,
			'identification':  user.identification,
			'connexion_status': user.connexionStatus,
			'conversation': user.allPrivateTalks
			})
			)

	def getChannel(self, target):
		channel = ChannelModels.objects.get(channelName=target)
		msgsObjs = MessageModels.objects.filter(receiver=channel.channelName)
		if channel.admin == self.UserModel.identification:
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
			user = userModels.User.objects.get(identification=userName)
			channelUsers.append({
				'name': user.nickname,
				'id': user.identification,
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
		if userModels.User.objects.filter(identification=chatTarget).exists() is False:
			return

		print('conv between ', self.identification, ' and ', chatTarget)
		modelChatTarget = userModels.User.objects.get(identification=chatTarget)
		if msgId == 0:
			self.send(json.dumps({
				'type': 'actualize_chat_history',
				'data': {}
				})
			 )
			return
		elif msgId == -1:
			type = 'chat_history'		
			messages = MessageModels.objects.filter(
					(Q(sender=str(self.identification)) & Q(receiver=modelChatTarget.identification)) |
					(Q(receiver=str(self.identification)) & Q(sender=modelChatTarget.identification))).order_by('-id')[:10]
		else:
			type = 'actualize_chat_history'
			messages = MessageModels.objects.filter(
					(Q(sender=str(self.identification)) & Q(receiver=modelChatTarget.identification)) & Q(id__lt=int(msgId))  |
					(Q(receiver=str(self.identification)) & Q(sender=modelChatTarget.identification) & Q(id__lt=int(msgId)))).order_by('-id')[:10]

		response = []
		for msg in messages.values():
			if msg['sender'] == self.identification:
				received = False
				contact = self.identification
			else:
				received = True
				contact = msg['sender']


			response.append({
				'id': msg['id'],
				'time': str(msg['timeCreation']),
				'contact': contact,
				'received': received,
				'message': msg['message']
				})

		print('response: ',response)
		self.send(json.dumps({
			'type': type,
			'data': response
			})
			)

	def getHistoryChannel(self, channelTarget, msgId):
		if ChannelModels.objects.filter(channelName=channelTarget).exists() is False:
			return

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
			senderModel = userModels.User.objects.get(identification=msg['sender'])

			if self.isBlock(senderModel) is False:
				response.append({
					'id': msg['id'],
					'time': str(msg['timeCreation']),
					'sender': senderModel.nickname,
					'senderID':  senderModel.identification,
					'message': msg['message']
					})

		self.send(json.dumps({
			'type': type,
			'data': response
			})
			)

	def inviteToPong(self, receiver):
		if userModels.User.objects.filter(identification=receiver).exists() is False or receiver == self.identification:
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
					'sender': self.identification
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
					'sender': self.identification
					}
				)

	def acceptInvitationPong(self, sender):
		senderModel = userModels.User.objects.get(identification=sender)
		if senderModel is None:
			return

		gameId = 'privatePong' + self.identification + '_' + sender
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

		gameId = 'privateBattleship' + self.identification + '_' + sender
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

		print('yoo')
		senderModel = userModels.User.objects.get(identification=sender)
		if self.isBlock(senderModel):
			print(sender, 'try to send a message on channel', channel, 'to', self.user.identification, 'but he block him') #TO DEL
			return

		self.send(text_data=json.dumps({
			'type': 'chat_channel_message',
			'channel': channel,
			'sender': senderModel.nickname, 
			'senderID':  senderModel.identification,
			'message': message,
			'time': time.strftime("%Y-%m-%d %X")
			}))

	def searchConv(self, input):
		allUsers = userModels.User.objects.exclude(Q(identification='IA') | Q(identification='admin') | Q(identification = self.UserModel.identification)) 
		response = []

		for chan in self.allChannels.keys():
			print('channel: ', self.allChannels[chan])
			if chan.find(input) >= 0:
				print('user:', self.identification, 'chan users:', self.allChannels[chan].ChanModel.users)
				if self.identification in self.allChannels[chan].ChanModel.users:
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
					'last_msg': "" })


		for user in allUsers:
			if user.identification.find(input) >= 0:
				msgs = MessageModels.objects.filter(Q(receiver=user.identification) | Q(sender=user.identification))

				connexionStatus = user.connexionStatus
				if msgs.count() > 0:
					if msgs[0].sender == self.UserModel.identification:
						sender = 'Me'
					else:
						sender = msgs[0].sender
					response.append({
						'type': 'private_message',
						'name': user.nickname,
						'identification': user.identification,
						'connexion_status': connexionStatus, 
						'last_msg': {
							'message': msgs[0].message,
							'sender': sender
							}
						})
				else:
					response.append({
						'type': 'private_message',
						'name': user.nickname,
						'identification': user.identification,
						'connexion_status': connexionStatus,
						'last_msg': '' })

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
			if (privacyStatus == 1):
				password = password
			else:
				password = None
			print(channelName, channelDescription, privacyStatus, password,  adminId)	
			self.allChannels[channelName] = ChannelChat(channelName, channelDescription, privacyStatus, password,  adminId)
			self.allChannels[channelName].joinChannel(self.UserModel)
			self.joinChannel(channelName, False, None)
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
		print(channel)
		channel.save()
		self.send(json.dumps({
			'type': 'edit_description',
			'channel_name': channelName,
			'state': 'success'
			}))

	def kickUser(self, channelName, userId):
		channel = ChannelModels.objects.get(channelName=channelName)

		if userId not in channel.users:
			return
		channel.users.remove(userId)

		channel.save()

	def invit_to_friend(self, target):
		if userModels.User.objects.filter(identification=target).exists() is False or target == self.identification:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he doesn't exist.".format(self.user.identification, target))
			return

		if target in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but they was already friend.".format(self.user.identification, target))
			return

		targetModel = userModels.User.objects.get(identification=target)

		if self.identification in targetModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he already have a pending request.".format(self.user.identification, target))
			return
	
		if self.isBlock(targetModel):
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he block him.".format(self.user.identification, target))
			return

		if self.isBlockBy(targetModel):
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} who block him.".format(self.user.identification, target))
			return
		
		async_to_sync(self.channel_layer.group_send)(
		'chat_' + target,
		{
			'type': 'receiveFriendInvitation',
			'sender': self.identification
			}
		)
	
	def receiveFriendInvitation(self, sender):
		if userModels.User.objects.filter(identification=sender).exists() is False or sender == self.identification:
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but he dont exist.".format(self.user.identification, sender))
			return
		
		if sender in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but they was already friend.".format(self.user.identification, sender))
			return

		if sender in self.UserModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try sending a friendship request to {targetID} but he already have a pending request.".format(self.user.identification, target))
			return

		if self.isBlock(sender):
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} but he block him.".format(self.user.identification, sender))
			return

		if self.isBlockBy(sender):
			ColorPrint.prYellow("{usrID} receive friendship request from {targetID} who block him.".format(self.user.identification, sender))
			return

		self.UserModel.PendingInvite.append(sender)
		self.UserModel.save()

		self.send(text_data=json.dumps({
			'type': 'receive_friendship_invitation',
			'sender': sender
			}))

	def friendshipRequestResponse(self, result, sender):
		if userModels.User.objects.filter(identification=sender).exists() is False or sender == self.identification:
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but he dont exist.".format(self.user.identification, sender))
			return
		
		if sender in self.UserModel.Friends:
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but they was already friend.".format(self.user.identification, sender))
			return

		if sender not in self.UserModel.PendingInvite:
			ColorPrint.prYellow("{usrID} try answering a friendship request from {targetID} but invite not exisiting.".format(self.user.identification, sender))
			return

		if self.isBlock(sender):
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} but he block him.".format(self.user.identification, sender))
			result = False

		if self.isBlockBy(sender):
			ColorPrint.prYellow("{usrID} answer friendship request from {targetID} who block him.".format(self.user.identification, sender))
			result = False
		
		if result == True:
			self.UserModel.PendingInvite.remove(sender)
			self.UserModel.Friends.append(sender)
			self.UserModel.save()
			TargetModel = userModels.User.objects.get(identification=sender)
			TargetModel.Friends.append(self.identification)
			TargetModel.save()
		if result == False:
			self.UserModel.PendingInvite.remove(sender)
			self.UserModel.save()
			return