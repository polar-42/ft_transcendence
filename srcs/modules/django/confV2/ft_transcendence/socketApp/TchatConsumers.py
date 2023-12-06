import json
from channels.generic.websocket import AsyncWebsocketConsumer

class socket(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            self.username = self.scope["user"].username
            self.room_group_name = "chat_" + self.username
            print(self.room_group_name)
        
            await self.accept()

            await self.send(text_data=json.dumps({
                'type': 'Connexion established',
                'message': 'You are now connected'
            }))
        else:
            await self.close()
            print('User is not connected')