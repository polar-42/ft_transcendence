from .enumChat import channelPrivacy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChannelModels, MessageModels
from authApp import models as userModels
import time

class ChannelChat():
	def __init__(self, name, privacyStatus, creator):
		if ChannelModels.objects.filter(channelName=name).exists():

			self.ChanModel = ChannelModels.objects.get(channelName=name)
			self.channelName = self.ChanModel.channelName
			self.channelId = self.ChanModel.id
			self.privacyStatus = self.ChanModel.privacyStatus
			self.usersSocket = []
			self.channel_layer = get_channel_layer()

			if self.ChanModel.admin != '0':
				self.admin = self.ChanModel.admin
				self.usersSocket.append(creator)
			else:
				self.admin = None

			return

		self.channelName = name
		self.privacyStatus = channelPrivacy(privacyStatus)
		self.admin = creator
		self.channel_layer = get_channel_layer()
		self.usersSocket = []

		if self.admin is not None:
			self.usersSocket.append(creator)

			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = self.privacyStatus,
				users=[self.admin.userIdentification],
			)
			print(self.admin.userIdentification, 'create channel', self.channelName)

		else: #ONLY FOR GENERAL CHANNEL
			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = channelPrivacy.Public,
			)

		obj.save()

		self.ChanModel = obj
		self.channelId = obj.id

		self.joinChannel(creator)

		print('channel is', obj.channelName, 'with', obj.users)


	def joinChannel(self, user):
		if user is None:
			return

		if user not in self.usersSocket:
			self.usersSocket.append(user)

		tab = self.ChanModel.users
		if tab is None:
			tab = []
			tab.append(user.userIdentification)

		elif user.userIdentification not in self.ChanModel.users:
			tab.append(user.userIdentification)

		self.ChanModel.users = tab
		self.ChanModel.save()

		print(user.userIdentification, 'join channel', self.channelName, 'with', self.ChanModel.users)

	def leaveChannel(self, user):
		if user is None or user not in self.usersSocket:
			return

		if user in self.usersSocket:
			self.usersSocket.remove(user)

		if self.ChanModel.users is not None:
			tab = self.ChanModel.users
			if user.userIdentification in tab:
				tab.remove(user.userIdentification)
				self.ChanModel.users = tab
				self.ChanModel.save()

		print(user.userIdentification, 'leave channel', self.channelName, 'with', self.ChanModel.users) #TO DEL

	def sendMessageChannel(self, sender, message):
		msg = MessageModels.objects.create(
			message=message,
			sender=sender.userIdentification,
			receiver=self.channelName
		)
		msg.save()

		async_to_sync(self.channel_layer.group_send)(
            'channel_' + self.channelName,
            {
               'type': 'chatChannelMessage',
				'channel': self.channelName,
				'sender': sender.userIdentification,
				'message': message,
				'time': time.strftime("%Y-%m-%d %X")
            }
        )
