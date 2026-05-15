import random
from django.db import transaction
from django.db.models import Q, F, Case, When
from game.models import (
    GameState, Match, Player, Club, Manager, Staff,
    NewsStory, TransferRequest, League, PlayerSeasonStats
)
from asgiref.sync import async_to_sync
from .match_engine import simulate_match, PlayerSnapshot
from .broadcaster import broadcast_match_event
from .development_engine import develop_player
from .transfer_engine import process_week as process_transfers
from .finance_engine import process_week as process_finances
from .scouting_engine import process_week as process_scouting
from .fixture_generator import generate_fixtures

def advance_week() -> dict:
    with transaction.atomic():
        state = GameState.objects.select_for_update().get(pk=1)
        week = state.current_week
        season = state.current_season
        summary = {"week": week, "season": season, "matches": [], "news": [], "user_match": None}

        # ── STEP 1: SIMULATE ALL MATCHES ───────────────────
        matches = list(Match.objects.filter(week=week, season=season, played=False).select_related('home_club', 'away_club'))

        # Pre-fetch all matches and participants to optimize queries
        match_club_ids = [m.home_club_id for m in matches] + [m.away_club_id for m in matches]
        involved_players = Player.objects.filter(club_id__in=match_club_ids)
        players_by_club = {}
        for p in involved_players:
            cid = str(p.club_id) if p.club_id else 'none'
            if cid not in players_by_club:
                players_by_club[cid] = []
            players_by_club[cid].append(p)

        played_this_week_stats = {} # player_id -> {won, drawn, lost, rating}

        for m in matches:
            hc_id = str(m.home_club_id)
            ac_id = str(m.away_club_id)
            home_players = players_by_club.get(hc_id, [])
            away_players = players_by_club.get(ac_id, [])

            def make_snapshot(p):
                return PlayerSnapshot(
                    id=str(p.id), first_name=p.first_name, last_name=p.last_name,
                    position=p.position, overall_rating=p.overall_rating,
                    tech_shooting=p.tech_shooting, tech_finishing=p.tech_finishing,
                    tech_passing=p.tech_passing, tech_vision=p.tech_vision,
                    tech_tackling=p.tech_tackling, tech_positioning=p.tech_positioning,
                    tech_reflexes=p.tech_reflexes, tech_handling=p.tech_handling,
                    phys_pace=p.phys_pace, phys_strength=p.phys_strength,
                    phys_stamina=p.phys_stamina, phys_agility=p.phys_agility,
                    phys_acceleration=p.phys_acceleration, ment_leadership=p.ment_leadership,
                    ment_composure=p.ment_composure, ment_work_rate=p.ment_work_rate,
                    ment_decisions=p.ment_decisions, ment_determination=p.ment_determination,
                    ment_aggression=p.ment_aggression, hidden_consistency=p.hidden_consistency,
                    hidden_big_match=p.hidden_big_match, hidden_temperament=p.hidden_temperament,
                    hidden_injury_proneness=p.hidden_injury_proneness, morale=p.morale, fatigue=p.fatigue
                )

            h_snaps = [make_snapshot(p) for p in home_players]
            a_snaps = [make_snapshot(p) for p in away_players]

            def on_match_event(event):
                if m.home_club_id == state.user_club_id or m.away_club_id == state.user_club_id:
                    async_to_sync(broadcast_match_event)(event)

            res = simulate_match(
                m.home_club, m.away_club, h_snaps, a_snaps,
                getattr(m.home_club, 'manager', None), getattr(m.away_club, 'manager', None),
                season, week,
                on_event=on_match_event
            )

            # Write results back
            m.home_score = res['home_score']
            m.away_score = res['away_score']
            m.home_xg = res['home_xg']
            m.away_xg = res['away_xg']
            m.home_possession = res['home_possession']
            m.away_possession = res['away_possession']
            m.home_shots = res['home_shots']
            m.away_shots = res['away_shots']
            m.home_shots_on_target = res['home_shots_on_target']
            m.away_shots_on_target = res['away_shots_on_target']
            m.events = res['events']
            m.player_ratings = res['player_ratings']
            m.played = True
            m.save()

            # Track players
            is_draw = m.home_score == m.away_score
            for pid_str, rating in res['player_ratings'].items():
                pid = int(pid_str)
                is_home = any(p.id == pid for p in home_players)
                won = (is_home and m.home_score > m.away_score) or (not is_home and m.away_score > m.home_score)
                lost = (is_home and m.home_score < m.away_score) or (not is_home and m.away_score < m.home_score)
                played_this_week_stats[pid] = {'won': won, 'drawn': is_draw, 'lost': lost, 'rating': rating}

            if m.home_club_id == state.user_club_id or m.away_club_id == state.user_club_id:
                summary['user_match'] = res

            summary['matches'].append({
                "home": m.home_club.name, "away": m.away_club.name,
                "score": f"{m.home_score}-{m.away_score}"
            })

            # Update player stats (goals and assists)
            for event in res['events']:
                if event['type'] == 'GOAL':
                    Player.objects.filter(id=event['player_id']).update(goals=F('goals') + 1)
                    if event.get('assister_id'):
                        Player.objects.filter(id=event['assister_id']).update(assists=F('assists') + 1)

        # ── STEP 2: POST-MATCH PLAYER UPDATES ────────────────
        # Players who did NOT play: batch update recovery
        Player.objects.exclude(id__in=played_this_week_stats.keys()).update(
            fatigue=Case(
                When(fatigue__gte=10, then=F('fatigue') - 10),
                default=0.0
            ),
            morale=Case(
                When(morale__gt=31, then=F('morale') - 1),
                default=30.0
            ),
            happiness_playing_time=Case(
                When(club__isnull=False, happiness_playing_time__gte=2, then=F('happiness_playing_time') - 2),
                When(club__isnull=False, then=0),
                default=F('happiness_playing_time')
            )
        )

        # Players who played: individual updates (due to unique match stats)
        players_who_played = Player.objects.filter(id__in=played_this_week_stats.keys())
        for p in players_who_played:
            stats = played_this_week_stats[p.id]
            p.appearances += 1
            p.form = (p.form + [stats['rating']])[-5:]
            p.fatigue += 12
            p.tactical_familiarity = min(100.0, float(p.tactical_familiarity) + 0.3)

            if stats['won']: p.morale = min(100.0, float(p.morale) + 8)
            elif stats['drawn']: p.morale = min(100.0, float(p.morale) + 2)
            else: p.morale = max(0.0, float(p.morale) - 6)

            p.happiness_playing_time = min(100, p.happiness_playing_time + 2)

            # All players: if avg of last 3 form < 6.0, happiness_manager -= 5
            if len(p.form) >= 3:
                avg_form = sum(p.form[-3:]) / 3
                if avg_form < 6.0:
                    p.happiness_manager = max(0, p.happiness_manager - 5)

            p.save(update_fields=[
                'appearances', 'form', 'fatigue', 'tactical_familiarity',
                'morale', 'happiness_playing_time', 'happiness_manager'
            ])

        # ── STEP 3: INJURY PROCESSING ──────────────────────
        # Fetch all players again to include recovery updates
        all_players = Player.objects.all()

        # Fetch physios by club
        physios_by_club = {s.club_id: s for s in Staff.objects.filter(role='PHYSIO')}

        for p in all_players:
            if p.is_injured:
                p.injury_weeks_remaining -= 1
                if p.injury_weeks_remaining <= 0:
                    p.is_injured = False
                    p.fitness = 60.0
                p.save(update_fields=['injury_weeks_remaining', 'is_injured', 'fitness'])
            elif p.id in played_this_week_stats:
                chance = 0.015 * (p.hidden_injury_proneness / 50) * (1 + p.fatigue / 200)
                physio = physios_by_club.get(p.club_id)
                if physio:
                    chance *= (1 - physio.rating / 200)

                if random.random() < chance:
                    p.is_injured = True
                    p.injury_weeks_remaining = random.randint(1, 6)
                    p.fitness = 0.0
                    p.save(update_fields=['is_injured', 'injury_weeks_remaining', 'fitness'])
                    importance = 'HIGH' if p.overall_rating > 80 else 'MEDIUM' if p.overall_rating > 70 else 'LOW'
                    NewsStory.objects.create(
                        title=f"Injury blow for {p.last_name}",
                        content=f"{p.first_name} {p.last_name} is out for {p.injury_weeks_remaining} weeks.",
                        category='INJURY', importance=importance, club=p.club,
                        week=week, season=season
                    )

        # ── STEP 4: PLAYER DEVELOPMENT ─────────────────────
        clubs_by_id = {c.id: c for c in Club.objects.all().select_related('facilities')}
        for p in all_players:
            club = clubs_by_id.get(p.club_id)
            develop_player(p, club)

        # ── STEP 4b: CONTRACT MANAGEMENT ───────────────────
        # Problem 1: Contract expiry is never processed.
        # Decrement manager contract weeks
        Manager.objects.filter(club__isnull=False, contract_weeks_remaining__gt=0).update(
            contract_weeks_remaining=F('contract_weeks_remaining') - 1
        )
        # Release managers whose contracts have expired
        expired_managers = Manager.objects.filter(contract_weeks_remaining__lte=0, club__isnull=False)
        for manager in expired_managers:
            club = manager.club
            manager.club = None
            manager.save()
            NewsStory.objects.create(
                title=f"Contract expired: {manager.name} leaves {club.name}",
                content=f"{manager.name}'s contract at {club.name} has expired.",
                category='CLUB', importance='MEDIUM', club=club, week=week, season=season
            )

        # ── STEP 5: AI MANAGER DECISIONS ───────────────────
        for club in Club.objects.filter(is_user_controlled=False).select_related('manager'):
            manager = getattr(club, 'manager', None)
            if not manager: continue

            # Squad depth check
            for pos, min_count in {'GK': 2, 'DEF': 5, 'MID': 5, 'ATT': 3}.items():
                count = Player.objects.filter(club=club, position=pos).count()
                if count < min_count:
                    if not TransferRequest.objects.filter(club=club, suggested_position=pos, status='PENDING').exists():
                        TransferRequest.objects.create(
                            manager=manager, club=club, request_type='DEPTH',
                            priority='MEDIUM', message=f"Need {pos} depth.",
                            suggested_position=pos, week_requested=week, season_requested=season
                        )

            # Manager morale check
            if manager.morale < 25 and not manager.wants_to_leave:
                manager.wants_to_leave = True
                manager.save()
                NewsStory.objects.create(
                    title=f"Manager unrest at {club.name}",
                    content=f"{manager.name} considering future.",
                    category='CLUB', club=club, week=week, season=season
                )

        # ── STEP 6 & 7: TRANSFERS & FINANCES ───────────────
        process_transfers(week, season)
        process_finances(week, season)
        process_scouting(week, season)

        # ── STEP 8: BOARD & FAN CONFIDENCE ─────────────────
        for club in Club.objects.all():
            last_5 = Match.objects.filter(Q(home_club=club) | Q(away_club=club), played=True).order_by('-season', '-week')[:5]
            score = 0
            for m in last_5:
                is_home = m.home_club_id == club.id
                if m.home_score == m.away_score:
                    score += 1
                elif (is_home and m.home_score > m.away_score) or (not is_home and m.away_score > m.home_score):
                    score += 3

            # Problem 3: Board confidence delta is unbounded. Clamp to [-5, 5].
            delta = max(-5, min(5, (score - 7.5) * 2))
            if club.balance < 0:
                delta -= 5

            club.board_confidence = max(0, min(100, int(club.board_confidence + delta)))
            club.fan_confidence = max(0, min(100, int(club.fan_confidence + delta * 1.5)))
            club.save()

        # ── STEP 9: MANAGER-CHAIRMAN RELATIONSHIP ──────────
        for manager in Manager.objects.filter(club__isnull=False).select_related('club'):
            last_3 = Match.objects.filter(Q(home_club=manager.club) | Q(away_club=manager.club), played=True).order_by('-season', '-week')[:3]
            delta = 0
            for m in last_3:
                is_home = m.home_club_id == manager.club_id
                if m.home_score == m.away_score:
                    delta += 1
                elif (is_home and m.home_score > m.away_score) or (not is_home and m.away_score > m.home_score):
                    delta += 4
                else:
                    delta -= 6

            if manager.club.balance < 0:
                delta -= 3

            manager.relationship_with_chairman = max(0.0, min(100.0, float(manager.relationship_with_chairman) + delta))
            if manager.relationship_with_chairman < 15 and not manager.wants_to_leave:
                manager.wants_to_leave = True
                NewsStory.objects.create(
                    title=f"Chairman loses patience",
                    content=f"{manager.name} on verge of sack.",
                    category='CLUB', importance='BREAKING', club=manager.club, week=week, season=season
                )
            manager.save()

        # ── STEP 10: ADVANCE TIME ──────────────────────────
        state.current_week += 1
        if state.current_week > 38:
            handle_season_end(state, season)
        else:
            state.is_transfer_window_open = (state.current_week <= 6 or state.current_week >= 33)
        state.save()

    return summary

