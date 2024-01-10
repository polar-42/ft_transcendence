from .enumChat import channelPrivacy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChannelModels
from authApp import models as userModels

class ChannelChat():
	def __init__(self, name, privacyStatus, creator):
		if ChannelModels.objects.filter(channelName=name).exists():

			self.model = ChannelModels.objects.get(channelName=name)
			self.channelName = self.model.channelName
			self.privacyStatus = self.model.privacyStatus
			self.usersSocket = []
			self.channel_layer = get_channel_layer()

			if self.model.admin != '0':
				self.admin = self.model.admin
				self.usersSocket.append(creator)
			else:
				self.admin = None

			return

		self.channelName = name
		self.privacyStatus = channelPrivacy(privacyStatus)
		self.admin = creator
		self.channel_layer = get_channel_layer()

		if self.admin is not None:
			self.usersSocket = [creator]
			print(self.admin.username, 'create channel', self.channelName)

			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = self.privacyStatus,
				users=[str(self.admin.username)],
			)

		else:
			self.usersSocket = []
			print('channel', self.channelName, 'is created')

			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = channelPrivacy.Public,
			)

		obj.save()

		self.model = obj

		self.joinChannel(creator)

		print('channel is', obj.channelName, 'with', obj.users)


	def joinChannel(self, user):
		if user not in self.usersSocket:
			self.usersSocket.append(user)

		if self.model.users is None:
			self.model.users = [str(user.username)]

		elif str(user.username) not in self.model.users:
			tab = self.model.users
			tab.append(str(user.username))
			self.model.users = tab

			print(user.username, 'is on channels', tab)

		print(user.username, 'join channel', self.channelName)
		print('there is', self.model.users, 'in', self.channelName)

	def leaveChannel(self, user):
		self.usersSocket.remove(user)

		if self.model.users is not None:
			tab = self.model.users
			tab.remove(str(user.username))
			self.model.users = tab

			tab = userModels.User.objects.get(username=str(user.username)).channels
			if tab is None:
				tab = []
			tab.remove(self.channelName)
			userModels.User.objects.get(username=str(user.username)).channels = tab

		print(user.username, 'leave channel', self.channelName)
		print('there is', self.model.users, 'in', self.channelName)

	def receiveMessage(self, sender, message):
		pass

	def sendMessage(self, sender, message):
		async_to_sync(self.channel_layer.group_send)(
            'channel' + self.channelName,
            {
                'type': 'chatChannelMessage',
				'channel': self.channelName,
				'sender': sender,
				'message': message
            }
        )
