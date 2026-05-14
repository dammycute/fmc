import random
from django.db.models import Q, F
from game.models import Club, Player, TransferBid, NewsStory, GameState

def process_week(week: int, season: int) -> None:
    """
    Core AI transfer logic called weekly.
    """
    state = GameState.objects.get(pk=1)
    is_window_open = (1 <= week <= 6) or (33 <= week <= 38)

    # PART C — Player happiness impact on transfer requests
    _process_player_unrest(week, season)

    # PART B — AI Bid Resolution (Resolve existing PENDING bids)
    _resolve_ai_bids(state, week, season)

    # PART A — AI Bid Generation
    if is_window_open:
        _generate_ai_bids(state, week, season)

def _process_player_unrest(week: int, season: int) -> None:
    """
    Players with low club ambition and high ambition force transfers.
    """
    unhappy_players = Player.objects.filter(
        happiness_club_ambition__lt=40,
        hidden_ambition__gt=70,
        is_transfer_listed=False
    ).select_related('club')

    for player in unhappy_players:
        player.is_transfer_listed = True
        player.save(update_fields=['is_transfer_listed'])

        NewsStory.objects.create(
            title=f"Transfer request: {player.last_name} wants out",
            content=f"{player.first_name} {player.last_name} has officially requested a transfer from {player.club.name}, citing a lack of club ambition.",
            category='TRANSFER',
            importance='MEDIUM',
            club=player.club,
            week=week,
            season=season
        )

def _resolve_ai_bids(state, week: int, season: int) -> None:
    """
    Resolve all PENDING bids where to_club is NOT user club.
    """
    pending_bids = TransferBid.objects.filter(
        status='PENDING'
    ).exclude(
        to_club=state.user_club
    ).select_related('player', 'from_club', 'to_club')

    for bid in pending_bids:
        player = bid.player
        buying_club = bid.from_club
        selling_club = bid.to_club

        # 1. Selling club accepts if:
        # - bid_amount >= player.value * 0.85 AND
        # - player morale < 60 OR player.is_transfer_listed
        if bid.amount >= player.value * 0.85 and (player.morale < 60 or player.is_transfer_listed):
            # COMPLETED
            player.club = buying_club
            player.is_transfer_listed = False
            player.morale = min(100.0, float(player.morale) + 15)
            player.save(update_fields=['club', 'is_transfer_listed', 'morale'])

            Club.objects.filter(id=buying_club.id).update(
                balance=F('balance') - bid.amount,
                transfer_budget=F('transfer_budget') - bid.amount,
                weekly_wages=F('weekly_wages') + player.wage
            )

            Club.objects.filter(id=selling_club.id).update(
                balance=F('balance') + bid.amount,
                weekly_wages=F('weekly_wages') - player.wage
            )

            bid.status = 'COMPLETED'
            bid.save(update_fields=['status'])

            NewsStory.objects.create(
                title=f"DONE DEAL: {player.last_name} joins {buying_club.name}",
                content=f"{buying_club.name} have completed the signing of {player.first_name} {player.last_name} from {selling_club.name} for a reported fee of £{bid.amount:,}.",
                category='TRANSFER',
                importance='HIGH',
                club=buying_club,
                week=week,
                season=season
            )

        # 2. Selling club rejects if:
        # - bid_amount < player.value * 0.85 OR
        # - player.hidden_loyalty > 70 AND player.morale > 65
        elif bid.amount < player.value * 0.85 or (player.hidden_loyalty > 70 and player.morale > 65):
            bid.status = 'REJECTED'
            bid.negotiation_count += 1

            # 5. After 3 rejection cycles (negotiation_count >= 3): bid.status = CANCELLED
            if bid.negotiation_count >= 3:
                bid.status = 'CANCELLED'

            bid.save(update_fields=['status', 'negotiation_count'])

def _generate_ai_bids(state, week: int, season: int) -> None:
    """
    Non-user clubs generate bids to fill squad gaps.
    """
    ai_clubs = Club.objects.filter(is_user_controlled=False).prefetch_related('players')

    for club in ai_clubs:
        if club.transfer_budget <= 0:
            continue

        # 1. Check squad gaps
        # Mins: GK=2, DEF=5, MID=5, ATT=3
        players = list(club.players.all())
        gaps = []
        if sum(1 for p in players if p.position == 'GK') < 2: gaps.append('GK')
        if sum(1 for p in players if p.position == 'DEF') < 5: gaps.append('DEF')
        if sum(1 for p in players if p.position == 'MID') < 5: gaps.append('MID')
        if sum(1 for p in players if p.position == 'ATT') < 3: gaps.append('ATT')

        if not gaps:
            continue

        # Select a random gap to fill
        target_pos = random.choice(gaps)

        # 2a. Find best available player at that position
        # (transfer listed OR from weaker club: reputation < this_club.reputation * 0.8)
        potential_targets = Player.objects.filter(
            position=target_pos
        ).exclude(
            club=club
        ).filter(
            Q(is_transfer_listed=True) | Q(club__reputation__lt=club.reputation * 0.8)
        ).order_by('-overall_rating')[:10] # Look at top 10 available

        if not potential_targets:
            continue

        target_player = random.choice(list(potential_targets))

        # 2c. Bid amount = player.value * random.uniform(0.9, 1.15)
        bid_amount = int(target_player.value * random.uniform(0.9, 1.15))

        # 2d. Only bid if bid_amount <= club.transfer_budget * 0.6
        if bid_amount <= club.transfer_budget * 0.6:
            TransferBid.objects.create(
                player=target_player,
                from_club=club,
                to_club=target_player.club,
                amount=bid_amount,
                status='PENDING',
                created_week=week,
                created_season=season
            )
