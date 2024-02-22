import json
from channels.generic.websocket import WebsocketConsumer
from ..models import PongGameModels
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync, sync_to_async
from . import pongThreadsIA
from authApp.models import User
from chatApp.enumChat import connexionStatus


class PongGameIASocket(WebsocketConsumer):
	def connect(self):
		self.canSend = True
		self.user = self.scope['user']
		self.id = self.user.id

		self.accept()

		obj = User.objects.get(id=int(self.id))
		obj.connexionStatus = connexionStatus.Busy
		obj.save()

		async_to_sync(self.channel_layer.group_add)(
			"PongGameVsIA_" + str(self.id),
			self.channel_name
		)

		self.pongGameThread = pongThreadsIA.pongGame()

		self.pongGameThread.launchGame("PongGameVsIA_" + str(self.id), self)

	def disconnect(self, close_code):
		self.canSend = False
		if self.pongGameThread is None:
			return
		self.canSend = True
		async_to_sync(self.channel_layer.group_discard)(
			"PongGameVsIA_" + str(self.id),
			self.channel_name
		)

		self.pongGameThread.quitGame(self)

		obj = User.objects.get(id=int(self.id))
		obj.connexionStatus = connexionStatus.Connected
		obj.save()

		AI_id = User.objects.get(nickname='AI').id

		addToDb(self.id, AI_id, 0, 3, AI_id, 0, 3, 'disconnexion')

	def receive(self, text_data):
		if self.pongGameThread is None:
			return

		data = json.loads(text_data)

		message = data['message']

		if message == 'input':
			self.pongGameThread.inputGame(data['input'], self)


	def end_game_by_score(self, event):
		winner = event['winner']

		print('Game is win by', winner)

		async_to_sync(self.channel_layer.group_discard)(
			"PongGameVsIA_" + str(self.id),
			self.channel_name
		)

		self.pongGameThread.finishGame()

		playerone_score = event['playerone_score']
		playertwo_score = event['playertwo_score']

		n_ball_touch_player1 = event['number_ball_touch_player1']
		n_ball_touch_player2 = event['number_ball_touch_player2']

		AI_id = User.objects.get(nickname='AI').id

		if winner != 'AI':
			winnerName = User.objects.get(id=int(winner)).nickname
		else:
			winnerName = 'AI'
			winner = AI_id

		self.send(text_data=json.dumps({
    			'type': 'game_ending',
				'winner': winnerName,
				'reason': 'score',
				'playerone_score': str(playerone_score),
				'playertwo_score': str(playertwo_score),
				'playerone_username': self.user.nickname,
				'playertwo_username': 'AI',
    	}))


		addToDb(self.id, AI_id, playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, 'score')
		self.pongGameThread = None

		self.close()

def addToDb(player1_id, player2_id, playerone_score, playertwo_score, winner, n_ball_touch_player1, n_ball_touch_player2, reason_end):

	obj = PongGameModels.objects.create(
			player1=player1_id,
			player2=player2_id,
			score_player1=str(playerone_score),
			score_player2=str(playertwo_score),
			number_ball_touch_player1=str(n_ball_touch_player1),
			number_ball_touch_player2=str(n_ball_touch_player2),
			winner=str(winner),
			reason=reason_end
	)

	obj.save()

	player1Model = User.objects.get(id=int(player1_id))
	player2Model = User.objects.get(id=int(player2_id))

	player1Model.Pong_BallHit += n_ball_touch_player1
	player1Model.Pong_Point += playerone_score
	player1Model.Pong_PointTaken += playertwo_score
	player1Model.Pong_Game += 1

	player2Model.Pong_BallHit += n_ball_touch_player2
	player2Model.Pong_Point += playertwo_score
	player2Model.Pong_PointTaken += playerone_score
	player2Model.Pong_Game += 1

	if str(winner) == str(player1_id):
		player1Model.Pong_Win += 1
		player2Model.Pong_Lose += 1
	else:
		player2Model.Pong_Win += 1
		player1Model.Pong_Lose += 1

	if str(player2Model.id) == 'AI':
		if str(winner) == str(player2Model.id):
			player1Model.Pong_Versus_AI += 1
		else:
			player1Model.Pong_Versus_AI -= 1

	player1Model.save()
	player2Model.save()

	print('pongGame between playerId =', str(player1_id), 'and', str(player2_id), 'is win by', str(winner), 'and reason is', reason_end)
