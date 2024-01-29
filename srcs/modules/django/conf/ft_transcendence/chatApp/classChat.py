from .enumChat import channelPrivacy
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChannelModels, MessageModels
from authApp import models as userModels
import time

class ChannelChat():
	def __init__(self, name, description, privacyStatus, creator):
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
		self.description = description
		self.privacyStatus = channelPrivacy(privacyStatus)
		self.admin = userModels.User.objects.get(identification=creator)
		self.channel_layer = get_channel_layer()
		self.usersSocket = []

		if self.admin is not None:
			self.usersSocket.append(creator)

			print('admin: ',self.admin)
			obj = ChannelModels.objects.create(
				channelName=self.channelName,
				privacyStatus = self.privacyStatus,
                description = self.description,
				users=[self.admin.identification],
			)
			print(self.admin.identification, 'create channel', self.channelName)

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

		elif user.identification not in self.ChanModel.users:
			tab.append(user.userIdentification)

		self.ChanModel.users = tab
		self.ChanModel.save()

		print(user.identification, 'join channel', self.channelName, 'with', self.ChanModel.users)

	def leaveChannel(self, user):
		if user is None:
			return

		if user in self.usersSocket:
			self.usersSocket.remove(user)

		if self.ChanModel.users is not None:
			tab = self.ChanModel.users
			tab.remove(user.userIdentification)
			self.ChanModel.users = tab
			self.ChanModel.save()

		print(user.identification, 'leave channel', self.channelName, 'with', self.ChanModel.users) #TO DEL

	def sendMessageChannel(self, sender, message):
		msg = MessageModels.objects.create(
			message=message,
			sender=sender.identification,
			receiver=self.channelName #TO CHANGE ???
		)
		msg.save()

		async_to_sync(self.channel_layer.group_send)(
            'channel_' + self.channelName,
            {
               'type': 'chatChannelMessage',
				'channel': self.channelName,
				'sender': sender.identification,
				'message': message,
				'time': time.strftime("%Y-%m-%d %X")
            }
        )
