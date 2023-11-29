import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from transcendence.models import User
from transcendence.managers import PongGameManager

class MyClient(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_authenticated:
            self.username = self.scope["user"].username
            self.room_group_name = "chat_" + self.username
            print(self.room_group_name)

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        
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
            
        target_channel_name = "chat_" + target_user
        print('Message:', message, 'from', self.username)
        await self.channel_layer.group_send(
            target_channel_name,
            {
                'type': 'chat_message',
                'sender': self.username,
                'message': message
            }
        )
    
        await self.send(text_data=json.dumps({
            'type': 'Chat message send',
            'message': message
        }))
    
    async def chat_message(self, event):
        #Handle message from how it's send
        message = event['message'] + ' from ' + event['sender']
        
        print('je suis', self.username, 'et je recois', message)
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))

class PongConsumer(AsyncWebsocketConsumer):
    game_manager = PongGameManager()

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'pong_game_{self.game_id}'

        # Add the user to the game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        await self.accept()

        # Send a message to the user to indicate that they've joined the game
        await self.send(text_data=json.dumps({
            'message': 'You have joined the game.'
        }))

    async def disconnect(self, close_code):
        # Remove the user from the game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

        # If the last player disconnects, delete the game from memory
        if not self.channel_layer.group_channels(self.game_group_name):
            self.game_manager.delete_game(self.game_id)

    async def receive(self, text_data):
        # Handle incoming messages (e.g., paddle movements, ball position updates)
        data = json.loads(text_data)

        # Update the game state in memory
        self.game_manager.get_game(self.game_id).update(data)

        # Broadcast the updated game state to all users in the game group
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game.message',
                'message': json.dumps(data)
            }
        )

    async def game_message(self, event):
        # Send the updated game state to the WebSocket
        await self.send(text_data=event['message'])
