import random
from django.db.models import Q
from game.models import ScoutAssignment, ScoutReport, Player, NewsStory, Club

REGION_NATIONALITIES = {
    'Europe': ['English', 'French', 'Spanish', 'German', 'Scandinavian'],
    'South America': ['Brazilian'],
    'Africa': ['African'],
    'Asia': ['Asian'],
    'North America': ['North American']
}

def process_week(week: int, season: int) -> int:
    """
    Weekly scouting tick: progress scouting assignments and discover players.
    """
    assignments = ScoutAssignment.objects.select_related('scout', 'club').all()
    players_discovered_total = 0

    for assignment in assignments:
        scout = assignment.scout
        if not scout:
            continue

        # 2. progress_gain = (scout.rating / 100) * 15
        progress_gain = (scout.rating / 100.0) * 15.0
        assignment.progress = min(100.0, float(assignment.progress) + progress_gain)

        # 4. If progress >= 100 and len(players_found) < 5
        # (We count existing reports for this assignment)
        current_reports_count = assignment.reports.count()

        if assignment.progress >= 100 and current_reports_count < 5:
            discovered_count = _discover_players(assignment, week, season)
            players_discovered_total += discovered_count

            # g. Create NewsStory
            NewsStory.objects.create(
                title="Scouting Update",
                content=f"{scout.name} has identified {discovered_count} potential targets in {assignment.region}.",
                category='WORLD', # Or another appropriate category
                club=assignment.club,
                week=week,
                season=season
            )

            # h. Reset progress to 0 for next cycle
            assignment.progress = 0.0

        assignment.save()

    return players_discovered_total

def _discover_players(assignment: ScoutAssignment, week: int, season: int) -> int:
    """
    Finds and creates reports for 1-3 random players in the assignment's region.
    """
    scout = assignment.scout
    user_club = assignment.club
    region = assignment.region

    nationalities = REGION_NATIONALITIES.get(region, [])
    if not nationalities:
        return 0

    # a, b, c. Find players in region, not already found, and in league tier >= 2
    already_found_ids = assignment.reports.values_list('player_id', flat=True)

    potential_players = Player.objects.filter(
        nationality__in=nationalities,
        club__league__tier__gte=2
    ).exclude(
        id__in=already_found_ids
    )

    if not potential_players.exists():
        return 0

    # d. Select 1-3 random players weighted by (player.overall_rating - user_club.reputation/2)
    num_to_discover = random.randint(1, 3)
    # Clamp the number to discover if near the limit of 5
    num_to_discover = min(num_to_discover, 5 - len(already_found_ids))

    # Get a decent pool of candidates to weight
    candidates = list(potential_players.order_by('?')[:50])

    def get_weight(p):
        # Weighting: higher rating relative to club level is better
        # Add 50 to avoid negative weights if reputation is high
        return max(1, (p.overall_rating - (user_club.reputation / 2.0)) + 50)

    weights = [get_weight(p) for p in candidates]

    selected_players = []
    pool = list(candidates)
    for _ in range(min(num_to_discover, len(pool))):
        if not pool:
            break
        idx = random.choices(range(len(pool)), weights=[get_weight(p) for p in pool], k=1)[0]
        selected_players.append(pool.pop(idx))

    for player in selected_players:
        # e. Create "scout report" with slightly obscured rating:
        # reported_rating = actual_rating + random.randint(-8, 8) * (1 - scout.rating/100)
        error_margin = random.randint(-8, 8) * (1.0 - (scout.rating / 100.0))
        reported_rating = round(player.overall_rating + error_margin, 1)

        ScoutReport.objects.create(
            assignment=assignment,
            player=player,
            reported_rating=reported_rating,
            created_week=week,
            created_season=season
        )

    return len(selected_players)
