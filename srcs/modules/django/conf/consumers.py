import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from transcendence.models import User

class MyClient(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            self.username = self.scope["user"].username
            self.room_group_name = f"chat_{self.username}"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

        #self.room_group_name = 'test'
        
        #await self.channel_layer.group_add(
        #    self.room_group_name,
        #    self.channel_name   
        #)
        
            await self.accept()

            await self.send(text_data=json.dumps({
                'type': 'Connexion established',
                'message': 'You are now connected'
            }))
        else:
            await self.close()
            print('User is not connected')
        
    async def disconnect(self, close_code):
        if self.scope["user"].is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        target_user = text_data_json.get('target_user')
        
        
        #if User.objects.filter(username=target_user).exists():
            
        target_channel_name = f"chat_{target_user}"
        print('Message:', message)
        await self.channel_layer.group_send(
            target_channel_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
        await self.send(text_data=json.dumps({
            'type': 'Chat message send',
            'message': message
        }))
            
        #else:
        #    await self.send(text_data=json.dumps({
        #        'type': 'system',
        #        'message': f'The user {target_user} does not exist.'
        #    }))
        #    print('No target user')
    
    async def chat_message(self, event):
        message = event['message']
        
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))
