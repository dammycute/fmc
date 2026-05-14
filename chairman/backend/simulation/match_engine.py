import random
from dataclasses import dataclass

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

def simulate_match(
    home_club,
    away_club,
    home_players: list[PlayerSnapshot],
    away_players: list[PlayerSnapshot],
    home_manager,
    away_manager,
    season: int,
    week: int,
    on_event=None
) -> dict:
    # 2. Return structure
    match_data = {
        "home_score": 0,
        "away_score": 0,
        "home_xg": 0.0,
        "away_xg": 0.0,
        "home_possession": 50.0,
        "away_possession": 50.0,
        "home_shots": 0,
        "away_shots": 0,
        "home_shots_on_target": 0,
        "away_shots_on_target": 0,
        "events": [],
        "player_ratings": {p.id: 6.0 for p in home_players + away_players}
    }

    if not home_players or not away_players:
        match_data["events"].append({"minute": 1, "type": "COMMENTARY", "description": "Match abandoned - insufficient players.", "club_id": None, "player_id": None})
        return match_data

    # Initial setup
    home_momentum = 0.0
    away_momentum = 0.0
    home_yellows = {}
    away_yellows = {}
    red_cards = set()
    total_home_poss = 0.0

    home_id = getattr(home_club, 'id', 'home')
    away_id = getattr(away_club, 'id', 'away')
    home_name = getattr(home_club, 'name', 'Home')
    away_name = getattr(away_club, 'name', 'Away')

    home_tac_mod = get_tactical_modifiers(getattr(home_club, 'tactics', 'DIRECT'))
    away_tac_mod = get_tactical_modifiers(getattr(away_club, 'tactics', 'DIRECT'))
    home_form_mod = FORMATION_BONUSES.get(getattr(home_club, 'formation', '4-4-2'), FORMATION_BONUSES['4-4-2'])
    away_form_mod = FORMATION_BONUSES.get(getattr(away_club, 'formation', '4-4-2'), FORMATION_BONUSES['4-4-2'])

    def get_active(players):
        return [p for p in players if p.id not in red_cards]

    def calc_strengths(players, tac, form, is_home):
        active = get_active(players)
        if not active: return 0, 0, 0, 30

        mids = [p for p in active if p.position == 'MID']
        atts = [p for p in active if p.position == 'ATT']
        defs = [p for p in active if p.position == 'DEF']
        gks = [p for p in active if p.position == 'GK']

        # 4a. Possession base: MID player avg passing+vision+stamina
        if mids:
            mid_base = sum(p.tech_passing + p.tech_vision + p.phys_stamina for p in mids) / len(mids)
        else:
            mid_base = sum(p.overall_rating for p in active) / len(active) * 0.7

        if atts:
            atk_base = sum(p.tech_shooting * 0.5 + p.tech_finishing * 0.5 for p in atts) / len(atts)
        else:
            atk_base = sum(p.overall_rating for p in active) / len(active) * 0.4

        if defs:
            def_base = sum(p.tech_tackling * 0.5 + p.tech_positioning * 0.5 for p in defs) / len(defs)
        else:
            def_base = sum(p.overall_rating for p in active) / len(active) * 0.4

        gk_rating = sum(p.tech_reflexes * 0.5 + p.tech_handling * 0.5 for p in gks) / len(gks) if gks else 30

        # 10. Home advantage: +3 to home attack and midfield base
        if is_home:
            atk_base += 3
            mid_base += 3

        atk = atk_base * tac['atk_mod'] * form['atk_mod']
        dfn = def_base * tac['def_mod'] * form['def_mod']
        mid = mid_base * tac['mid_mod'] * form['mid_mod']

        return atk, dfn, mid, gk_rating

    # Initial strengths
    h_atk, h_def, h_mid, h_gk = calc_strengths(home_players, home_tac_mod, home_form_mod, True)
    a_atk, a_def, a_mid, a_gk = calc_strengths(away_players, away_tac_mod, away_form_mod, False)
    red_card_count = 0

    # 3. Simulation loop: 5-minute blocks, 18 blocks = 90 minutes
    for block in range(1, 19):
        minute = block * 5

        # 4e. Fatigue modifier
        fatigue_mod = 1.0
        if minute > 75: fatigue_mod = 0.88
        elif minute > 60: fatigue_mod = 0.95

        # Recalculate strengths only if a red card happened
        if len(red_cards) > red_card_count:
            h_atk, h_def, h_mid, h_gk = calc_strengths(home_players, home_tac_mod, home_form_mod, True)
            a_atk, a_def, a_mid, a_gk = calc_strengths(away_players, away_tac_mod, away_form_mod, False)
            red_card_count = len(red_cards)

        # 4f. Game state adaptation
        h_state_atk, h_state_def = 1.0, 1.0
        a_state_atk, a_state_def = 1.0, 1.0

        if match_data['home_score'] < match_data['away_score']:
            h_state_atk = 1.12
        elif match_data['home_score'] >= match_data['away_score'] + 2:
            h_state_def = 1.10
            h_state_atk = 0.90

        if match_data['away_score'] < match_data['home_score']:
            a_state_atk = 1.12
        elif match_data['away_score'] >= match_data['home_score'] + 2:
            a_state_def = 1.10
            a_state_atk = 0.90

        h_atk_eff = h_atk * h_state_atk * fatigue_mod
        h_def_eff = h_def * h_state_def * fatigue_mod
        h_mid_eff = h_mid * fatigue_mod

        a_atk_eff = a_atk * a_state_atk * fatigue_mod
        a_def_eff = a_def * a_state_def * fatigue_mod
        a_mid_eff = a_mid * fatigue_mod

        # 4a. Calculate possession from midfield battle
        total_mid = h_mid_eff + a_mid_eff
        if total_mid > 0:
            block_home_poss = (h_mid_eff / total_mid) * 100
        else:
            block_home_poss = 50.0
        total_home_poss += block_home_poss

        # 6. Momentum decay 0.02 per block toward zero
        home_momentum = max(0, home_momentum - 0.02) if home_momentum > 0 else min(0, home_momentum + 0.02)
        away_momentum = max(0, away_momentum - 0.02) if away_momentum > 0 else min(0, away_momentum + 0.02)

        # 4b. Generate shot attempts weighted by possession % and attacking third entries
        # Attacking third entries modeled as Midfield efficiency vs Opponent defense
        h_entries = h_mid_eff / (a_def_eff + 1)
        a_entries = a_mid_eff / (h_def_eff + 1)

        # Momentum boosts shot chance by up to 30%
        h_shot_chance = 0.22 * (block_home_poss / 50) * h_entries * (1 + home_momentum * 0.3)
        a_shot_chance = 0.22 * ((100 - block_home_poss) / 50) * a_entries * (1 + away_momentum * 0.3)

        for team, chance, atk_eff, def_eff, opp_gk, players, opp_players, club_id, opp_club_id in [
            ('home', h_shot_chance, h_atk_eff, a_def_eff, a_gk, home_players, away_players, home_id, away_id),
            ('away', a_shot_chance, a_atk_eff, h_def_eff, h_gk, away_players, home_players, away_id, home_id)
        ]:
            active = get_active(players)
            if not active: continue

            shots_this_block = 0
            if random.random() < chance: shots_this_block += 1
            if random.random() < chance * 0.3: shots_this_block += 1

            for _ in range(shots_this_block):
                match_data[f'{team}_shots'] += 1
                shooter = random.choices(active, weights=[1.3 if p.position == 'ATT' else 0.9 if p.position == 'MID' else 0.5 for p in active])[0]

                # 4c. Calculate xG
                pos_mod = 1.3 if shooter.position == 'ATT' else 0.9 if shooter.position == 'MID' else 0.5
                comp_mod = shooter.ment_composure / 50
                pressure_ratio = def_eff / (def_eff + atk_eff + 1)
                gk_mod = 50 / (opp_gk + 1)

                xg = 0.12 * pos_mod * comp_mod * (1.2 - pressure_ratio) * gk_mod
                xg = max(0.01, min(0.75, xg))
                match_data[f'{team}_xg'] += xg

                # 4d. Determine goal from xG roll
                if random.random() < xg:
                    match_data[f'{team}_score'] += 1
                    match_data[f'{team}_shots_on_target'] += 1

                    # 6. Momentum shift
                    if team == 'home':
                        home_momentum += 0.15
                        away_momentum -= 0.10
                    else:
                        away_momentum += 0.15
                        home_momentum -= 0.10

                    # 7. Player ratings
                    match_data['player_ratings'][shooter.id] += 0.5

                    # Assist
                    others = [p for p in active if p.id != shooter.id]
                    assist_desc = ""
                    assister_id = None
                    if others:
                        assister = random.choices(others, weights=[1.5 if p.position == 'MID' else 1.0 if p.position == 'ATT' else 0.5 for p in others])[0]
                        match_data['player_ratings'][assister.id] += 0.3
                        assist_desc = f" Assisted by {assister.last_name}."
                        assister_id = assister.id

                    # Defender penalty
                    for op in get_active(opp_players):
                        if op.position == 'DEF':
                            match_data['player_ratings'][op.id] -= 0.3

                    event = {
                        "minute": minute, "type": "GOAL", "club_id": club_id, "player_id": shooter.id,
                        "assister_id": assister_id,
                        "description": f"GOAL! {shooter.last_name} scores for {home_name if team == 'home' else away_name}!{assist_desc}",
                        "home_score": match_data['home_score'],
                        "away_score": match_data['away_score'],
                    }
                    match_data['events'].append(event)
                    if on_event:
                        on_event(event)
                elif random.random() < 0.4:
                    match_data[f'{team}_shots_on_target'] += 1

        # 5. Card logic per block
        for team, players, club_id, opp_mgr in [
            ('home', home_players, home_id, away_manager),
            ('away', away_players, away_id, home_manager)
        ]:
            active = get_active(players)
            if not active: continue

            opp_press = getattr(opp_mgr, 'pressing', 50) if opp_mgr else 50
            fouler = random.choice(active)

            # Yellow: base 2.5% * (opponent_pressing/50) * (player.hidden_temperament/50)
            if random.random() < 0.025 * (opp_press / 50) * (fouler.hidden_temperament / 50):
                yellows = home_yellows if team == 'home' else away_yellows
                yellows[fouler.id] = yellows.get(fouler.id, 0) + 1
                if yellows[fouler.id] == 2:
                    red_cards.add(fouler.id)
                    event = {
                        "minute": minute, "type": "CARD", "club_id": club_id, "player_id": fouler.id,
                    "description": f"RED CARD! {fouler.last_name} sent off after second yellow!",
                    "home_score": match_data['home_score'],
                    "away_score": match_data['away_score'],
                    }
                    match_data['events'].append(event)
                    if on_event: on_event(event)
                else:
                    event = {
                        "minute": minute, "type": "CARD", "club_id": club_id, "player_id": fouler.id,
                    "description": f"Yellow card: {fouler.last_name} booked.",
                    "home_score": match_data['home_score'],
                    "away_score": match_data['away_score'],
                    }
                    match_data['events'].append(event)
                    if on_event: on_event(event)
            elif random.random() < 0.003 * (fouler.ment_aggression / 50):
                # Direct red: 0.3% * (player.ment_aggression/50)
                red_cards.add(fouler.id)
                event = {
                    "minute": minute, "type": "CARD", "club_id": club_id, "player_id": fouler.id,
                "description": f"DIRECT RED CARD! {fouler.last_name} sent off!",
                "home_score": match_data['home_score'],
                "away_score": match_data['away_score'],
                }
                match_data['events'].append(event)
                if on_event: on_event(event)

        # 7. Possession involvement +0.1 per block if on possessing team
        poss_team_players = home_players if block_home_poss > 50 else away_players
        for p in get_active(poss_team_players):
            match_data['player_ratings'][p.id] += 0.1

        # Add basic commentary for every block to ensure regular ticker updates
        commentary_pool = [
            f"Battle in midfield as {home_name} and {away_name} fight for control.",
            f"{home_name} showing some good tactical shape in this phase.",
            f"{away_name} looking to break through the {home_name} defense.",
            f"The game is finely balanced as we approach the {minute} minute mark.",
            f"{home_name} keep the ball well in the middle of the park.",
            f"{away_name} are sitting deep and absorbing pressure.",
            f"A cagey affair so far, neither side wanting to overcommit.",
            f"The crowd is finding its voice as {home_name} push forward.",
            f"{away_name} looking dangerous on the counter-attack.",
            f"Tactical battle unfolding here, both managers barking instructions.",
        ]
        comm_event = {
            "minute": minute, "type": "COMMENTARY", "club_id": None, "player_id": None,
            "description": random.choice(commentary_pool),
            "home_score": match_data['home_score'],
            "away_score": match_data['away_score'],
        }
        match_data['events'].append(comm_event)
        if on_event: on_event(comm_event)

        if minute == 45:
            event = {
                "minute": 45, "type": "COMMENTARY", "club_id": None, "player_id": None,
                "description": f"Half-time: {home_name} {match_data['home_score']} - {match_data['away_score']} {away_name}",
                "home_score": match_data['home_score'],
                "away_score": match_data['away_score'],
            }
            match_data['events'].append(event)
            if on_event: on_event(event)

    # Finalize match stats
    match_data['home_possession'] = round(total_home_poss / 18, 1)
    match_data['away_possession'] = round(100 - match_data['home_possession'], 1)
    match_data['home_xg'] = round(match_data['home_xg'], 2)
    match_data['away_xg'] = round(match_data['away_xg'], 2)

    # 7. Final ratings noise and clamp
    for p in home_players + away_players:
        # Consistency noise: ±(0.5 * (1 - hidden_consistency/100))
        noise_range = 0.5 * (1 - p.hidden_consistency / 100)
        match_data['player_ratings'][p.id] += random.uniform(-noise_range, noise_range)
        match_data['player_ratings'][p.id] = round(max(3.0, min(10.0, match_data['player_ratings'][p.id])), 1)

    event = {
        "minute": 90, "type": "COMMENTARY", "club_id": None, "player_id": None,
        "description": f"Full-time: {home_name} {match_data['home_score']} - {match_data['away_score']} {away_name}",
        "home_score": match_data['home_score'],
        "away_score": match_data['away_score'],
    }
    match_data['events'].append(event)
    if on_event: on_event(event)

    return match_data
