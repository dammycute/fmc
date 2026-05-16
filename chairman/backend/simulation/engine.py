import random
import math
from typing import Optional, Callable

from .models import PlayerMatchSnapshot, TeamState, MatchContext
from .tactics import build_tactic_profile, TacticProfile
from .xg_model import calculate_xg, resolve_shot
from .events import (
    build_event, goal_event, save_event, woodwork_event, big_chance_event,
    substitution_event, yellow_event, red_event, injury_event,
    penalty_awarded, momentum_event, commentary_event,
    halftime_event, fulltime_event, pick_commentary,
    EVENT_COMMENTARY, EVENT_MOMENTUM_SHIFT,
)
from .substitutions import pick_substitution

# Calibration constants
SHOTS_PER_PHASE_BASELINE = 0.6
SHOT_ON_TARGET_RATE = 0.35
POSSESSION_CLAMP = (30.0, 70.0)
PENALTY_CHANCE_PER_PHASE = 0.012
YELLOW_BASE_PER_PHASE = 0.035
RED_DIRECT_BASE_PER_PHASE = 0.002
INJURY_BASE_PER_PHASE = 0.006
SUB_RANGE = (55, 85)
STOPPAGE_MIN = 2
STOPPAGE_MAX = 6
COMMENTARY_EVERY_N_PHASES = 2


def _calc_team_strength(state: TeamState, tactic: TacticProfile, ctx: MatchContext, is_home: bool) -> dict:
    active = state.get_active()
    if not active:
        return {'atk': 20, 'def': 20, 'mid': 20, 'gk': 30}

    mids = [p for p in active if p.position.upper() == 'MID']
    atts = [p for p in active if p.position.upper() == 'ATT']
    defs = [p for p in active if p.position.upper() == 'DEF']
    gks = [p for p in active if p.position.upper() == 'GK']

    def ff(p):
        return max(0.5, 1.0 - p.fatigue / 200) * (p.sharpness / 100)

    mid_s = sum((p.tech_passing + p.tech_vision + p.phys_stamina) * ff(p) for p in mids) / max(1, len(mids)) if mids else \
            sum(p.overall_rating * ff(p) for p in active) / max(1, len(active)) * 0.7
    atk_s = sum((p.tech_shooting * 0.3 + p.tech_finishing * 0.4 + p.tech_technique * 0.3) * ff(p) for p in atts) / max(1, len(atts)) if atts else \
            sum(p.overall_rating * ff(p) for p in active) / max(1, len(active)) * 0.4
    def_s = sum((p.tech_tackling * 0.4 + p.tech_positioning * 0.4 + p.phys_strength * 0.2) * ff(p) for p in defs) / max(1, len(defs)) if defs else \
            sum(p.overall_rating * ff(p) for p in active) / max(1, len(active)) * 0.4
    gk_s = sum((p.tech_reflexes * 0.4 + p.tech_handling * 0.3 + p.tech_command_of_area * 0.3) * ff(p) for p in gks) / max(1, len(gks)) if gks else 30

    if is_home:
        atk_s += 3 * ctx.crowd_factor
        mid_s += 2 * ctx.crowd_factor

    atk_s += ctx.home_form_bonus if is_home else ctx.away_form_bonus
    mid_s += ctx.home_form_bonus if is_home else ctx.away_form_bonus

    atk_r = atk_s * tactic.atk_mod
    def_r = def_s * tactic.def_mod
    mid_r = mid_s * tactic.mid_mod

    return {'atk': max(15, atk_r), 'def': max(15, def_r), 'mid': max(15, mid_r), 'gk': max(15, gk_s)}


