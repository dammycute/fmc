from django.test import TestCase
from game.models import Club, Player, League, GameState, Match, Sponsor, ClubFacilities
from simulation.match_engine import simulate_match, PlayerSnapshot
from simulation.finance_engine import process_week as process_finance
import random

class MatchEngineTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(name="Test League", tier=1)
        self.home_club = Club.objects.create(name="Home", league=self.league, reputation=80)
        self.away_club = Club.objects.create(name="Away", league=self.league, reputation=70)

        def create_snap(id, pos):
            return PlayerSnapshot(
                id=str(id), first_name="P", last_name=str(id), position=pos,
                overall_rating=75, tech_shooting=70, tech_finishing=70, tech_passing=70,
                tech_vision=70, tech_tackling=70, tech_positioning=70, tech_reflexes=70,
                tech_handling=70, phys_pace=70, phys_strength=70, phys_stamina=70,
                phys_agility=70, phys_acceleration=70, ment_leadership=70, ment_composure=70,
                ment_work_rate=70, ment_decisions=70, ment_determination=70, ment_aggression=70,
                hidden_consistency=70, hidden_big_match=70, hidden_temperament=70,
                hidden_injury_proneness=10, morale=80, fatigue=0
            )

        self.h_players = [create_snap(i, 'GK' if i==0 else 'DEF' if i<5 else 'MID' if i<9 else 'ATT') for i in range(11)]
        self.a_players = [create_snap(i+11, 'GK' if i==0 else 'DEF' if i<5 else 'MID' if i<9 else 'ATT') for i in range(11)]

    def test_simulate_match_structure(self):
        res = simulate_match(self.home_club, self.away_club, self.h_players, self.a_players, None, None, 1, 1)
        self.assertIn('home_score', res)
        self.assertIn('away_score', res)
        self.assertIn('events', res)
        self.assertGreater(len(res['events']), 0)
        # Verify commentary for every block
        commentary_events = [e for e in res['events'] if e['type'] == 'COMMENTARY']
        self.assertGreaterEqual(len(commentary_events), 18)

class FinanceEngineTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(name="PL", tier=1)
        self.club = Club.objects.create(
            name="Rich", league=self.league, reputation=90, balance=1000,
            weekly_wages=100, weekly_staff_wages=50, is_user_controlled=True
        )
        ClubFacilities.objects.create(club=self.club, stadium_capacity=10000)
        Sponsor.objects.create(club=self.club, name="S", amount=38000, status='ACTIVE')

    def test_process_week_income(self):
        # TV(240k) + Sponsor(1k) + Merch(90*300 + 5*200 = 28k) = 269k
        # Expense: 100 + 50 + 50k = 50,150
        # Net: ~218,850
        process_finance(1, 2024)
        self.club.refresh_from_db()
        self.assertGreater(self.club.balance, 100000)
