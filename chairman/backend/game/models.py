from django.db import models
from django.db.models import (
    Model, CharField, IntegerField, BigIntegerField, FloatField,
    BooleanField, ForeignKey, OneToOneField, JSONField, TextField,
    DateTimeField, PROTECT, CASCADE, SET_NULL, TextChoices
)
import json

# ── ENUMS (use TextChoices) ──────────────────────────

class Position(TextChoices):
    GK = 'GK', 'GK'
    DEF = 'DEF', 'DEF'
    MID = 'MID', 'MID'
    ATT = 'ATT', 'ATT'

class Formation(TextChoices):
    F442 = '4-4-2', '4-4-2'
    F433 = '4-3-3', '4-3-3'
    F352 = '3-5-2', '3-5-2'
    F4231 = '4-2-3-1', '4-2-3-1'
    F541 = '5-4-1', '5-4-1'
    F442D = '4-4-2_DIAMOND', '4-4-2_DIAMOND'

class TacticalPhilosophy(TextChoices):
    POSSESSION = 'POSSESSION', 'POSSESSION'
    HIGH_PRESSING = 'HIGH_PRESSING', 'HIGH_PRESSING'
    COUNTER = 'COUNTER_ATTACK', 'COUNTER_ATTACK'
    DEFENSIVE = 'DEFENSIVE', 'DEFENSIVE'
    WING_PLAY = 'WING_PLAY', 'WING_PLAY'
    DIRECT = 'DIRECT', 'DIRECT'

class SeasonTarget(TextChoices):
    CHAMPIONS = 'CHAMPIONS', 'CHAMPIONS'
    PROMOTION = 'PROMOTION', 'PROMOTION'
    PLAYOFFS = 'PLAYOFFS', 'PLAYOFFS'
    TOP_HALF = 'TOP_HALF', 'TOP_HALF'
    MID_TABLE = 'MID_TABLE', 'MID_TABLE'
    AVOID_RELEGATION = 'AVOID_RELEGATION', 'AVOID_RELEGATION'

class TrainingFocus(TextChoices):
    ATTACKING = 'ATTACKING', 'ATTACKING'
    DEFENSIVE = 'DEFENSIVE', 'DEFENSIVE'
    PHYSICAL = 'PHYSICAL', 'PHYSICAL'
    MENTAL = 'MENTAL', 'MENTAL'
    BALANCED = 'BALANCED', 'BALANCED'

class StaffRole(TextChoices):
    SPORTING_DIRECTOR = 'SPORTING_DIRECTOR', 'SPORTING_DIRECTOR'
    SCOUT = 'SCOUT', 'SCOUT'
    PHYSIO = 'PHYSIO', 'PHYSIO'
    ANALYST = 'ANALYST', 'ANALYST'
    ACADEMY_COACH = 'ACADEMY_COACH', 'ACADEMY_COACH'

class OwnershipType(TextChoices):
    LOCAL = 'LOCAL', 'LOCAL'
    BILLIONAIRE = 'BILLIONAIRE', 'BILLIONAIRE'
    CORPORATE = 'CORPORATE', 'CORPORATE'
    FAN_OWNED = 'FAN_OWNED', 'FAN_OWNED'

class NewsCategory(TextChoices):
    MATCH = 'MATCH', 'MATCH'
    TRANSFER = 'TRANSFER', 'TRANSFER'
    CLUB = 'CLUB', 'CLUB'
    WORLD = 'WORLD', 'WORLD'
    FINANCE = 'FINANCE', 'FINANCE'
    INJURY = 'INJURY', 'INJURY'

class NewsImportance(TextChoices):
    LOW = 'LOW', 'LOW'
    MEDIUM = 'MEDIUM', 'MEDIUM'
    HIGH = 'HIGH', 'HIGH'
    BREAKING = 'BREAKING', 'BREAKING'

class TransferStatus(TextChoices):
    PENDING = 'PENDING', 'PENDING'
    ACCEPTED = 'ACCEPTED', 'ACCEPTED'
    REJECTED = 'REJECTED', 'REJECTED'
    CANCELLED = 'CANCELLED', 'CANCELLED'

# ── CORE WORLD ───────────────────────────────────────

