import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class socket(AsyncWebsocketConsumer):
	async def connect(self):
		user_id = self.scope['user'].id

		await self.channel_layer.group_add(
            f"user_{user_id}",
            self.channel_name
        )

		connected_users = await self.channel_layer.group_channels(f"user_*")
		user_list = [channel.split("_")[1] for channel in connected_users]
		await print(json.dumps({'connected_users': user_list}))
		await self.accept()

	async def disconnect(self, close_code):
		user_id = self.scope['user'].id
		await self.channel_layer.group_discard(
            f"user_{user_id}",
            self.channel_name
        )
		print(f"Utilisateur déconnecté: {self.scope['user']}")

	async def receive(self, text_data):
		data = json.loads(text_data)

        # Vérifier le type du message
		if data['type'] == 'disconnect':
            # Traitement de la déconnexion
			self.close()  # Fermer la connexion WebSocket