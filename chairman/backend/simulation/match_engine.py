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
    ]
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
    on_event=None,
    home_form_bonus=0,
    away_form_bonus=0,
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

    def fat_factor(p):
        return max(0.5, 1.0 - p.fatigue / 200)

    def calc_strengths(players, tac, form, is_home, form_bonus=0):
        active = get_active(players)
        if not active: return 0, 0, 0, 30

        mids = [p for p in active if p.position.upper() == 'MID']
        atts = [p for p in active if p.position.upper() == 'ATT']
        defs = [p for p in active if p.position.upper() == 'DEF']
        gks = [p for p in active if p.position.upper() == 'GK']

        if mids:
            mid_base = sum((p.tech_passing + p.tech_vision + p.phys_stamina) * fat_factor(p) for p in mids) / len(mids)
        else:
            mid_base = sum(p.overall_rating * fat_factor(p) for p in active) / len(active) * 0.7

        if atts:
            atk_base = sum((p.tech_shooting * 0.5 + p.tech_finishing * 0.5) * fat_factor(p) for p in atts) / len(atts)
        else:
            atk_base = sum(p.overall_rating * fat_factor(p) for p in active) / len(active) * 0.4

        if defs:
            def_base = sum((p.tech_tackling * 0.5 + p.tech_positioning * 0.5) * fat_factor(p) for p in defs) / len(defs)
        else:
            def_base = sum(p.overall_rating * fat_factor(p) for p in active) / len(active) * 0.4

        gk_rating = sum((p.tech_reflexes * 0.5 + p.tech_handling * 0.5) * fat_factor(p) for p in gks) / len(gks) if gks else 30

        # Home advantage + form bonus
        if is_home:
            atk_base += 3
            mid_base += 3

        atk_base += form_bonus
        mid_base += form_bonus

        atk = atk_base * tac['atk_mod'] * form['atk_mod']
        dfn = def_base * tac['def_mod'] * form['def_mod']
        mid = mid_base * tac['mid_mod'] * form['mid_mod']

        return max(20, atk), max(20, dfn), max(20, mid), max(20, gk_rating)

    # Initial strengths
    h_atk, h_def, h_mid, h_gk = calc_strengths(home_players, home_tac_mod, home_form_mod, True, home_form_bonus)
    a_atk, a_def, a_mid, a_gk = calc_strengths(away_players, away_tac_mod, away_form_mod, False, away_form_bonus)
    red_card_count = 0

    # 3. Simulation loop: 5-minute blocks, 18 blocks = 90 minutes
    for block in range(1, 19):
        minute = block * 5

        # Crowd Reaction chance
        if random.random() < 0.15:
            reactions = [
                "The home fans are absolutely deafening now!",
                "Jeers from the away end as they feel a decision went against them.",
                "A Mexican wave has started in the East Stand.",
                "The atmosphere is electric as we approach a crucial phase.",
                "Supporters are on their feet, urging their team forward!"
            ]
            match_data['events'].append({
                "minute": minute - random.randint(0, 4),
                "type": "COMMENTARY",
                "club_id": None,
                "player_id": None,
                "description": random.choice(reactions),
                "home_score": match_data['home_score'],
                "away_score": match_data['away_score'],
            })

        # 4e. Fatigue modifier
        fatigue_mod = 1.0
        if minute > 75: fatigue_mod = 0.88
        elif minute > 60: fatigue_mod = 0.95

        # Recalculate strengths only if a red card happened
        if len(red_cards) > red_card_count:
            h_atk, h_def, h_mid, h_gk = calc_strengths(home_players, home_tac_mod, home_form_mod, True, home_form_bonus)
            a_atk, a_def, a_mid, a_gk = calc_strengths(away_players, away_tac_mod, away_form_mod, False, away_form_bonus)
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

        # 4a. Calculate possession from midfield battle - Add baseline to prevent 0%
        # Clamp possession between 25% and 75% for balance
        total_mid = h_mid_eff + a_mid_eff
        if total_mid > 0:
            raw_h_poss = (h_mid_eff / total_mid) * 100
            block_home_poss = max(25.0, min(75.0, raw_h_poss))
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

        # Momentum boosts shot chance by up to 50%
        h_shot_chance = (0.08 + 0.25 * h_entries) * (block_home_poss / 50) * (1 + home_momentum * 0.5)
        a_shot_chance = (0.08 + 0.25 * a_entries) * ((100 - block_home_poss) / 50) * (1 + away_momentum * 0.5)

        for team, chance, atk_eff, def_eff, opp_gk, players, opp_players, club_id, opp_club_id in [
            ('home', h_shot_chance, h_atk_eff, a_def_eff, a_gk, home_players, away_players, home_id, away_id),
            ('away', a_shot_chance, a_atk_eff, h_def_eff, h_gk, away_players, home_players, away_id, home_id)
        ]:
            active = get_active(players)
            if not active: continue

            shots_this_block = 0
            # Higher base shot counts
            if random.random() < chance: shots_this_block += 1
            if random.random() < chance * 0.4: shots_this_block += 1
            if random.random() < chance * 0.2: shots_this_block += 1

            for _ in range(shots_this_block):
                match_data[f'{team}_shots'] += 1
                shooter = random.choices(active, weights=[1.5 if p.position.upper() == 'ATT' else 1.0 if p.position.upper() == 'MID' else 0.4 for p in active])[0]

                # 4c. Calculate xG - More generous base
                pos_mod = 1.5 if shooter.position.upper() == 'ATT' else 1.1 if shooter.position.upper() == 'MID' else 0.7
                comp_mod = 0.6 + (shooter.ment_composure / 100)
                pressure_ratio = def_eff / (def_eff + atk_eff + 1)
                gk_mod = 75 / (opp_gk * fatigue_mod + 1)

                xg = 0.10 * pos_mod * comp_mod * (1.5 - pressure_ratio) * gk_mod
                xg = max(0.02, min(0.30, xg)) 
                match_data[f'{team}_xg'] += xg

                # 4d. Determine goal from xG roll
                if random.random() < xg:
                    # VAR Check (5% chance)
                    is_var_disallowed = False
                    if random.random() < 0.05:
                        match_data['events'].append({
                            "minute": minute, "type": "COMMENTARY", "club_id": club_id, "player_id": shooter.id,
                            "description": f"VAR CHECK: Possible offside in the build-up to the goal...",
                            "home_score": match_data['home_score'],
                            "away_score": match_data['away_score'],
                        })
                        if random.random() < 0.4: # 40% chance VAR disallows it
                            is_var_disallowed = True
                            match_data['events'].append({
                                "minute": minute, "type": "COMMENTARY", "club_id": club_id, "player_id": shooter.id,
                                "description": f"GOAL DISALLOWED! VAR rules there was an offside.",
                                "home_score": match_data['home_score'],
                                "away_score": match_data['away_score'],
                            })

                    if is_var_disallowed:
                        continue

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

        # 5. Card & Injury logic per block
        for team, players, club_id, opp_mgr in [
            ('home', home_players, home_id, away_manager),
            ('away', away_players, away_id, home_manager)
        ]:
            active = get_active(players)
            if not active: continue

            # Injury check (0.5% chance per block for each team)
            if random.random() < 0.005:
                injured = random.choice(active)
                event = {
                    "minute": minute - random.randint(0, 4), "type": "INJURY", "club_id": club_id, "player_id": injured.id,
                    "description": f"Injury! {injured.last_name} is down and receiving treatment.",
                    "home_score": match_data['home_score'],
                    "away_score": match_data['away_score'],
                }
                match_data['events'].append(event)
                if on_event: on_event(event)

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
            elif random.random() < 0.001 * (fouler.ment_aggression / 50):
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
        early_pool = [
            "Early pressure from the home side, looking to set the tempo.",
            "A fast start here as both teams fly into challenges.",
            "Tentative opening minutes as the teams size each other up.",
            "The home fans are in full voice in these early stages.",
            "Early tactical battle, managers already making adjustments.",
        ]
        late_pool = [
            "Entering the final stages, nerves are starting to show.",
            "The players are looking tired, fatigue could be a factor now.",
            "One last push from the visitors, throwing men forward.",
            "Desperate defending as the home side clings on.",
            "The clock is ticking down, tension rising in the stadium.",
            "All or nothing now, tactics have gone out the window!",
            "A dramatic finish looks likely as we enter the closing minutes.",
        ]
        general_pool = [
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
            f"The referee is letting the game flow, a very physical encounter.",
            "Scrappy play in the middle as possession keeps changing hands.",
            "Looking for an opening, but the defenses remain resolute.",
            "A lull in the action as the pace slows down slightly.",
            "Both teams looking comfortable on the ball under pressure.",
            "The midfield engine room is working overtime today.",
            "The managers will be preparing their half-time team talks.",
            "End-to-end stuff now as the game really starts to open up.",
        ]

        if minute <= 15:
            current_pool = early_pool + general_pool
        elif minute >= 75:
            current_pool = late_pool + general_pool
        else:
            current_pool = general_pool

        comm_event = {
            "minute": minute, "type": "COMMENTARY", "club_id": None, "player_id": None,
            "description": random.choice(current_pool),
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

        # Substitution flavor (random chance between 60-80 mins)
        if 60 <= minute <= 80 and random.random() < 0.1:
            team_for_sub = random.choice(['home', 'away'])
            sub_club_id = home_id if team_for_sub == 'home' else away_id
            sub_club_name = home_name if team_for_sub == 'home' else away_name

            sub_event = {
                "minute": minute, "type": "COMMENTARY", "club_id": sub_club_id, "player_id": None,
                "description": f"Substitution for {sub_club_name}. The manager is looking to freshen things up.",
                "home_score": match_data['home_score'],
                "away_score": match_data['away_score'],
            }
            match_data['events'].append(sub_event)
            if on_event: on_event(sub_event)

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
