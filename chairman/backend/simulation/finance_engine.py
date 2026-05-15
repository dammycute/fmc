from game.models import Club, Match, NewsStory, Sponsor, Player, Manager
from django.db.models import Q, Prefetch, F

def process_week(week: int, season: int) -> None:
    """
    Processes weekly finances for all clubs.
    """
    # Problem 1: Recalculate weekly wages for user-controlled clubs to ensure accuracy after transfers.
    # Done only for user clubs to avoid N+1 performance issues on all 100+ clubs.
    user_controlled_clubs = Club.objects.filter(is_user_controlled=True)
    for club in user_controlled_clubs:
        wages = club.players.values_list('wage', flat=True)
        club.weekly_wages = sum(wages)
        club.save(update_fields=['weekly_wages'])

    # Pre-fetch all home matches played this week to avoid N+1
    home_matches = {
        m.home_club_id: m
        for m in Match.objects.filter(week=week, season=season, played=True)
    }

    # Problem 4: Pre-fetch last 5 home matches for all clubs to avoid N+1 in the loop
    # We only care about clubs playing at home this week.
    recent_home_matches_lookup = {}
    if home_matches:
        relevant_club_ids = list(home_matches.keys())
        # Fetch up to 5 previous home matches for each club playing at home this week
        # This is still a bit tricky with SQL, so we'll fetch them and group in Python.
        # To keep it efficient, we limit the search space.
        all_recent_home = Match.objects.filter(
            home_club_id__in=relevant_club_ids,
            played=True
        ).exclude(
            week=week, season=season
        ).order_by('home_club_id', '-season', '-week')

        for m in all_recent_home:
            if m.home_club_id not in recent_home_matches_lookup:
                recent_home_matches_lookup[m.home_club_id] = []
            if len(recent_home_matches_lookup[m.home_club_id]) < 5:
                recent_home_matches_lookup[m.home_club_id].append(m)

    # Fetch clubs with necessary relations
    clubs = Club.objects.select_related(
        'league',
        'facilities',
        'manager'
    ).prefetch_related(
        Prefetch('sponsors', queryset=Sponsor.objects.filter(status='ACTIVE'))
    ).all()

    sponsors_to_update = []

    for club in clubs:
        league_tier = club.league.tier

        # ── INCOME ──────────────────────────────────────────

        # 1. TV Rights
        tv_rights_map = {1: 240000, 2: 120000, 3: 75000, 4: 40000, 5: 15000}
        tv_income = tv_rights_map.get(league_tier, 0)

        # 2. Matchday
        matchday_income = 0
        if club.id in home_matches:
            ticket_prices = {1: 60, 2: 40, 3: 25, 4: 15, 5: 8}
            price = ticket_prices.get(league_tier, 0)

            # Problem 4: Dynamic Matchday Income (Form Bonus)
            form_bonus = 0
            last_home_matches = recent_home_matches_lookup.get(club.id, [])

            for m in last_home_matches:
                if m.home_score > m.away_score:
                    form_bonus += 0.02

            attendance_pct = min(1.0, 0.6 + (club.reputation / 200) + form_bonus)
            capacity = club.facilities.stadium_capacity if hasattr(club, 'facilities') else 0
            matchday_income = int(capacity * attendance_pct * price)

        # 3. Sponsorship
        sponsor_income = sum(s.amount // 38 for s in club.sponsors.all())

        # 4. Merchandise
        merchandise_income = int(club.reputation * 300 + (6 - league_tier) * 200)

        # Problem 2: Weekly Prize Money (paid in installments for tiers 1-3)
        weekly_prize_money = 0
        if league_tier <= 3:
            weekly_prize_money = club.league.prize_money_champion // 38

        total_income = tv_income + matchday_income + sponsor_income + merchandise_income + weekly_prize_money

        # Problem 3: Sponsor Expiry (decrement duration at end of season)
        if week == 38:
            for sponsor in club.sponsors.all():
                sponsor.duration_seasons -= 1
                if sponsor.duration_seasons <= 0:
                    sponsor.status = 'EXPIRED'
                sponsors_to_update.append(sponsor)

        # ── EXPENSES ────────────────────────────────────────

        # Player and Staff wages
        player_wages = club.weekly_wages
        staff_wages = club.weekly_staff_wages

        # Manager salary
        manager_salary = 0
        if hasattr(club, 'manager') and club.manager:
            manager_salary = club.manager.salary
            # Implement Manager Economy: Increment personal balance
            Manager.objects.filter(id=club.manager.id).update(
                personal_balance=F('personal_balance') + manager_salary
            )

        # Maintenance
        maintenance_map = {1: 50000, 2: 25000, 3: 10000, 4: 5000, 5: 2000}
        maintenance = maintenance_map.get(league_tier, 0)

        total_expenses = player_wages + staff_wages + manager_salary + maintenance

        # ── UPDATE BALANCE ──────────────────────────────────

        club.balance += (total_income - total_expenses)
        club.save(update_fields=['balance'])

        # ── CRISIS HANDLING ─────────────────────────────────

        if club.balance < 0:
            if club.is_user_controlled:
                # User-controlled crisis
                NewsStory.objects.get_or_create(
                    club=club,
                    week=week,
                    season=season,
                    category='FINANCE',
                    importance='BREAKING',
                    defaults={
                        'title': "Financial Crisis!",
                        'content': f"The balance of {club.name} has fallen into the negative (£{club.balance:,}). Immediate financial measures are required to stabilize the club."
                    }
                )
            else:
                # AI-controlled crisis: List highest-rated non-GK player
                target_player = Player.objects.filter(
                    club=club,
                    is_transfer_listed=False
                ).exclude(
                    position='GK'
                ).order_by('-overall_rating').first()

                if target_player:
                    target_player.is_transfer_listed = True
                    target_player.save(update_fields=['is_transfer_listed'])

    # Problem 3: Bulk update sponsors that were modified
    if sponsors_to_update:
        Sponsor.objects.bulk_update(sponsors_to_update, ['duration_seasons', 'status'])
