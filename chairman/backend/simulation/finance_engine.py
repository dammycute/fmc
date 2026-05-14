from game.models import Club, Match, NewsStory, Sponsor, Player, Manager
from django.db.models import Q, Prefetch

def process_week(week: int, season: int) -> None:
    """
    Processes weekly finances for all clubs.
    """
    # Pre-fetch all home matches played this week to avoid N+1
    home_matches = {
        m.home_club_id: m
        for m in Match.objects.filter(week=week, season=season, played=True)
    }

    # Fetch clubs with necessary relations
    clubs = Club.objects.select_related(
        'league',
        'facilities',
        'manager'
    ).prefetch_related(
        Prefetch('sponsors', queryset=Sponsor.objects.filter(status='ACTIVE'))
    ).all()

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

            attendance_pct = min(1.0, 0.6 + (club.reputation / 200))
            capacity = club.facilities.stadium_capacity if hasattr(club, 'facilities') else 0
            matchday_income = int(capacity * attendance_pct * price)

        # 3. Sponsorship
        sponsor_income = sum(s.amount // 38 for s in club.sponsors.all())

        # 4. Merchandise
        merchandise_income = int(club.reputation * 300 + (6 - league_tier) * 200)

        total_income = tv_income + matchday_income + sponsor_income + merchandise_income

        # ── EXPENSES ────────────────────────────────────────

        # Player and Staff wages
        player_wages = club.weekly_wages
        staff_wages = club.weekly_staff_wages

        # Manager salary
        manager_salary = 0
        if hasattr(club, 'manager') and club.manager:
            manager_salary = club.manager.salary

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
