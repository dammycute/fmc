from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

async def broadcast_match_event(event: dict):
    """
    Sends match event to the user's simulation group.
    """
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "match_simulation_1",
        {
            "type": "match.event",
            **event
        }
    )
