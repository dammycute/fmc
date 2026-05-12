from django.core.management.base import BaseCommand
from game.models import GameState
from simulation.world_generator import generate_world

class Command(BaseCommand):
    help = 'Seeds the game world with initial data'

    def handle(self, *args, **options):
        if GameState.objects.filter(pk=1).exists():
            self.stdout.write(self.style.WARNING('World already seeded'))
            return

        self.stdout.write('Generating world...')
        generate_world()
        self.stdout.write(self.style.SUCCESS('World successfully seeded'))
