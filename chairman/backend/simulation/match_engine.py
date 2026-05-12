import random
from dataclasses import dataclass, field

@dataclass
class PlayerSnapshot:
    id: str
    first_name: str
    last_name: str
    position: str  # GK, DEF, MID, ATT
    overall_rating: float
    tech_shooting: int
    tech_finishing: int
    tech_passing: int
    tech_vision: int
    tech_tackling: int
    tech_positioning: int
    tech_reflexes: int
    tech_handling: int
    phys_pace: int
    phys_strength: int
    phys_stamina: int
    phys_agility: int
    phys_acceleration: int
    ment_leadership: int
    ment_composure: int
    ment_work_rate: int
    ment_decisions: int
    ment_determination: int
    ment_aggression: int
    hidden_consistency: int
    hidden_big_match: int
    hidden_temperament: int
    hidden_injury_proneness: int
    morale: float
    fatigue: float

@dataclass
class TeamStats:
    attack_strength: float
    defense_strength: float
    midfield_control: float
    gk_rating: float
    overall: float
    morale: float
    fatigue: float
    leadership: float
    composure: float

FORMATION_BONUSES = {
    '4-4-2':         {'atk_mod': 1.0,  'def_mod': 1.0,  'mid_mod': 1.0  },
    '4-3-3':         {'atk_mod': 1.10, 'def_mod': 0.95, 'mid_mod': 0.95 },
    '3-5-2':         {'atk_mod': 1.05, 'def_mod': 0.90, 'mid_mod': 1.10 },
    '4-2-3-1':       {'atk_mod': 1.05, 'def_mod': 1.0,  'mid_mod': 1.05 },
    '5-4-1':         {'atk_mod': 0.85, 'def_mod': 1.15, 'mid_mod': 1.0  },
    '4-4-2_DIAMOND': {'atk_mod': 1.05, 'def_mod': 0.95, 'mid_mod': 1.05 },
}

def get_tactical_modifiers(tactics: str) -> dict:
    if tactics == 'POSSESSION':      return {'atk_mod': 0.95, 'def_mod': 1.0,  'mid_mod': 1.15}
    if tactics == 'HIGH_PRESSING':   return {'atk_mod': 1.15, 'def_mod': 0.90, 'mid_mod': 1.10}
    if tactics == 'COUNTER_ATTACK':  return {'atk_mod': 1.20, 'def_mod': 1.10, 'mid_mod': 0.85}
    if tactics == 'DEFENSIVE':       return {'atk_mod': 0.70, 'def_mod': 1.35, 'mid_mod': 0.95}
    if tactics == 'WING_PLAY':       return {'atk_mod': 1.10, 'def_mod': 0.95, 'mid_mod': 1.0 }
    if tactics == 'DIRECT':          return {'atk_mod': 1.15, 'def_mod': 1.0,  'mid_mod': 0.90}
    return {'atk_mod': 1.0,  'def_mod': 1.0,  'mid_mod': 1.0}

def calculate_team_stats(players: list[PlayerSnapshot]) -> TeamStats:
    if not players:
        return TeamStats(30, 30, 30, 30, 30, 50, 0, 30, 50)

    gks = [p for p in players if p.position == 'GK']
    defs = [p for p in players if p.position == 'DEF']
    mids = [p for p in players if p.position == 'MID']
    atts = [p for p in players if p.position == 'ATT']

    def avg_rating(arr):
        return sum(p.overall_rating for p in arr) / len(arr) if arr else 0

    def avg_attr(arr, attr_name):
        return sum(getattr(p, attr_name) for p in arr) / len(arr) if arr else 0

    att_raw = (avg_rating(atts) * 0.6 +
               avg_attr(atts, 'tech_shooting') * 0.2 +
               avg_attr(atts, 'tech_finishing') * 0.2) if atts else avg_rating(players) * 0.5

    def_raw = (avg_rating(defs) * 0.5 +
               avg_attr(defs, 'tech_tackling') * 0.25 +
               avg_attr(defs, 'tech_positioning') * 0.25) if defs else avg_rating(players) * 0.5

    gk_rating = (avg_rating(gks) * 0.4 +
                 avg_attr(gks, 'tech_reflexes') * 0.3 +
                 avg_attr(gks, 'tech_handling') * 0.3) if gks else 40

    mid_raw = (avg_rating(mids) * 0.5 +
               avg_attr(mids, 'tech_passing') * 0.2 +
               avg_attr(mids, 'tech_vision') * 0.2 +
               avg_attr(mids, 'phys_stamina') * 0.1) if mids else avg_rating(players) * 0.5

    morale = sum(p.morale for p in players) / len(players)
    fatigue = sum(p.fatigue for p in players) / len(players)
    leadership = max((p.ment_leadership for p in players), default=30)
    composure = avg_attr(atts if atts else players, 'ment_composure')

    return TeamStats(
        attack_strength=att_raw,
        defense_strength=(def_raw * 0.7 + gk_rating * 0.3),
        midfield_control=mid_raw,
        gk_rating=gk_rating,
        overall=(att_raw + def_raw + mid_raw) / 3,
        morale=morale,
        fatigue=fatigue,
        leadership=leadership,
        composure=composure
    )