class League(Model):
    name = CharField(max_length=100)
    tier = IntegerField()              # 1=top, 5=non-league
    country = CharField(max_length=50)
    reputation = IntegerField(default=50)
    prize_money_champion = BigIntegerField(default=0)
    prize_money_relegated = BigIntegerField(default=0)
    promotion_spots = IntegerField(default=3)
    relegation_spots = IntegerField(default=3)

    def __str__(self):
        return self.name

class Club(Model):
    name = CharField(max_length=100)
    league = ForeignKey(League, on_delete=PROTECT, related_name='clubs')

    # Identity
    primary_color = CharField(max_length=7, default='#3b82f6')
    secondary_color = CharField(max_length=7, default='#ffffff')
    stadium_name = CharField(max_length=100, default='')

    # Reputation & Status
    reputation = FloatField(default=50.0)   # 0-100
    valuation = BigIntegerField(default=1000000)
    is_user_controlled = BooleanField(default=False)
    is_for_sale = BooleanField(default=True)

    # Finances
    balance = BigIntegerField(default=500000)
    transfer_budget = BigIntegerField(default=0)
    weekly_wages = BigIntegerField(default=0)
    weekly_staff_wages = BigIntegerField(default=0)

    # Board
    board_type = CharField(max_length=20, choices=OwnershipType.choices, default='LOCAL')
    board_expectations = CharField(max_length=30, choices=SeasonTarget.choices, default='MID_TABLE')
    board_patience = IntegerField(default=60)    # 0-100
    board_confidence = IntegerField(default=70)  # 0-100

    # Fan sentiment
    fan_confidence = IntegerField(default=70)    # 0-100

    # Tactics
    formation = CharField(max_length=20, choices=Formation.choices, default='4-4-2')
    tactics = CharField(max_length=20, choices=TacticalPhilosophy.choices, default='DIRECT')
    season_target = CharField(max_length=30, choices=SeasonTarget.choices, default='MID_TABLE')
    training_focus = CharField(max_length=20, choices=TrainingFocus.choices, default='BALANCED')

    # Lineup: stored as JSON {position_slot: player_id}
    starting_lineup = JSONField(default=dict)

    # Culture stored as JSON list of strings
    culture = JSONField(default=list)
    rivals = JSONField(default=list)   # list of club_ids
    history = JSONField(default=list)  # list of strings

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class ClubFacilities(Model):
    club = OneToOneField(Club, on_delete=CASCADE, related_name='facilities')

    # Each facility: level 1-10, upgrade_cost in £
    stadium_level = IntegerField(default=3)
    stadium_capacity = IntegerField(default=5000)
    stadium_upgrade_cost = BigIntegerField(default=500000)

    training_level = IntegerField(default=3)
    training_upgrade_cost = BigIntegerField(default=300000)

    medical_level = IntegerField(default=3)
    medical_upgrade_cost = BigIntegerField(default=200000)

    youth_level = IntegerField(default=3)
    youth_upgrade_cost = BigIntegerField(default=250000)

class Sponsor(Model):
    club = ForeignKey(Club, on_delete=CASCADE, related_name='sponsors')
    name = CharField(max_length=100)
    sponsor_type = CharField(max_length=20)  # MAIN, SLEEVE, STADIUM
    amount = BigIntegerField()
    duration_seasons = IntegerField(default=1)
    reputation_required = IntegerField(default=0)
    status = CharField(max_length=20, default='PENDING')  # PENDING, ACTIVE, EXPIRED

class ScoutAssignment(Model):
    club = ForeignKey(Club, on_delete=CASCADE, related_name='scout_assignments')
    scout = ForeignKey('Staff', on_delete=CASCADE)
    region = CharField(max_length=50)
    progress = FloatField(default=0.0)   # 0-100

class ScoutReport(Model):
    assignment = ForeignKey(ScoutAssignment, on_delete=CASCADE, related_name='reports')
    player = ForeignKey('Player', on_delete=CASCADE)
    reported_rating = FloatField()
    created_week = IntegerField()
    created_season = IntegerField()

# ── PLAYER ───────────────────────────────────────────

