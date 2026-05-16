"""
match_engine.py — Public API for match simulation.
Backward-compatible wrapper around the new modular engine.
"""

from .models import PlayerMatchSnapshot as PlayerSnapshot
from .tactics import FORMATION_CONFIG, get_starting_11


# Backward-compatible legacy constants
FORMATION_BONUSES = {}
get_tactical_modifiers = lambda t: {'atk_mod': 1.0, 'def_mod': 1.0, 'mid_mod': 1.0}


from .xg_model import calculate_xg, resolve_shot, SHOT_ZONES
from .engine import simulate_match
from .events import (
    build_event, goal_event, save_event, woodwork_event, big_chance_event,
    substitution_event, yellow_event, red_event, injury_event,
    penalty_awarded, momentum_event, commentary_event,
    halftime_event, fulltime_event, pick_commentary,
    EVENT_GOAL, EVENT_BIG_CHANCE, EVENT_SAVE, EVENT_WOODWORK,
    EVENT_OFF_TARGET, EVENT_BLOCK, EVENT_SUBSTITUTION,
    EVENT_PENALTY_AWARDED, EVENT_PENALTY_MISSED, EVENT_FOUL,
    EVENT_YELLOW, EVENT_RED, EVENT_INJURY, EVENT_OFFSIDE,
    EVENT_CORNER, EVENT_FREE_KICK, EVENT_HALFTIME, EVENT_FULLTIME,
    EVENT_COMMENTARY, EVENT_MOMENTUM_SHIFT, EVENT_TACTICAL_CHANGE,
)

__all__ = [
    'simulate_match', 'PlayerSnapshot', 'get_starting_11',
    'FORMATION_CONFIG', 'FORMATION_BONUSES', 'get_tactical_modifiers',
    'calculate_xg', 'resolve_shot', 'SHOT_ZONES',
    'build_event', 'goal_event', 'save_event', 'woodwork_event',
    'big_chance_event', 'substitution_event', 'yellow_event', 'red_event',
    'injury_event', 'penalty_awarded', 'momentum_event', 'commentary_event',
    'halftime_event', 'fulltime_event', 'pick_commentary',
]