def _simulate_phase(
    minute: int,
    home_state: TeamState,
    away_state: TeamState,
    home_tactic: TacticProfile,
    away_tactic: TacticProfile,
    home_str: dict,
    away_str: dict,
    ctx: MatchContext,
    on_event: Optional[Callable],
    home_name: str,
    away_name: str,
    home_id,
    away_id,
    bench_home: list,
    bench_away: list,
    phase_idx: int,
    total_phases: int,
) -> dict:
    events_batch = []

    # --- Fatigue & time mod ---
    half = 'first' if minute <= 45 else 'second'
    time_mod = 1.0
    if minute > 75:
        time_mod = 0.85
    elif minute > 60:
        time_mod = 0.92

    # Apply per-player fatigue
    for p in home_state.get_active():
        p.fatigue += (15 + p.fatigue * 0.05) * (1.0 - p.phys_stamina / 150)
        if minute > 60:
            p.fatigue += 3
        if minute > 75:
            p.fatigue += 4
    for p in away_state.get_active():
        p.fatigue += (15 + p.fatigue * 0.05) * (1.0 - p.phys_stamina / 150)
        if minute > 60:
            p.fatigue += 3
        if minute > 75:
            p.fatigue += 4

    # --- Possession ---
    total_mid = home_str['mid'] + away_str['mid']
    raw_poss = (home_str['mid'] / max(1, total_mid)) * 100 if total_mid > 0 else 50
    home_poss = max(POSSESSION_CLAMP[0], min(POSSESSION_CLAMP[1], raw_poss))
    away_poss = 100 - home_poss

    # --- Momentum decay ---
    home_state.momentum *= 0.92
    away_state.momentum *= 0.92

    # --- Game state adaptation ---
    h_atk_state = 1.0 + (0.10 if home_state.goals < away_state.goals else 0.0) + (-0.08 if home_state.goals >= away_state.goals + 2 else 0.0)
    a_atk_state = 1.0 + (0.10 if away_state.goals < home_state.goals else 0.0) + (-0.08 if away_state.goals >= home_state.goals + 2 else 0.0)
    h_def_state = 1.0 + (0.08 if home_state.goals >= away_state.goals + 2 else 0.0)
    a_def_state = 1.0 + (0.08 if away_state.goals >= home_state.goals + 2 else 0.0)

    h_entries = (home_str['mid'] * h_atk_state) / (away_str['def'] * a_def_state + 1)
    a_entries = (away_str['mid'] * a_atk_state) / (home_str['def'] * h_def_state + 1)

    home_shot_chance = (0.06 + 0.20 * h_entries) * (home_poss / 50) * (1 + home_state.momentum * 0.4) * time_mod
    away_shot_chance = (0.06 + 0.20 * a_entries) * (away_poss / 50) * (1 + away_state.momentum * 0.4) * time_mod

    def process_team(
        team_label, chance, atk_str, def_str, opp_def_str, opp_gk_str,
        state, opp_state, tactic, opp_tactic, players, opp_players,
        club_id, opp_club_id, bench
    ):
        active = state.get_active()
        if not active or len(active) < 7:
            return

        num_shots = 0
        if random.random() < chance:
            num_shots += 1
        if random.random() < chance * 0.35:
            num_shots += 1

        for _ in range(num_shots):
            state.shots += 1
            state.xg += 0.01  # add baseline per shot

            # Pick shooter weighted by position
            shooter = random.choices(active, weights=[
                1.6 if p.position.upper() == 'ATT' else 1.1 if p.position.upper() == 'MID' else 0.3
                for p in active
            ])[0]

            # Determine shot location
            if minute > 75 and random.random() < 0.2:
                zone = 'LONG_RANGE'
                shot_type = 'long_shot'
            elif random.random() < 0.15:
                zone = 'SIX_CENTRAL'
                shot_type = 'foot'
            elif random.random() < 0.30:
                zone = 'HEADER_SIX' if random.random() < 0.3 else 'BOX_CENTRAL'
                shot_type = 'header' if zone.startswith('HEADER') else 'foot'
            elif random.random() < 0.65:
                zone = 'BOX_CENTRAL' if random.random() < 0.5 else 'BOX_WIDE'
                shot_type = 'volley' if random.random() < 0.15 else 'foot'
            else:
                zone = 'EDGE'
                shot_type = 'half_volley' if random.random() < 0.2 else 'foot'

            # Pressure from defenders
            pressure = min(1.0, opp_def_str / max(1, opp_def_str + atk_str * 0.5))

            xg = calculate_xg(
                zone, shot_type,
                player_finishing=shooter.tech_finishing,
                player_composure=shooter.ment_composure,
                player_technique=shooter.tech_technique,
                player_long_shots=shooter.tech_long_shots,
                player_heading=shooter.tech_heading,
                pressure=pressure,
                gk_rating=opp_gk_str,
            )
            state.xg += xg

            result = resolve_shot(
                xg,
                player_consistency=shooter.hidden_consistency,
                player_big_match=shooter.hidden_big_match,
                is_big_game=ctx.is_derby,
            )

            outcome = result['outcome']

            if outcome == 'goal':
                state.goals += 1
                state.shots_on_target += 1
                state.momentum = min(1.0, state.momentum + 0.18)
                opp_state.momentum = max(-0.3, opp_state.momentum - 0.12)

                # Rating boost
                pass

                # Assist
                others = [p for p in active if p.id != shooter.id]
                assister = random.choices(others, weights=[1.5 if p.position.upper() == 'MID' else 1.0 if p.position.upper() == 'ATT' else 0.3 for p in others])[0] if others else None

                evt = goal_event(minute, shooter, assister, state.goals, opp_state.goals, club_id)
                events_batch.append(evt)
                if on_event:
                    on_event(evt)

            elif outcome == 'on_target':
                state.shots_on_target += 1
                evt = save_event(minute, shooter, random.choice(opp_state.get_active()) if opp_state.get_active() else shooter, club_id)
                events_batch.append(evt)
                if on_event:
                    on_event(evt)

            elif outcome == 'woodwork':
                evt = woodwork_event(minute, shooter, club_id)
                events_batch.append(evt)
                if on_event:
                    on_event(evt)

            elif outcome == 'blocked':
                evt = build_event(minute, 'BLOCK', f"Blocked! The defense throws themselves in the way of {shooter.last_name}'s shot.", club_id=club_id, player_id=shooter.id)
                events_batch.append(evt)
                if on_event:
                    on_event(evt)
            else:
                if xg > 0.10:
                    evt = big_chance_event(minute, shooter, club_id)
                    events_batch.append(evt)
                    if on_event:
                        on_event(evt)

    process_team('home', home_shot_chance, home_str['atk'], home_str['def'], away_str['def'], away_str['gk'],
                 home_state, away_state, home_tactic, away_tactic, home_state.players, away_state.players,
                 home_id, away_id, bench_home)
    process_team('away', away_shot_chance, away_str['atk'], away_str['def'], home_str['def'], home_str['gk'],
                 away_state, home_state, away_tactic, home_tactic, away_state.players, home_state.players,
                 away_id, home_id, bench_away)

    # --- Fouls & cards ---
    for team_label, state, opp_state, tactic, players, club_id in [
        ('home', home_state, away_state, home_tactic, home_state.players, home_id),
        ('away', away_state, home_state, away_tactic, away_state.players, away_id),
    ]:
        active = state.get_active()
        if not active:
            continue
        fouler = random.choice(active)

        foul_chance = 0.04 * (fouler.ment_aggression / 50) * (tactic.pressing_intensity / 50) * ctx.referee_strictness
        if random.random() < foul_chance:
            evt = build_event(minute, 'FOUL', f"Foul by {fouler.first_name} {fouler.last_name}.", club_id=club_id, player_id=fouler.id)
            events_batch.append(evt)
            if on_event:
                on_event(evt)

            # Yellow card
            yellow_chance = 0.35 * (fouler.ment_aggression / 50) * (fouler.hidden_temperament / 50) * ctx.referee_strictness
            if random.random() < yellow_chance:
                yellows = state.yellows
                yellows[fouler.id] = yellows.get(fouler.id, 0) + 1
                if yellows[fouler.id] == 2:
                    state.red_card_ids.add(fouler.id)
                    evt = red_event(minute, fouler, club_id, direct=False)
                    events_batch.append(evt)
                    if on_event:
                        on_event(evt)
                else:
                    evt = yellow_event(minute, fouler, club_id)
                    events_batch.append(evt)
                    if on_event:
                        on_event(evt)

            # Direct red
            direct_red_chance = RED_DIRECT_BASE_PER_PHASE * (fouler.ment_aggression / 50) * ctx.referee_strictness
            if random.random() < direct_red_chance:
                state.red_card_ids.add(fouler.id)
                evt = red_event(minute, fouler, club_id, direct=True)
                events_batch.append(evt)
                if on_event:
                    on_event(evt)

    # --- Injuries ---
    for team_label, state, players, club_id in [
        ('home', home_state, home_state.players, home_id),
        ('away', away_state, away_state.players, away_id),
    ]:
        active = state.get_active()
        if not active:
            continue
        if random.random() < INJURY_BASE_PER_PHASE * 1.5 if minute > 75 else INJURY_BASE_PER_PHASE:
            injured = random.choice(active)
            evt = injury_event(minute, injured, club_id)
            events_batch.append(evt)
            if on_event:
                on_event(evt)

    # --- Commentary ---
    if phase_idx % COMMENTARY_EVERY_N_PHASES == 0 or minute in (45, 90):
        desc = pick_commentary(minute) if minute not in (45, 90) else (
            f"Half-time: {home_name} {home_state.goals} - {away_state.goals} {away_name}" if minute == 45
            else f"Full-time: {home_name} {home_state.goals} - {away_state.goals} {away_name}"
        )
        evt = commentary_event(minute, desc)
        events_batch.append(evt)
        if on_event:
            on_event(evt)

    return {'events': events_batch, 'home_poss': home_poss}