class Player(Model):
    club = ForeignKey(Club, on_delete=SET_NULL, null=True, blank=True, related_name='players')

    # Identity
    first_name = CharField(max_length=50)
    last_name = CharField(max_length=50)
    age = IntegerField(default=22)
    nationality = CharField(max_length=50, default='English')
    position = CharField(max_length=5, choices=Position.choices)
    archetype = CharField(max_length=50, default='')

    # Ability
    overall_rating = FloatField(default=50.0)
    potential_rating = IntegerField(default=60)

    # Technical attributes (all 1-99)
    tech_passing = IntegerField(default=50)
    tech_shooting = IntegerField(default=50)
    tech_dribbling = IntegerField(default=50)
    tech_tackling = IntegerField(default=50)
    tech_positioning = IntegerField(default=50)
    tech_vision = IntegerField(default=50)
    tech_finishing = IntegerField(default=50)
    # GK specific
    tech_handling = IntegerField(default=50)
    tech_reflexes = IntegerField(default=50)
    tech_command_of_area = IntegerField(default=50)
    tech_rushing_out = IntegerField(default=50)

    # Physical attributes
    phys_pace = IntegerField(default=50)
    phys_strength = IntegerField(default=50)
    phys_stamina = IntegerField(default=50)
    phys_agility = IntegerField(default=50)
    phys_acceleration = IntegerField(default=50)

    # Mental attributes
    ment_leadership = IntegerField(default=50)
    ment_composure = IntegerField(default=50)
    ment_aggression = IntegerField(default=50)
    ment_work_rate = IntegerField(default=50)
    ment_decisions = IntegerField(default=50)
    ment_determination = IntegerField(default=50)

    # Hidden attributes (drive behavior, not shown to player unless scouted)
    hidden_professionalism = IntegerField(default=50)   # drives development rate
    hidden_ambition = IntegerField(default=50)          # drives transfer requests
    hidden_loyalty = IntegerField(default=50)           # resists leaving
    hidden_injury_proneness = IntegerField(default=50)  # affects injury chance
    hidden_temperament = IntegerField(default=50)       # card likelihood
    hidden_big_match = IntegerField(default=50)         # rating boost in big games
    hidden_consistency = IntegerField(default=50)       # variance in match rating

    # Market
    value = BigIntegerField(default=50000)
    wage = IntegerField(default=500)    # weekly
    contract_years = IntegerField(default=2)

    # State
    morale = FloatField(default=70.0)           # 0-100
    fitness = FloatField(default=100.0)         # 0-100
    fatigue = FloatField(default=0.0)           # 0-100
    is_injured = BooleanField(default=False)
    injury_weeks_remaining = IntegerField(default=0)

    # Tactical
    tactical_familiarity = FloatField(default=50.0)  # 0-100

    # Form: last 5 match ratings stored as JSON list
    form = JSONField(default=list)   # e.g. [7.2, 6.8, 8.1, 7.0, 6.5]

    # Happiness dimensions (all 0-100)
    happiness_contract = IntegerField(default=80)
    happiness_playing_time = IntegerField(default=80)
    happiness_manager = IntegerField(default=80)
    happiness_club_ambition = IntegerField(default=80)

    # Transfer flags
    is_transfer_listed = BooleanField(default=False)
    is_loan_listed = BooleanField(default=False)

    # Personality label for UI
    personality = CharField(max_length=30, default='PROFESSIONAL')

    # Career history
    appearances = IntegerField(default=0)
    goals = IntegerField(default=0)
    assists = IntegerField(default=0)

    is_legend = BooleanField(default=False)

    class Meta:
        ordering = ['-overall_rating']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# ── STAFF ────────────────────────────────────────────

class Manager(Model):
    club = OneToOneField(Club, on_delete=SET_NULL, null=True, blank=True, related_name='manager')
    name = CharField(max_length=100)

    # Coaching attributes (all 0-100)
    coaching_attacking = IntegerField(default=50)
    coaching_defensive = IntegerField(default=50)
    coaching_tactical = IntegerField(default=50)
    coaching_mental = IntegerField(default=50)
    coaching_youth = IntegerField(default=50)

    # Overall
    coaching_ability = IntegerField(default=50)

    # Preferences
    preferred_formation = CharField(max_length=20, choices=Formation.choices, default='4-4-2')
    preferred_style = CharField(max_length=20, choices=TacticalPhilosophy.choices, default='DIRECT')
    pressing = IntegerField(default=50)
    creative_freedom = IntegerField(default=50)

    # Personality (all 0-100)
    personality_discipline = IntegerField(default=50)
    personality_loyalty = IntegerField(default=50)
    personality_ambition = IntegerField(default=50)
    personality_media = IntegerField(default=50)
    personality_player_mgmt = IntegerField(default=50)

    # State
    salary = IntegerField(default=5000)
    contract_weeks_remaining = IntegerField(default=104)
    morale = FloatField(default=70.0)
    relationship_with_chairman = FloatField(default=70.0)
    wants_to_leave = BooleanField(default=False)

    # Archetype drives mechanical multipliers (stored as JSON)
    archetype = CharField(max_length=30, default='MOTIVATOR')
    archetype_config = JSONField(default=dict)

    def __str__(self):
        return self.name

