import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from simulation.consumers import MatchSimulationConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chairman_project.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter([
        path("ws/match/", MatchSimulationConsumer.as_asgi()),
    ]),
})
