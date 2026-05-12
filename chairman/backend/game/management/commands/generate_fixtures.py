from django.core.management.base import BaseCommand
from game.models import Match
from simulation.fixture_generator import generate_fixtures

class Command(BaseCommand):
    help = 'Generates fixtures for a specific season'

    def add_arguments(self, parser):
        parser.add_argument('--season', type=int, default=2024)

    def handle(self, *args, **options):
        season = options['season']
        self.stdout.write(f"Deleting existing fixtures for season {season}...")
        Match.objects.filter(season=season).delete()

        self.stdout.write(f"Generating fixtures for season {season}...")
        count = generate_fixtures(season)
        self.stdout.write(self.style.SUCCESS(f"Generated {count} fixtures for season {season}"))
