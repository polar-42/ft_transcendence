from .enumChat import channelPrivacy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChannelModels, MessageModels
from authApp import models as userModels
from django.contrib.auth.hashers import make_password
import time

class ChannelChat():
	def __init__(self, name, description, privacyStatus, password, creator):
		from ft_transcendence import ColorPrint
		if ChannelModels.objects.filter(channelName=name).exists():

			self.ChanModel = ChannelModels.objects.get(channelName=name)
			self.channelName = self.ChanModel.channelName
			self.channelId = self.ChanModel.id
			self.privacyStatus = self.ChanModel.privacyStatus
			self.password = self.ChanModel.password
			self.usersSocket = []
			self.channel_layer = get_channel_layer()
			if self.ChanModel.admin != '0':
				self.admin = self.ChanModel.admin
				self.usersSocket.append(creator)
			else:
				self.admin = None

			return

		print('entered pwd:', password, ' hash: ', make_password(password))
		self.channelName = name
		self.description = description
		self.privacyStatus = channelPrivacy(privacyStatus)
		self.password = make_password(password)
		self.channel_layer = get_channel_layer()
		self.usersSocket = []

		if creator != None:
			self.admin = userModels.User.objects.get(id=creator)
			self.usersSocket.append(creator)
			# self.usersSocket.append(creator)

			print('admin: ',self.admin)
			obj = ChannelModels.objects.create(
					channelName=self.channelName,
					admin=self.admin.id,
					privacyStatus = self.privacyStatus,
					password = self.password,
					description = self.description,
					users=[self.admin.id],
					)
			print(self.admin.id, 'create channel', self.channelName)

		else: #ONLY FOR GENERAL CHANNEL
			self.admin = creator
			obj = ChannelModels.objects.create(
					channelName=self.channelName,
					privacyStatus = channelPrivacy.Public,
					description = self.description,
					)

		obj.save()

		self.ChanModel = obj
		self.channelId = obj.id

		# self.joinChannel(self.admin)
		from ft_transcendence import ColorPrint
		# ColorPrint.prBlue(self.usersSocket)
		print('channel is', obj.channelName, 'with', obj.users)


	def joinChannel(self, user):
		print(user)
		if user is None:
			return

		if user not in self.usersSocket:
			self.usersSocket.append(user)

		tab = self.ChanModel.users
		if tab is None:
			tab = []
			tab.append(str(user.id))

		elif str(user.id) not in self.ChanModel.users:
			tab.append(str(user.id))

		self.ChanModel.users = tab
		self.ChanModel.save()

		print(user.id, 'join channel', self.channelName, 'with', self.ChanModel.users)

	def leaveChannel(self, user):
		if user is None or user not in self.usersSocket:
			return

		if user in self.usersSocket:
			self.usersSocket.remove(user)

		if self.ChanModel.users is not None:
			tab = self.ChanModel.users
			if str(user.id) in tab:
				tab.remove(str(user.id))
				self.ChanModel.users = tab
				self.ChanModel.save()

		print(user.id, 'leave channel', self.channelName, 'with', self.ChanModel.users) #TO DEL

	def sendMessageChannel(self, sender, message):
		tabRead = []
		tabRead.append(sender.id)
		msg = MessageModels.objects.create(
				message=message,
				sender=sender.id,
				receiver=self.channelName,
				readBy=tabRead,
				type='C'
				)

		msg.save()
		allMessages = MessageModels.objects.filter(receiver=self.channelName).order_by('-id')[:2]
		if len(allMessages) > 2:
			chan = ChannelModels.objects.get(id=self.channelId)
			allMessages[1].readBy = chan.users
			chan.save()

		async_to_sync(self.channel_layer.group_send)(
				'channel_' + self.channelName,
				{
					'type': 'chatChannelMessage',
					'channel': self.channelName,
					'sender': sender.id,
					'message': message,
					'time': time.strftime("%Y-%m-%d %X")
					}
				)
