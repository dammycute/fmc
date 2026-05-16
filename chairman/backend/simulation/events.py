import random


EVENT_GOAL = 'GOAL'
EVENT_BIG_CHANCE = 'BIG_CHANCE'
EVENT_SAVE = 'SAVE'
EVENT_WOODWORK = 'WOODWORK'
EVENT_OFF_TARGET = 'OFF_TARGET'
EVENT_BLOCK = 'BLOCK'
EVENT_SUBSTITUTION = 'SUBSTITUTION'
EVENT_PENALTY_AWARDED = 'PENALTY_AWARDED'
EVENT_PENALTY_MISSED = 'PENALTY_MISSED'
EVENT_FOUL = 'FOUL'
EVENT_YELLOW = 'YELLOW'
EVENT_RED = 'RED'
EVENT_INJURY = 'INJURY'
EVENT_OFFSIDE = 'OFFSIDE'
EVENT_CORNER = 'CORNER'
EVENT_FREE_KICK = 'FREE_KICK'
EVENT_HALFTIME = 'HALFTIME'
EVENT_FULLTIME = 'FULLTIME'
EVENT_COMMENTARY = 'COMMENTARY'
EVENT_MOMENTUM_SHIFT = 'MOMENTUM_SHIFT'
EVENT_TACTICAL_CHANGE = 'TACTICAL_CHANGE'


def build_event(minute, event_type, description, club_id=None, player_id=None, **extra):
    event = {
        'minute': minute,
        'type': event_type,
        'description': description,
        'club_id': club_id,
        'player_id': player_id,
    }
    event.update(extra)
    return event


def goal_event(minute, shooter, assister, home_score, away_score, club_id, shot_detail=''):
    name = f"{shooter.first_name} {shooter.last_name}"
    assist_text = f" Assisted by {assister.first_name} {assister.last_name}." if assister else ""
    desc = f"GOAL! {name} scores!{assist_text} {shot_detail}"
    return build_event(minute, EVENT_GOAL, desc.strip(), club_id=club_id, player_id=shooter.id,
                       assister_id=assister.id if assister else None,
                       home_score=home_score, away_score=away_score,
                       shot_xg=shot_detail)


def save_event(minute, shooter, gk, club_id):
    desc = f"SAVE! {gk.first_name} {gk.last_name} denies {shooter.first_name} {shooter.last_name}!"
    return build_event(minute, EVENT_SAVE, desc, club_id=club_id, player_id=gk.id, shooter_id=shooter.id)


def woodwork_event(minute, shooter, club_id):
    desc = f"OFF THE {random.choice(['BAR', 'POST'])}! {shooter.first_name} {shooter.last_name} is denied by the woodwork!"
    return build_event(minute, EVENT_WOODWORK, desc, club_id=club_id, player_id=shooter.id)


def big_chance_event(minute, shooter, club_id):
    desc = f"BIG CHANCE! {shooter.first_name} {shooter.last_name} should have done better there!"
    return build_event(minute, EVENT_BIG_CHANCE, desc, club_id=club_id, player_id=shooter.id)


def substitution_event(minute, player_on, player_off, club_id, club_name):
    desc = f"Substitution for {club_name}: {player_on.first_name} {player_on.last_name} replaces {player_off.first_name} {player_off.last_name}."
    return build_event(minute, EVENT_SUBSTITUTION, desc, club_id=club_id,
                       player_id=player_on.id, sub_on_id=player_on.id, sub_off_id=player_off.id)


def yellow_event(minute, player, club_id):
    desc = f"Yellow card for {player.first_name} {player.last_name}."
    return build_event(minute, EVENT_YELLOW, desc, club_id=club_id, player_id=player.id)


def red_event(minute, player, club_id, direct=False):
    prefix = "DIRECT RED CARD" if direct else "SECOND YELLOW"
    desc = f"{prefix}! {player.first_name} {player.last_name} is sent off!"
    return build_event(minute, EVENT_RED, desc, club_id=club_id, player_id=player.id)


def injury_event(minute, player, club_id):
    desc = f"Injury concern: {player.first_name} {player.last_name} is down receiving treatment."
    return build_event(minute, EVENT_INJURY, desc, club_id=club_id, player_id=player.id)


def penalty_awarded(minute, fouler, club_id, attacking_club_id):
    desc = f"PENALTY! {fouler.first_name} {fouler.last_name} with a reckless challenge!"
    return build_event(minute, EVENT_PENALTY_AWARDED, desc, club_id=club_id, player_id=fouler.id,
                       attacking_club_id=attacking_club_id)


def momentum_event(minute, description):
    return build_event(minute, EVENT_MOMENTUM_SHIFT, description)


def commentary_event(minute, description):
    return build_event(minute, EVENT_COMMENTARY, description)


def halftime_event(minute, home_name, away_name, home_score, away_score):
    desc = f"Half-time: {home_name} {home_score} - {away_score} {away_name}"
    return build_event(minute, EVENT_HALFTIME, desc, home_score=home_score, away_score=away_score)


def fulltime_event(minute, home_name, away_name, home_score, away_score):
    desc = f"Full-time: {home_name} {home_score} - {away_score} {away_name}"
    return build_event(minute, EVENT_FULLTIME, desc, home_score=home_score, away_score=away_score)


EARLY_POOL = [
    "Early pressure from the home side, looking to set the tempo.",
    "A fast start here as both teams fly into challenges.",
    "Tentative opening minutes as the teams size each other up.",
    "The home fans are in full voice in these early stages.",
    "Early tactical battle, managers already making adjustments.",
]
GENERAL_POOL = [
    "Battle in midfield as both teams fight for control.",
    "The game is finely balanced at the moment.",
    "Both teams enjoying spells of possession.",
    "A tactical battle unfolding here.",
    "The referee letting the game flow.",
    "Midfield battle intensifying as both sides look to gain control.",
]
LATE_POOL = [
    "Entering the final stages, nerves are starting to show.",
    "The players are looking tired, fatigue could be a factor.",
    "One last push from the visitors, throwing men forward.",
    "Desperate defending as the home side clings on.",
    "The clock is ticking down, tension rising in the stadium.",
]


def pick_commentary(minute):
    if minute <= 15:
        return random.choice(EARLY_POOL + GENERAL_POOL)
    elif minute >= 75:
        return random.choice(LATE_POOL + GENERAL_POOL)
    else:
        return random.choice(GENERAL_POOL)
