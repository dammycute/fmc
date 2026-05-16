from dataclasses import dataclass, field
from typing import Optional


FORMATION_CONFIG = {
    '4-4-2': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('LM', 'MID'), ('CM1', 'MID'), ('CM2', 'MID'), ('RM', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '4-3-3': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CM1', 'MID'), ('CM2', 'MID'), ('CM3', 'MID'),
        ('LW', 'ATT'), ('RW', 'ATT'), ('ST', 'ATT')
    ],
    '3-5-2': [
        ('GK', 'GK'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'),
        ('LWB', 'DEF'), ('RWB', 'DEF'), ('CM1', 'MID'), ('CM2', 'MID'), ('CM3', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '4-2-3-1': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CDM1', 'MID'), ('CDM2', 'MID'), ('LAM', 'MID'), ('CAM', 'MID'), ('RAM', 'MID'),
        ('ST', 'ATT')
    ],
    '5-4-1': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'), ('RB', 'DEF'),
        ('LM', 'MID'), ('CM1', 'MID'), ('CM2', 'MID'), ('RM', 'MID'),
        ('ST', 'ATT')
    ],
    '4-4-2_DIAMOND': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CDM', 'MID'), ('LM', 'MID'), ('RM', 'MID'), ('CAM', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '3-4-3': [
        ('GK', 'GK'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'),
        ('LM', 'MID'), ('CM1', 'MID'), ('CM2', 'MID'), ('RM', 'MID'),
        ('LW', 'ATT'), ('ST', 'ATT'), ('RW', 'ATT')
    ],
    '5-3-2': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'), ('RB', 'DEF'),
        ('CM1', 'MID'), ('CM2', 'MID'), ('CM3', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '5-2-3': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'), ('RB', 'DEF'),
        ('CM1', 'MID'), ('CM2', 'MID'),
        ('LW', 'ATT'), ('ST', 'ATT'), ('RW', 'ATT')
    ],
}


@dataclass
class TacticProfile:
    atk_mod: float = 1.0
    def_mod: float = 1.0
    mid_mod: float = 1.0
    pressing_intensity: float = 50.0
    defensive_line: float = 50.0
    width: float = 50.0
    tempo: float = 50.0
    marking: str = 'zonal'
    creativity: float = 50.0
    directness: float = 50.0


PHILOSOPHY_MODIFIERS = {
    'POSSESSION':         {'atk_mod': 0.95, 'def_mod': 1.0,  'mid_mod': 1.15, 'pressing': 55, 'line': 55, 'width': 70, 'tempo': 35, 'marking': 'zonal', 'directness': 30},
    'HIGH_PRESSING':      {'atk_mod': 1.15, 'def_mod': 0.90, 'mid_mod': 1.10, 'pressing': 85, 'line': 80, 'width': 60, 'tempo': 75, 'marking': 'man',   'directness': 50},
    'COUNTER_ATTACK':     {'atk_mod': 1.20, 'def_mod': 1.10, 'mid_mod': 0.85, 'pressing': 40, 'line': 30, 'width': 45, 'tempo': 80, 'marking': 'zonal', 'directness': 80},
    'DEFENSIVE':          {'atk_mod': 0.70, 'def_mod': 1.35, 'mid_mod': 0.95, 'pressing': 35, 'line': 20, 'width': 35, 'tempo': 30, 'marking': 'zonal', 'directness': 35},
    'WING_PLAY':          {'atk_mod': 1.10, 'def_mod': 0.95, 'mid_mod': 1.0,  'pressing': 50, 'line': 50, 'width': 80, 'tempo': 55, 'marking': 'zonal', 'directness': 60},
    'DIRECT':             {'atk_mod': 1.15, 'def_mod': 1.0,  'mid_mod': 0.90, 'pressing': 50, 'line': 45, 'width': 50, 'tempo': 70, 'marking': 'zonal', 'directness': 85},
    'TIKI_TAKA':          {'atk_mod': 1.05, 'def_mod': 1.0,  'mid_mod': 1.20, 'pressing': 75, 'line': 65, 'width': 75, 'tempo': 30, 'marking': 'zonal', 'directness': 20},
    'PARK_THE_BUS':       {'atk_mod': 0.60, 'def_mod': 1.40, 'mid_mod': 0.85, 'pressing': 25, 'line': 10, 'width': 30, 'tempo': 25, 'marking': 'zonal', 'directness': 25},
    'BALANCED':           {'atk_mod': 1.0,  'def_mod': 1.0,  'mid_mod': 1.0,  'pressing': 50, 'line': 50, 'width': 50, 'tempo': 50, 'marking': 'zonal', 'directness': 50},
}


def get_starting_11(formation, starting_lineup, all_players):
    slots = FORMATION_CONFIG.get(formation, FORMATION_CONFIG['4-4-2'])
    lineup = starting_lineup or {}
    selected = []
    used_ids = set()

    for slot_name, role in slots:
        p_id = lineup.get(slot_name)
        found = None
        if p_id:
            found = next((p for p in all_players if str(p.id) == str(p_id)), None)
        if found and found.id not in used_ids:
            selected.append(found)
            used_ids.add(found.id)
        else:
            selected.append(None)

    for i, (slot_name, role) in enumerate(slots):
        if selected[i] is None:
            available = [p for p in all_players if p.position == role and p.id not in used_ids]
            if not available:
                available = [p for p in all_players if p.id not in used_ids]
            if available:
                best = max(available, key=lambda p: p.overall_rating)
                selected[i] = best
                used_ids.add(best.id)

    return [p for p in selected if p is not None]


def build_tactic_profile(formation: str, philosophy: str, manager=None) -> TacticProfile:
    base = PHILOSOPHY_MODIFIERS.get(philosophy, PHILOSOPHY_MODIFIERS['BALANCED'])
    profile = TacticProfile(
        atk_mod=base['atk_mod'],
        def_mod=base['def_mod'],
        mid_mod=base['mid_mod'],
        pressing_intensity=base['pressing'],
        defensive_line=base['line'],
        width=base['width'],
        tempo=base['tempo'],
        marking=base['marking'],
        directness=base['directness'],
    )

    if manager:
        mgr = manager
        coach_atk = getattr(mgr, 'coaching_attacking', 50)
        coach_def = getattr(mgr, 'coaching_defensive', 50)
        coach_tac = getattr(mgr, 'coaching_tactical', 50)
        mgr_pressing = getattr(mgr, 'pressing', 50)
        creativity = getattr(mgr, 'creative_freedom', 50)

        profile.atk_mod *= (0.8 + coach_atk / 250)
        profile.def_mod *= (0.8 + coach_def / 250)
        profile.pressing_intensity = profile.pressing_intensity * 0.6 + mgr_pressing * 0.4
        profile.creativity = creativity
        profile.tempo += (coach_atk - 50) * 0.2
        profile.defensive_line += (coach_tac - 50) * 0.2

    return profile
