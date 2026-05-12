from game.models import GameState, Club, Match, NewsStory, Sponsor, Player
from django.db.models import Q

def process_week(week: int, season: int) -> None:
    """
    Processes weekly finances for all clubs.
    """
    # state = GameState.objects.get(pk=1) # Not explicitly used in the logic provided but fetched in prompt

    for club in Club.objects.select_related('league', 'facilities').prefetch_related('sponsors'):
        league_tier = club.league.tier

        # INCOME
        # 1. TV Rights (weekly slice of annual deal)
        tv_rights = {1: 240000, 2: 120000, 3: 75000, 4: 40000, 5: 15000}
        tv_income = tv_rights.get(league_tier, 10000)

        # 2. Matchday (if they have a home match this week)
        home_match = Match.objects.filter(
            home_club=club, week=week, season=season, played=True
        ).first()

        matchday_income = 0
        if home_match:
            ticket_price = {1: 60, 2: 40, 3: 25, 4: 15, 5: 8}.get(league_tier, 8)
            attendance_pct = min(1.0, 0.6 + (club.reputation / 200))
            capacity = club.facilities.stadium_capacity
            matchday_income = int(capacity * attendance_pct * ticket_price)

        # 3. Sponsorship (weekly slice)
        sponsor_income = 0
        for sponsor in club.sponsors.filter(status='ACTIVE'):
            weekly = sponsor.amount // 38  # spread over season
            sponsor_income += weekly

        # 4. Merchandise (reputation-based)
        merch = int(club.reputation * 300 + (6 - league_tier) * 200)

        total_income = tv_income + matchday_income + sponsor_income + merch

        # EXPENSES
        player_wages = club.weekly_wages
        staff_wages = club.weekly_staff_wages
        manager_salary = 0
        if hasattr(club, 'manager') and club.manager:
            manager_salary = club.manager.salary

        maintenance = {1: 50000, 2: 25000, 3: 10000, 4: 5000, 5: 2000}.get(league_tier, 2000)

        total_expenses = player_wages + staff_wages + manager_salary + maintenance

        # Update balance
        club.balance += (total_income - total_expenses)
        club.save(update_fields=['balance'])

        # Trigger financial crisis events
        if club.balance < 0:
            if club.is_user_controlled:
                # Generate urgent news for user
                NewsStory.objects.get_or_create(
                    title="Financial Warning",
                    week=week, season=season,
                    club=club,
                    defaults={
                        'content': f"{club.name} is operating at a deficit. Immediate action required.",
                        'category': 'FINANCE',
                        'importance': 'BREAKING'
                    }
                )
            else:
                # AI club lists their most valuable non-essential player
                _ai_emergency_sale(club)

def _ai_emergency_sale(club: Club) -> None:
    """
    AI emergency logic: list a top player to raise funds.
    """
    # Find the most valuable (highest rated) non-goalkeeper to list
    player = club.players.filter(
        is_transfer_listed=False
    ).exclude(position='GK').order_by('-overall_rating').first()

    if player:
        player.is_transfer_listed = True
        player.save(update_fields=['is_transfer_listed'])
