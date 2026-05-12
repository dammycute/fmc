from game.models import League, Club, Match

def generate_fixtures(season: int) -> int:
    leagues = League.objects.all()
    fixtures_created = 0

    for league in leagues:
        club_ids = list(Club.objects.filter(league=league).values_list('id', flat=True))
        if len(club_ids) < 2:
            continue

        # Ensure even number of clubs
        if len(club_ids) % 2 != 0:
            club_ids.append('BYE')

        num_clubs = len(club_ids)
        rounds = (num_clubs - 1) * 2 # Home and Away
        matches_per_round = num_clubs // 2

        for round_idx in range(rounds):
            week_num = round_idx + 1
            if week_num > 38:
                break

            for i in range(matches_per_round):
                home_idx = i
                away_idx = num_clubs - 1 - i

                home_id = club_ids[home_idx]
                away_id = club_ids[away_idx]

                if home_id == 'BYE' or away_id == 'BYE':
                    continue

                # Alternate home/away based on round % 2
                final_home_id = home_id if round_idx % 2 == 0 else away_id
                final_away_id = away_id if round_idx % 2 == 0 else home_id

                Match.objects.create(
                    league=league,
                    home_club_id=final_home_id,
                    away_club_id=final_away_id,
                    season=season,
                    week=week_num,
                    played=False,
                    home_score=0,
                    away_score=0,
                    events=[],
                    player_ratings={}
                )
                fixtures_created += 1

            # Rotate clubs for Round Robin (fixed the first element, rotate others)
            last = club_ids.pop()
            club_ids.insert(1, last)

    return fixtures_created