def handle_season_end(state, season):
    # Problem 4: Idempotent fixture generation. Delete existing matches for next season.
    Match.objects.filter(season=season + 1).delete()

    leagues = League.objects.all().order_by('tier')
    tables = {}
    for league in leagues:
        results = []
        for c in Club.objects.filter(league=league):
            pts = 0
            for m in Match.objects.filter(Q(home_club=c) | Q(away_club=c), season=season, played=True):
                is_home = m.home_club_id == c.id
                if m.home_score == m.away_score:
                    pts += 1
                elif (is_home and m.home_score > m.away_score) or (not is_home and m.away_score > m.home_score):
                    pts += 3
            results.append((c, pts))
        results.sort(key=lambda x: x[1], reverse=True)
        tables[league.id] = results

        # Champion prize
        champion = results[0][0]
        champion.balance += league.prize_money_champion
        champion.save()

    # Persistence: Save season stats for all players before resetting counters
    for p in Player.objects.all():
        avg_r = sum(p.form) / len(p.form) if p.form else 0.0
        PlayerSeasonStats.objects.create(
            player=p,
            season=season,
            appearances=p.appearances,
            goals=p.goals,
            assists=p.assists,
            average_rating=round(avg_r, 2)
        )

    # Promotion / Relegation
    for league in leagues:
        res = tables[league.id]
        if league.tier > 1:
            nxt = League.objects.get(tier=league.tier - 1)
            for c, _ in res[:league.promotion_spots]:
                c.league = nxt
                c.save()
        if league.tier < 5:
            prv = League.objects.get(tier=league.tier + 1)
            for c, _ in res[-league.relegation_spots:]:
                c.league = prv
                c.balance += league.prize_money_relegated
                c.save()

    # Player aging and reset season counters
    Player.objects.all().update(
        age=F('age') + 1,
        contract_years=F('contract_years') - 1,
        appearances=0,
        goals=0,
        assists=0,
        form=[]
    )

    state.current_week = 1
    state.current_season = season + 1
    state.save()

    generate_fixtures(state.current_season)
    NewsStory.objects.create(
        title=f"Season {season} concludes!",
        content="New fixtures released.",
        category='WORLD', week=1, season=state.current_season
    )
