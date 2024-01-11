from .enumChat import channelPrivacy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChannelModels, MessageModels
from authApp import models as userModels
import time

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
		self.usersSocket = []

		if self.admin is not None:
			self.usersSocket.append(creator)

			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = self.privacyStatus,
				users=[str(self.admin.username)],
			)

		else:
			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = channelPrivacy.Public,
			)

		obj.save()

		self.model = obj

		self.joinChannel(creator)

		print('channel is', obj.channelName, 'with', obj.users)


	def joinChannel(self, user):
		if user is None:
			return

		if user not in self.usersSocket:
			self.usersSocket.append(user)

		tab = self.model.users
		if tab is None:
			tab = []
			tab.append(str(user.username))

		elif str(user.username) not in self.model.users:
			tab.append(str(user.username))

		self.model.users = tab

		print(user.username, 'join channel', self.channelName, 'with', self.model.users)

	def leaveChannel(self, user):
		if user is None:
			return

		if user in self.usersSocket:
			self.usersSocket.remove(user)

		if self.model.users is not None:
			tab = self.model.users
			tab.remove(str(user.username))
			self.model.users = tab

		print(user.username, 'leave channel', self.channelName, 'with', self.model.users)

	def sendMessageChannel(self, sender, message):
		msg = MessageModels.objects.create(
			message=message,
			sender=str(sender),
			receiver=self.channelName
		)
		msg.save()

		async_to_sync(self.channel_layer.group_send)(
            'channel' + self.channelName,
            {
                'type': 'chatChannelMessage',
				'channel': self.channelName,
				'sender': sender,
				'message': message,
				'time': time.strftime("%Y-%m-%d %X")
            }
        )
