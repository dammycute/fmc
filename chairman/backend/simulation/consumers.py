import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MatchSimulationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Allow multi-user support by using club_id if provided in URL, otherwise fallback to 1
        # In this desktop simulation, we mostly expect 1
        self.user_id = self.scope.get('session', {}).get('user_id', 1)
        self.group_name = f"match_simulation_{self.user_id}"

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Ignore incoming messages (read-only stream)
        pass

    async def match_event(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
