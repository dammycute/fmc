from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PlayerMatchSnapshot:
    id: str
    first_name: str
    last_name: str
    position: str
    overall_rating: float

    # Technical
    tech_passing: int = 50
    tech_shooting: int = 50
    tech_dribbling: int = 50
    tech_tackling: int = 50
    tech_positioning: int = 50
    tech_vision: int = 50
    tech_finishing: int = 50
    tech_handling: int = 50
    tech_reflexes: int = 50
    tech_command_of_area: int = 50
    tech_rushing_out: int = 50
    tech_crossing: int = 50
    tech_heading: int = 50
    tech_first_touch: int = 50
    tech_technique: int = 50
    tech_long_shots: int = 50

    # Physical
    phys_pace: int = 50
    phys_strength: int = 50
    phys_stamina: int = 50
    phys_agility: int = 50
    phys_acceleration: int = 50
    phys_jumping_reach: int = 50
    phys_balance: int = 50
    phys_natural_fitness: int = 50

    # Mental
    ment_leadership: int = 50
    ment_composure: int = 50
    ment_aggression: int = 50
    ment_work_rate: int = 50
    ment_decisions: int = 50
    ment_determination: int = 50
    ment_concentration: int = 50
    ment_off_the_ball: int = 50
    ment_teamwork: int = 50
    ment_bravery: int = 50
    ment_anticipation: int = 50

    # Hidden
    hidden_consistency: int = 50
    hidden_big_match: int = 50
    hidden_temperament: int = 50
    hidden_injury_proneness: int = 50

    # State
    morale: float = 70.0
    fatigue: float = 0.0
    sharpness: float = 90.0

    # Derived
    form_modifier: float = 0.0
    big_game_modifier: float = 1.0


@dataclass
class TeamState:
    players: list  # list of PlayerMatchSnapshot
    goals: int = 0
    xg: float = 0.0
    shots: int = 0
    shots_on_target: int = 0
    possession: float = 50.0
    yellows: dict = field(default_factory=dict)
    red_card_ids: set = field(default_factory=set)
    subs_made: int = 0
    max_subs: int = 5
    momentum: float = 0.0
    fatigue_mod: float = 1.0
    formation: str = '4-4-2'
    tactics: str = 'BALANCED'

    def get_active(self):
        return [p for p in self.players if p.id not in self.red_card_ids]


@dataclass
class MatchContext:
    season: int
    week: int
    is_cup: bool = False
    weather: str = 'dry'  # dry, rain, snow, wind
    pitch_quality: float = 1.0  # 0.0-1.0
    crowd_factor: float = 1.0
    referee_strictness: float = 1.0  # 0.5-1.5
    home_form_bonus: float = 0.0
    away_form_bonus: float = 0.0
    is_derby: bool = False
    fixture_congestion: float = 0.0  # extra fatigue if midweek game