def simulate_match(
    home_club,
    away_club,
    home_players: list[PlayerSnapshot],
    away_players: list[PlayerSnapshot],
    home_manager,
    away_manager,
    season: int,
    week: int
) -> dict:

    if not home_players or not away_players:
        return {
            "home_score": 0, "away_score": 0, "home_xg": 0.0, "away_xg": 0.0,
            "home_possession": 50.0, "away_possession": 50.0,
            "home_shots": 0, "away_shots": 0,
            "home_shots_on_target": 0, "away_shots_on_target": 0,
            "events": [{"minute": 1, "type": "COMMENTARY", "description": "Match abandoned - insufficient players."}],
            "player_ratings": {}
        }

    # Initial stats
    home_stats_base = calculate_team_stats(home_players)
    away_stats_base = calculate_team_stats(away_players)

    home_tactics = getattr(home_club, 'tactics', 'DIRECT')
    away_tactics = getattr(away_club, 'tactics', 'DIRECT')

    home_tac_mod = get_tactical_modifiers(home_tactics)
    away_tac_mod = get_tactical_modifiers(away_tactics)

    home_form_bonus = FORMATION_BONUSES.get(getattr(home_club, 'formation', '4-4-2'), FORMATION_BONUSES['4-4-2'])
    away_form_bonus = FORMATION_BONUSES.get(getattr(away_club, 'formation', '4-4-2'), FORMATION_BONUSES['4-4-2'])

    # Team base strengths (apply tactical and formation modifiers)
    # Home advantage: +3 to home attack and midfield
    home_atk_base = home_stats_base.attack_strength * home_tac_mod['atk_mod'] * home_form_bonus['atk_mod'] + 3
    home_def_base = home_stats_base.defense_strength * home_tac_mod['def_mod'] * home_form_bonus['def_mod']
    home_mid_base = home_stats_base.midfield_control * home_tac_mod['mid_mod'] * home_form_bonus['mid_mod'] + 3

    away_atk_base = away_stats_base.attack_strength * away_tac_mod['atk_mod'] * away_form_bonus['atk_mod']
    away_def_base = away_stats_base.defense_strength * away_tac_mod['def_mod'] * away_form_bonus['def_mod']
    away_mid_base = away_stats_base.midfield_control * away_tac_mod['mid_mod'] * away_form_bonus['mid_mod']

    # Possession calculation (Midfield battle)
    raw_poss = (home_mid_base / (home_mid_base + away_mid_base)) * 100
    home_possession = max(35, min(65, raw_poss + random.uniform(-3, 3)))
    away_possession = 100 - home_possession

    match_data = {
        "home_score": 0, "away_score": 0, "home_xg": 0.0, "away_xg": 0.0,
        "home_shots": 0, "away_shots": 0, "home_shots_on_target": 0, "away_shots_on_target": 0,
        "home_possession": home_possession, "away_possession": away_possession,
        "events": [], "player_ratings": {p.id: 6.0 for p in home_players + away_players}
    }

    # MOMENTUM system
    home_momentum = 0.0
    away_momentum = 0.0
    home_yellows = {}
    away_yellows = {}
    red_cards = set()

    # big_match bonus if match is top-half vs top-half (reputation > 70 as proxy)
    is_big_match = (getattr(home_club, 'reputation', 50) > 70 and getattr(away_club, 'reputation', 50) > 70)

    # Simulate in 5-minute blocks
    for minute in range(5, 95, 5):
        # 3. FATIGUE CURVE
        fatigue_mod = 1.0
        if minute > 75: fatigue_mod = 0.88
        elif minute > 60: fatigue_mod = 0.95

        # Momentum decay
        decay = 0.02
        home_momentum = max(0, home_momentum - decay) if home_momentum > 0 else min(0, home_momentum + decay)
        away_momentum = max(0, away_momentum - decay) if away_momentum > 0 else min(0, away_momentum + decay)

        # 4. GAME STATE ADAPTATION
        h_atk_g, h_def_g = 1.0, 1.0
        a_atk_g, a_def_g = 1.0, 1.0

        if match_data['home_score'] < match_data['away_score']:
            h_atk_g, h_def_g = 1.12, 0.90 # Losing
        elif match_data['home_score'] >= match_data['away_score'] + 2:
            h_atk_g, h_def_g = 0.88, 1.10 # Winning by 2+

        if match_data['away_score'] < match_data['home_score']:
            a_atk_g, a_def_g = 1.12, 0.90
        elif match_data['away_score'] >= match_data['home_score'] + 2:
            a_atk_g, a_def_g = 0.88, 1.10

        eff_h_atk = home_atk_base * h_atk_g * fatigue_mod
        eff_h_def = home_def_base * h_def_g * fatigue_mod
        eff_a_atk = away_atk_base * a_atk_g * fatigue_mod
        eff_a_def = away_def_base * a_def_g * fatigue_mod

        # Shot frequency (chance_rate affects momentum)
        base_chance = 0.38
        h_chance = base_chance * (home_possession / 50) * (1 + home_momentum * 0.3)
        a_chance = base_chance * (away_possession / 50) * (1 + away_momentum * 0.3)

        for team in ['home', 'away']:
            chance = h_chance if team == 'home' else a_chance
            if random.random() < chance:
                match_data[f'{team}_shots'] += 1

                team_players = home_players if team == 'home' else away_players
                available = [p for p in team_players if p.id not in red_cards]
                if not available: continue

                weights = [1.5 if p.position == 'ATT' else 1.0 if p.position == 'MID' else 0.5 for p in available]
                shooter = random.choices(available, weights=weights)[0]

                # 1. xG MODEL
                xg = 0.10 # Base xG
                # Location
                loc_mod = 1.3 if shooter.position == 'ATT' else 0.9 if shooter.position == 'MID' else 0.5
                xg *= loc_mod
                # Attacking skill (shooting + finishing avg)
                skill_mod = (shooter.tech_shooting + shooter.tech_finishing) / 100
                xg *= skill_mod
                # Pressure
                opp_def = eff_a_def if team == 'home' else eff_h_def
                team_atk = eff_h_atk if team == 'home' else eff_a_atk
                pressure_ratio = opp_def / (opp_def + team_atk)
                xg *= (1.5 - pressure_ratio) # modifier 0.5-1.5
                # GK quality (gk_rating / 60 gives save modifier)
                opp_gk_rating = (away_stats_base.gk_rating if team == 'home' else home_stats_base.gk_rating)
                xg *= (60 / opp_gk_rating)
                # Composure (ment_composure / 100, range 0.5-1.5)
                comp_mod = shooter.ment_composure / 100 + 0.5
                xg *= comp_mod

                xg = min(0.70, xg)
                match_data[f'{team}_xg'] += xg

                if random.random() < xg:
                    match_data[f'{team}_score'] += 1
                    match_data[f'{team}_shots_on_target'] += 1

                    # Momentum shift after goal
                    if team == 'home':
                        home_momentum += 0.15
                        away_momentum -= 0.10
                    else:
                        away_momentum += 0.15
                        home_momentum -= 0.10

                    # Individual Ratings
                    match_data['player_ratings'][shooter.id] += 0.5
                    others = [p for p in available if p.id != shooter.id]
                    assist_text = ""
                    if others:
                        assister = random.choices(others, weights=[1.5 if p.position == 'MID' else 1.0 for p in others])[0]
                        match_data['player_ratings'][assister.id] += 0.3
                        assist_text = f" Assisted by {assister.last_name}."

                    # Defender penalty for conceding
                    opp_players = away_players if team == 'home' else home_players
                    for op in opp_players:
                        if op.position == 'DEF':
                            match_data['player_ratings'][op.id] -= 0.3

                    match_data['events'].append({
                        "minute": minute, "type": "GOAL", "club_id": getattr(home_club, 'id', 'home') if team == 'home' else getattr(away_club, 'id', 'away'),
                        "player_id": shooter.id, "description": f"GOAL! {shooter.last_name} scores for {getattr(home_club, 'name', 'Home') if team == 'home' else getattr(away_club, 'name', 'Away')}!{assist_text}"
                    })
                elif random.random() < 0.4:
                    match_data[f'{team}_shots_on_target'] += 1

        # 6. CARD LOGIC
        for team in ['home', 'away']:
            team_players = [p for p in (home_players if team == 'home' else away_players) if p.id not in red_cards]
            if not team_players: continue

            opp_manager = away_manager if team == 'home' else home_manager
            opp_pressing = getattr(opp_manager, 'pressing', 50)

            # Base yellow 0.025
            fouler = random.choice(team_players)
            yellow_chance = 0.025 * (fouler.hidden_temperament / 50) * (opp_pressing / 50)

            if random.random() < yellow_chance:
                yellows = home_yellows if team == 'home' else away_yellows
                yellows[fouler.id] = yellows.get(fouler.id, 0) + 1

                cid = getattr(home_club, 'id', 'home') if team == 'home' else getattr(away_club, 'id', 'away')
                if yellows[fouler.id] == 2:
                    red_cards.add(fouler.id)
                    match_data['events'].append({"minute": minute, "type": "CARD", "club_id": cid, "player_id": fouler.id, "description": f"RED CARD! {fouler.last_name} sent off after second yellow!"})
                else:
                    match_data['events'].append({"minute": minute, "type": "CARD", "club_id": cid, "player_id": fouler.id, "description": f"Yellow Card: {fouler.last_name} booked."})

            # Direct Red 0.003
            if random.random() < 0.003 * (fouler.ment_aggression / 50):
                if fouler.id not in red_cards:
                    red_cards.add(fouler.id)
                    cid = getattr(home_club, 'id', 'home') if team == 'home' else getattr(away_club, 'id', 'away')
                    match_data['events'].append({"minute": minute, "type": "CARD", "club_id": cid, "player_id": fouler.id, "description": f"DIRECT RED CARD! {fouler.last_name} for a horror tackle!"})

        # 5. RATINGS update (every block)
        for p in home_players + away_players:
            if p.id in red_cards: continue
            is_home_p = any(hp.id == p.id for hp in home_players)
            poss = home_possession if is_home_p else away_possession
            # Successful possession bonus
            if random.random() < (poss / 100):
                match_data['player_ratings'][p.id] += 0.1

            # Consistency noise: ±0.5 random noise
            noise_range = 0.5 * (1.0 - p.hidden_consistency / 100)
            match_data['player_ratings'][p.id] += random.uniform(-noise_range, noise_range)

            # Big match bonus
            if is_big_match:
                match_data['player_ratings'][p.id] += (p.hidden_big_match - 50) / 250

        if minute == 45:
            match_data['events'].append({"minute": 45, "type": "COMMENTARY", "description": f"Half-time: {getattr(home_club, 'name', 'Home')} {match_data['home_score']} - {match_data['away_score']} {getattr(away_club, 'name', 'Away')}"})

    # Final ratings clamp and commentary
    for pid in match_data['player_ratings']:
        match_data['player_ratings'][pid] = round(max(3.0, min(10.0, match_data['player_ratings'][pid])), 1)

    match_data['events'].append({"minute": 90, "type": "COMMENTARY", "description": f"Full time: {getattr(home_club, 'name', 'Home')} {match_data['home_score']} - {match_data['away_score']} {getattr(away_club, 'name', 'Away')}"})
    match_data['home_xg'] = round(match_data['home_xg'], 2)
    match_data['away_xg'] = round(match_data['away_xg'], 2)

    return match_data