def simulate_match(
    home_club,
    away_club,
    home_players: list[PlayerMatchSnapshot],
    away_players: list[PlayerMatchSnapshot],
    home_manager,
    away_manager,
    season: int,
    week: int,
    on_event: Optional[Callable] = None,
    home_form_bonus: float = 0,
    away_form_bonus: float = 0,
) -> dict:
    home_tactic = build_tactic_profile(
        getattr(home_club, 'formation', '4-4-2'),
        getattr(home_club, 'tactics', 'BALANCED'),
        home_manager,
    )
    away_tactic = build_tactic_profile(
        getattr(away_club, 'formation', '4-4-2'),
        getattr(away_club, 'tactics', 'BALANCED'),
        away_manager,
    )

    home_id = getattr(home_club, 'id', 'home')
    away_id = getattr(away_club, 'id', 'away')
    home_name = getattr(home_club, 'name', 'Home')
    away_name = getattr(away_club, 'name', 'Away')

    ctx = MatchContext(
        season=season,
        week=week,
        crowd_factor=1.0 + (getattr(home_club, 'reputation', 50) - 50) / 200,
        home_form_bonus=home_form_bonus,
        away_form_bonus=away_form_bonus,
    )

    # Bench = remaining squad players not in starting 11
    home_ids = {p.id for p in home_players}
    away_ids = {p.id for p in away_players}
    bench_home = []
    bench_away = []

    home_state = TeamState(players=list(home_players))
    away_state = TeamState(players=list(away_players))

    all_events = []
    home_poss_total = 0.0
    num_phases = 0

    # Init player ratings
    player_ratings = {}
    for p in home_players + away_players:
        rating_noise = random.uniform(-0.5, 0.5) * (1 - p.hidden_consistency / 100)
        player_ratings[p.id] = max(3.0, min(10.0, 6.0 + rating_noise))

    # --- First half phases (1-6) ---
    first_half_times = [7, 14, 21, 28, 35, 42]
    for i, minute in enumerate(first_half_times):
        home_str = _calc_team_strength(home_state, home_tactic, ctx, True)
        away_str = _calc_team_strength(away_state, away_tactic, ctx, False)

        phase_result = _simulate_phase(
            minute, home_state, away_state, home_tactic, away_tactic,
            home_str, away_str, ctx, on_event, home_name, away_name,
            home_id, away_id, bench_home, bench_away,
            i, len(first_half_times) + len(range(48, 90, 7)),
        )

        home_poss_total += phase_result['home_poss']
        num_phases += 1
        all_events.extend(phase_result['events'])

    # Half-time event
    ht_evt = halftime_event(45, home_name, away_name, home_state.goals, away_state.goals)
    all_events.append(ht_evt)
    if on_event:
        on_event(ht_evt)

    # Fatigue recovery at half-time
    for p in home_state.get_active():
        p.fatigue = max(0, p.fatigue - 8)
    for p in away_state.get_active():
        p.fatigue = max(0, p.fatigue - 8)

    # --- Second half phases (48'-85') ---
    second_half_times = list(range(48, 86, 7))
    for i, minute in enumerate(second_half_times):
        home_str = _calc_team_strength(home_state, home_tactic, ctx, True)
        away_str = _calc_team_strength(away_state, away_tactic, ctx, False)

        # Substitution logic
        if minute >= 55 and minute <= 85:
            score_diff = home_state.goals - away_state.goals
            off, onn = pick_substitution(home_state.get_active(), bench_home, minute, True, score_diff)
            if off and onn:
                home_state.players = [p for p in home_state.players if p.id != off.id] + [onn]
                home_state.subs_made += 1
                bench_home = [b for b in bench_home if b.id != onn.id]
                evt = substitution_event(minute, onn, off, home_id, home_name)
                all_events.append(evt)
                if on_event:
                    on_event(evt)

            off, onn = pick_substitution(away_state.get_active(), bench_away, minute, False, -score_diff)
            if off and onn:
                away_state.players = [p for p in away_state.players if p.id != off.id] + [onn]
                away_state.subs_made += 1
                bench_away = [b for b in bench_away if b.id != onn.id]
                evt = substitution_event(minute, onn, off, away_id, away_name)
                all_events.append(evt)
                if on_event:
                    on_event(evt)

        phase_result = _simulate_phase(
            minute, home_state, away_state, home_tactic, away_tactic,
            home_str, away_str, ctx, on_event, home_name, away_name,
            home_id, away_id, bench_home, bench_away,
            len(first_half_times) + i, len(first_half_times) + len(second_half_times),
        )

        home_poss_total += phase_result['home_poss']
        num_phases += 1
        all_events.extend(phase_result['events'])

    # --- Stoppage time (2-6 phases) ---
    stoppage = STOPPAGE_MIN + random.randint(0, STOPPAGE_MAX - STOPPAGE_MIN)
    for stoppage_minute in range(90, 90 + stoppage):
        if stoppage_minute > 90 + 5:
            break
        home_str = _calc_team_strength(home_state, home_tactic, ctx, True)
        away_str = _calc_team_strength(away_state, away_tactic, ctx, False)

        phase_result = _simulate_phase(
            stoppage_minute, home_state, away_state, home_tactic, away_tactic,
            home_str, away_str, ctx, on_event, home_name, away_name,
            home_id, away_id, bench_home, bench_away,
            0, 1,
        )
        home_poss_total += phase_result['home_poss']
        num_phases += 1
        all_events.extend(phase_result['events'])

    # Final possession
    final_home_poss = round(home_poss_total / max(1, num_phases), 1)
    final_away_poss = round(100 - final_home_poss, 1)

    # Final player ratings
    for p in home_players + away_players:
        did_play = p.id in player_ratings
        if did_play:
            # Boost for goal scorers / assisters
            for evt in all_events:
                if evt['type'] in ('GOAL',) and evt.get('player_id') == p.id:
                    player_ratings[p.id] = min(10.0, player_ratings[p.id] + 0.5)
                if evt['type'] in ('GOAL',) and evt.get('assister_id') == p.id:
                    player_ratings[p.id] = min(10.0, player_ratings[p.id] + 0.3)
            noise_range = 0.3 * (1 - p.hidden_consistency / 100)
            player_ratings[p.id] += random.uniform(-noise_range, noise_range)
            player_ratings[p.id] = round(max(3.0, min(10.0, player_ratings[p.id])), 1)

    # Full-time event
    ft_evt = fulltime_event(90 + stoppage, home_name, away_name, home_state.goals, away_state.goals)
    all_events.append(ft_evt)
    if on_event:
        on_event(ft_evt)

    return {
        'home_score': home_state.goals,
        'away_score': away_state.goals,
        'home_xg': round(home_state.xg, 2),
        'away_xg': round(away_state.xg, 2),
        'home_possession': final_home_poss,
        'away_possession': final_away_poss,
        'home_shots': home_state.shots,
        'away_shots': away_state.shots,
        'home_shots_on_target': home_state.shots_on_target,
        'away_shots_on_target': away_state.shots_on_target,
        'events': all_events,
        'player_ratings': player_ratings,
    }
