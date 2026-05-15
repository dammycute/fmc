from django.test import TestCase
from game.models import Club, Player, League, Match, Sponsor, ClubFacilities
from simulation.finance_engine import process_week as process_finance
from django.db import connection

class FinanceEngineDetailedTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(name="PL", tier=1, prize_money_champion=38000000)
        self.club = Club.objects.create(
            name="Test Club",
            league=self.league,
            reputation=50,
            balance=1000000,
            weekly_wages=0, # Should be recalculated
            weekly_staff_wages=10000,
            is_user_controlled=True
        )
        self.facilities = ClubFacilities.objects.create(club=self.club, stadium_capacity=10000)

        # Add a player to test wage recalculation
        Player.objects.create(
            club=self.club,
            first_name="Test",
            last_name="Player",
            wage=5000,
            overall_rating=70,
            position='MID'
        )

    def test_wage_recalculation(self):
        # Initial weekly_wages is 0
        self.assertEqual(self.club.weekly_wages, 0)

        process_finance(1, 2024)

        self.club.refresh_from_db()
        # Should be updated to 5000 (from the player)
        self.assertEqual(self.club.weekly_wages, 5000)

    def test_prize_money_installment(self):
        # Tier 1 prize money is 38,000,000. Weekly should be 1,000,000.
        initial_balance = self.club.balance

        # To isolate prize money, we'll check the balance increase
        process_finance(1, 2024)
        self.club.refresh_from_db()

        # We expect at least 1,000,000 increase from prize money
        # (plus TV rights 240k, merch, etc. minus expenses)
        self.assertGreaterEqual(self.club.balance - initial_balance, 1000000)

    def test_sponsor_expiry(self):
        sponsor = Sponsor.objects.create(
            club=self.club,
            name="Expiring Sponsor",
            amount=38000,
            status='ACTIVE',
            duration_seasons=1
        )

        # Week 1: should still be active
        process_finance(1, 2024)
        sponsor.refresh_from_db()
        self.assertEqual(sponsor.status, 'ACTIVE')
        self.assertEqual(sponsor.duration_seasons, 1)

        # Week 38: should expire
        process_finance(38, 2024)
        sponsor.refresh_from_db()
        self.assertEqual(sponsor.status, 'EXPIRED')
        self.assertEqual(sponsor.duration_seasons, 0)

    def test_attendance_form_bonus(self):
        # Create a home match for this week
        away_club_1 = Club.objects.create(name="Away 1", league=self.league)
        Match.objects.create(
            league=self.league,
            home_club=self.club,
            away_club=away_club_1,
            week=1,
            season=2024,
            played=True,
            home_score=0,
            away_score=0
        )

        # Base attendance pct: 0.6 + (50/200) = 0.85
        # No recent matches yet.

        # 1. Run without form bonus
        process_finance(1, 2024)
        balance_no_bonus = self.club.balance

        # Reset balance and match for a clean state
        self.club.balance = 1000000
        self.club.save()

        # 2. Add some recent home wins
        for i in range(2, 5):
            Match.objects.create(
                league=self.league,
                home_club=self.club,
                away_club=Club.objects.create(name="Opponent "+str(i), league=self.league),
                week=i-1,
                season=2023, # Last season
                played=True,
                home_score=2,
                away_score=0
            )

        # 3 recent wins = +0.06 bonus
        # New attendance pct: 0.85 + 0.06 = 0.91

        # We need a match THIS week to trigger matchday income
        Match.objects.create(
            league=self.league,
            home_club=self.club,
            away_club=Club.objects.create(name="Current Opponent", league=self.league),
            week=2,
            season=2024,
            played=True,
            home_score=0,
            away_score=0
        )

        process_finance(2, 2024)
        self.club.refresh_from_db()

        # Balance with bonus should be higher than balance without bonus
        self.assertGreater(self.club.balance, balance_no_bonus)
