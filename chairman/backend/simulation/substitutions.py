from typing import Optional
from .models import PlayerMatchSnapshot


def pick_substitution(players_on_pitch, bench_players, minute, is_home, score_diff, fatigue_threshold=60.0):
    """Decide if and who to substitute based on fatigue and match state."""
    # Don't sub too early or beyond 85th minute
    if minute < 55 or minute > 85:
        return None, None

    if not bench_players:
        return None, None

    # Find most tired player on pitch
    tired = [p for p in players_on_pitch if p.fatigue > fatigue_threshold]
    if not tired:
        # If losing after 70 mins, make attacking sub
        if minute >= 70 and score_diff < 0:
            tired = [p for p in players_on_pitch if p.position in ('MID', 'ATT')]
            if tired:
                tired.sort(key=lambda p: p.fatigue, reverse=True)
                # Pick an attacker to replace a midfielder/defender
                off = tired[0]
                candidates = [b for b in bench_players if b.position in ('MID', 'ATT')]
                if candidates:
                    candidates.sort(key=lambda b: b.overall_rating, reverse=True)
                    return off, candidates[0]
        return None, None

    tired.sort(key=lambda p: p.fatigue, reverse=True)
    player_off = tired[0]

    # Find best replacement by position
    pos = player_off.position
    candidates = [b for b in bench_players if b.position == pos]
    if not candidates:
        # Flexible: pick best available that fits somewhere
        candidates = bench_players

    candidates.sort(key=lambda b: b.overall_rating, reverse=True)
    player_on = candidates[0]

    return player_off, player_on
