import random
from typing import Optional


# 8 pitch zones for shot location
SHOT_ZONES = {
    # 6-yard box
    'SIX_CENTRAL': {'base_xg': 0.35, 'label': 'Six-yard box'},
    'SIX_WIDE':    {'base_xg': 0.22, 'label': 'Six-yard box (wide)'},
    # 18-yard box
    'BOX_CENTRAL': {'base_xg': 0.09, 'label': 'Penalty area central'},
    'BOX_WIDE':    {'base_xg': 0.05, 'label': 'Penalty area wide'},
    # Edge of box
    'EDGE':        {'base_xg': 0.03, 'label': 'Edge of the area'},
    # Long range
    'LONG_RANGE':  {'base_xg': 0.015, 'label': 'Long range'},
    # Headers (separate, lower xG)
    'HEADER_SIX':  {'base_xg': 0.18, 'label': 'Header six-yard box'},
    'HEADER_BOX':  {'base_xg': 0.05, 'label': 'Header penalty area'},
}

# Shot type modifiers
SHOT_TYPE_MODIFIERS = {
    'foot':      1.0,
    'header':    0.7,
    'volley':    1.15,
    'half_volley': 1.05,
    'long_shot': 0.6,
    'set_piece': 0.85,
    'penalty':   1.0,
}


def calculate_xg(
    zone: str,
    shot_type: str,
    player_finishing: int = 50,
    player_composure: int = 50,
    player_technique: int = 50,
    player_long_shots: int = 50,
    player_heading: int = 50,
    pressure: float = 0.5,
    gk_rating: float = 50.0,
    is_penalty: bool = False,
) -> float:
    if is_penalty:
        base = 0.78
        comp_mod = 0.6 + (player_composure / 250)
        shot_mod = SHOT_TYPE_MODIFIERS.get('penalty', 1.0)
        return max(0.01, min(0.97, base * comp_mod * shot_mod))

    zone_data = SHOT_ZONES.get(zone, SHOT_ZONES['BOX_CENTRAL'])
    base_xg = zone_data['base_xg']

    finish_mod = 0.5 + (player_finishing / 100)
    comp_mod = 0.6 + (player_composure / 200)
    tech_mod = 0.8 + (player_technique / 200)
    shot_type_mod = SHOT_TYPE_MODIFIERS.get(shot_type, 1.0)

    # Header-specific modifier
    if shot_type == 'header':
        finish_mod = 0.5 + (player_heading / 100)

    # Long shot modifier
    if zone == 'LONG_RANGE':
        finish_mod = 0.4 + (player_long_shots / 100)

    pressure_mod = max(0.2, 1.0 - pressure * 0.6)
    gk_mod = 45.0 / (gk_rating + 20)

    xg = base_xg * finish_mod * comp_mod * tech_mod * shot_type_mod * pressure_mod * gk_mod
    return max(0.005, min(0.50, xg))


def resolve_shot(
    xg: float,
    player_consistency: int = 50,
    player_big_match: int = 50,
    is_big_game: bool = False,
) -> dict:
    big_mod = 1.0
    if is_big_game:
        big_mod = 0.7 + player_big_match / 200

    variance = 1.0 + (1.0 - player_consistency / 100) * 0.3
    effective_xg = xg * big_mod * variance

    roll = random.random()

    if roll < effective_xg:
        return {'outcome': 'goal'}
    elif roll < effective_xg + (1 - effective_xg) * 0.35:
        return {'outcome': 'on_target'}
    elif roll < effective_xg + (1 - effective_xg) * 0.55:
        return {'outcome': 'woodwork'}
    elif roll < effective_xg + (1 - effective_xg) * 0.70:
        return {'outcome': 'blocked'}
    else:
        return {'outcome': 'off_target'}