class Staff(Model):
    club = ForeignKey(Club, on_delete=SET_NULL, null=True, blank=True, related_name='staff')
    name = CharField(max_length=100)
    role = CharField(max_length=30, choices=StaffRole.choices)
    rating = IntegerField(default=50)   # 0-100
    salary = IntegerField(default=1000)
    is_applicant = BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.role})"

# ── MATCHES ──────────────────────────────────────────

class Match(Model):
    league = ForeignKey(League, on_delete=PROTECT)
    home_club = ForeignKey(Club, on_delete=PROTECT, related_name='home_matches')
    away_club = ForeignKey(Club, on_delete=PROTECT, related_name='away_matches')
    season = IntegerField(default=2024)
    week = IntegerField(default=1)
    played = BooleanField(default=False)

    # Results
    home_score = IntegerField(default=0)
    away_score = IntegerField(default=0)

    # Full event log: list of {minute, type, description, club_id, player_id}
    events = JSONField(default=list)

    # Stats
    home_possession = FloatField(default=50.0)
    away_possession = FloatField(default=50.0)
    home_shots = IntegerField(default=0)
    away_shots = IntegerField(default=0)
    home_shots_on_target = IntegerField(default=0)
    away_shots_on_target = IntegerField(default=0)
    home_xg = FloatField(default=0.0)
    away_xg = FloatField(default=0.0)

    # Per-player match ratings stored as JSON {player_id: rating}
    player_ratings = JSONField(default=dict)

    class Meta:
        ordering = ['season', 'week']

    def __str__(self):
        return f"{self.home_club} vs {self.away_club} (S{self.season} W{self.week})"

# ── TRANSFERS ────────────────────────────────────────

class TransferBid(Model):
    player = ForeignKey(Player, on_delete=CASCADE, related_name='bids')
    from_club = ForeignKey(Club, on_delete=CASCADE, related_name='outgoing_bids')
    to_club = ForeignKey(Club, on_delete=CASCADE, related_name='incoming_bids')
    amount = BigIntegerField()
    status = CharField(max_length=20, choices=TransferStatus.choices, default='PENDING')
    negotiation_count = IntegerField(default=0)
    created_week = IntegerField(default=1)
    created_season = IntegerField(default=2024)
    is_player_interested = BooleanField(default=True)

class TransferRequest(Model):
    manager = ForeignKey(Manager, on_delete=CASCADE)
    club = ForeignKey(Club, on_delete=CASCADE, related_name='transfer_requests')
    request_type = CharField(max_length=30)   # SQUAD_WEAKNESS, TACTICAL, DEPTH
    priority = CharField(max_length=20)        # LOW, MEDIUM, HIGH, EMERGENCY
    message = TextField()
    status = CharField(max_length=20, default='PENDING')
    suggested_position = CharField(max_length=5, blank=True)
    week_requested = IntegerField()
    season_requested = IntegerField()

# ── NEWS ─────────────────────────────────────────────

class NewsStory(Model):
    title = CharField(max_length=200)
    content = TextField()
    category = CharField(max_length=20, choices=NewsCategory.choices)
    importance = CharField(max_length=20, choices=NewsImportance.choices, default='LOW')
    club = ForeignKey(Club, on_delete=SET_NULL, null=True, blank=True)
    week = IntegerField()
    season = IntegerField()
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "News stories"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

# ── GAME STATE (singleton) ───────────────────────────

class GameState(Model):
    # There is always exactly one row. Use GameState.objects.get(pk=1)
    current_season = IntegerField(default=2024)
    current_week = IntegerField(default=1)
    is_transfer_window_open = BooleanField(default=True)
    user_club = ForeignKey(Club, on_delete=SET_NULL, null=True, blank=True)
    personal_balance = BigIntegerField(default=1000000)

    # Shortlist: list of player_ids
    shortlist = JSONField(default=list)

    class Meta:
        verbose_name_plural = "Game state"
