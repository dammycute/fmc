from django.core.management.base import BaseCommand
from game.models import (
    League, Club, ClubFacilities, Player, Manager, Staff,
    Sponsor, GameState, Match, TransferBid, TransferRequest, NewsStory,
    ScoutAssignment
)
from simulation.world_generator import generate_world
from simulation.fixture_generator import generate_fixtures

class Command(BaseCommand):
    help = 'Resets the game world'

    def handle(self, *args, **options):
        confirm = input("This will delete ALL game data. Type YES to confirm: ")
        if confirm != "YES":
            self.stdout.write("Reset cancelled.")
            return

        self.stdout.write("Deleting data...")
        # Order matters for FKs
        TransferRequest.objects.all().delete()
        TransferBid.objects.all().delete()
        Match.objects.all().delete()
        NewsStory.objects.all().delete()
        ScoutAssignment.objects.all().delete()
        Sponsor.objects.all().delete()
        Staff.objects.all().delete()
        Player.objects.all().delete()
        Manager.objects.all().delete()
        ClubFacilities.objects.all().delete()
        GameState.objects.all().delete()
        Club.objects.all().delete()
        League.objects.all().delete()

        self.stdout.write("Generating new world...")
        generate_world()
        self.stdout.write("Generating fixtures for season 2024...")
        count = generate_fixtures(2024)
        self.stdout.write(self.style.SUCCESS(f"Generated {count} fixtures for season 2024"))
        self.stdout.write(self.style.SUCCESS("World successfully reset"))
