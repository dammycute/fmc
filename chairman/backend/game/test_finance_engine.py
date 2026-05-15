from django.test import TestCase
from game.models import Club, League, Sponsor, Match, ClubFacilities, Player, GameState
from simulation.finance_engine import process_week

class FinanceEngineDetailedTest(TestCase):
    def setUp(self):
        self.league_t1 = League.objects.create(name="Tier 1", tier=1, prize_money_champion=38000000)
        self.league_t4 = League.objects.create(name="Tier 4", tier=4, prize_money_champion=0)

        self.user_club = Club.objects.create(
            name="User Club",
            league=self.league_t1,
            is_user_controlled=True,
            balance=1000000,
            reputation=80
        )
        ClubFacilities.objects.create(club=self.user_club, stadium_capacity=10000)

        self.ai_club = Club.objects.create(
            name="AI Club",
            league=self.league_t1,
            is_user_controlled=False,
            balance=1000000,
            reputation=80
        )
        ClubFacilities.objects.create(club=self.ai_club, stadium_capacity=10000)

    def test_wage_recalculation_for_user_club(self):
        # Set manual weekly_wages that is incorrect
        self.user_club.weekly_wages = 5000
        self.user_club.save()

        # Add players with total wages 10000
        Player.objects.create(club=self.user_club, wage=6000, position='MID')
        Player.objects.create(club=self.user_club, wage=4000, position='DEF')

        # Process week
        process_week(1, 2024)

        self.user_club.refresh_from_db()
        self.assertEqual(self.user_club.weekly_wages, 10000)

    def test_wage_not_recalculated_for_ai_club(self):
        # Set manual weekly_wages
        self.ai_club.weekly_wages = 5000
        self.ai_club.save()

        # Add players with total wages 10000
        Player.objects.create(club=self.ai_club, wage=6000, position='MID')
        Player.objects.create(club=self.ai_club, wage=4000, position='DEF')

        # Process week
        process_week(1, 2024)

        self.ai_club.refresh_from_db()
        # Should NOT be recalculated to 10000 if engine follows the "only user club" rule strictly
        # Note: the engine does `sum(wages)` and saves it.
        # For AI clubs it doesn't do the recalculation block.
        self.assertEqual(self.ai_club.weekly_wages, 5000)

    def test_prize_money_awarded_weekly(self):
        # Tier 1 prize money champion is 38,000,000
        # Weekly should be 1,000,000

        initial_balance = self.user_club.balance
        process_week(1, 2024)
        self.user_club.refresh_from_db()

        # Balance change = Income - Expenses
        # Income = TV(240k) + Matchday(0) + Sponsor(0) + Merch(80*300 + 5*200 = 25k) + Prize(1M) = 1,265,000
        # Expenses = Wages(0) + Staff(0) + Manager(0) + Maintenance(50k) = 50,000
        # Net = 1,215,000

        self.assertEqual(self.user_club.balance, initial_balance + 1215000)

    def test_prize_money_skipped_for_tier_4(self):
        self.user_club.league = self.league_t4
        self.user_club.save()

        initial_balance = self.user_club.balance
        process_week(1, 2024)
        self.user_club.refresh_from_db()

        # Income = TV(40k) + Matchday(0) + Sponsor(0) + Merch(80*300 + 2*200 = 24.4k) + Prize(0) = 64,400
        # Expenses = Wages(0) + Staff(0) + Manager(0) + Maintenance(5k) = 5,000
        # Net = 59,400
        self.assertEqual(self.user_club.balance, initial_balance + 59400)

    def test_sponsor_expiry_at_week_38(self):
        sponsor = Sponsor.objects.create(club=self.user_club, name="Expiring", amount=38000, duration_seasons=1, status='ACTIVE')

        # Week 1 - should not expire
        process_week(1, 2024)
        sponsor.refresh_from_db()
        self.assertEqual(sponsor.duration_seasons, 1)
        self.assertEqual(sponsor.status, 'ACTIVE')

        # Week 38 - should expire
        process_week(38, 2024)
        sponsor.refresh_from_db()
        self.assertEqual(sponsor.duration_seasons, 0)
        self.assertEqual(sponsor.status, 'EXPIRED')

    def test_matchday_form_bonus(self):
        # Create a home match for this week
        Match.objects.create(
            home_club=self.user_club, away_club=self.ai_club,
            league=self.league_t1, week=1, season=2024, played=True,
            home_score=1, away_score=0
        )

        # Base attendance pct: 0.6 + (80/200) = 1.0
        # We need lower reputation to see the bonus effect, or check if it adds correctly.
        self.user_club.reputation = 20 # Base: 0.6 + 0.1 = 0.7
        self.user_club.save()

        # Case 1: No recent matches
        # Income = TV(240k) + Match(10000 * 0.7 * 60 = 420k) + Sponsor(0) + Merch(20*300 + 5*200 = 7k) + Prize(1M) = 1,667,000
        # Expenses = 50k
        # Net = 1,617,000
        initial_balance = self.user_club.balance
        process_week(1, 2024)
        self.user_club.refresh_from_db()
        self.assertEqual(self.user_club.balance, initial_balance + 1617000)

        # Case 2: One recent home win
        # We need to process another week to use the previous win.
        # Create a past win
        Match.objects.create(
            home_club=self.user_club, away_club=self.ai_club,
            league=self.league_t1, week=1, season=2023, played=True,
            home_score=2, away_score=0
        )
        # Form bonus = 0.02
        # Attendance pct = 0.7 + 0.02 = 0.72
        # Matchday income = 10000 * 0.72 * 60 = 432,000 (diff of 12,000)

        initial_balance = self.user_club.balance
        # Note: Matchday income only happens if there is a home match THIS week too.
        Match.objects.create(
            home_club=self.user_club, away_club=self.ai_club,
            league=self.league_t1, week=2, season=2024, played=True,
            home_score=1, away_score=1
        )
        process_week(2, 2024)
        self.user_club.refresh_from_db()

        # Income = TV(240k) + Match(444k) + Sponsor(0) + Merch(7k) + Prize(1M) = 1,691,000
        # Net = 1,641,000
        self.assertEqual(self.user_club.balance, initial_balance + 1641000)
