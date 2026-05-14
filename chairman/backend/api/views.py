from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F
from django.shortcuts import get_object_or_404

from game.models import (
    League, Club, ClubFacilities, Player, Manager, Staff,
    Match, TransferBid, TransferRequest, NewsStory, GameState,
    ScoutAssignment, Sponsor
)
from .serializers import (
    LeagueSerializer, ClubSerializer, PlayerSerializer,
    ManagerSerializer, StaffSerializer, MatchSerializer,
    TransferBidSerializer, TransferRequestSerializer,
    NewsStorySerializer, GameStateSerializer,
    ScoutAssignmentSerializer, SponsorSerializer
)
from simulation.week_engine import advance_week
from simulation.match_engine import simulate_match, PlayerSnapshot

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

# ── GAME STATE ───────────────────────────────────────

class GameStateViewSet(viewsets.ViewSet):
    def list(self, request):
        state = GameState.objects.select_related('user_club').get(pk=1)
        serializer = GameStateSerializer(state)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='buy-club')
    def buy_club(self, request):
        club_id = request.data.get('club_id')
        new_name = request.data.get('new_name')
        state = GameState.objects.get(pk=1)
        club = get_object_or_404(Club, id=club_id)

        # Simple logic: player buys club
        # In a real game we'd check personal_balance >= valuation
        state.user_club = club
        state.save()

        club.is_user_controlled = True
        if new_name:
            club.name = new_name
        club.save()

        return Response({"status": "Club purchased", "club_id": club.id})

class AdvanceWeekView(generics.GenericAPIView):
    def post(self, request):
        summary = advance_week()
        return Response(summary)

# ── CLUBS ────────────────────────────────────────────

class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.select_related('league', 'manager', 'facilities').all()
    serializer_class = ClubSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        league_id = self.request.query_params.get('league_id')
        if league_id:
            qs = qs.filter(league_id=league_id)
        return qs

    @action(detail=True, methods=['post'], url_path='upgrade-facility')
    def upgrade_facility(self, request, pk=None):
        club = self.get_object()
        fac_type = request.data.get('type')
        fac = club.facilities

        cost_attr = f"{fac_type}_upgrade_cost"
        level_attr = f"{fac_type}_level"

        if not hasattr(fac, cost_attr):
            return Response({"error": "Invalid facility type", "code": "INVALID_TYPE"}, status=400)

        cost = getattr(fac, cost_attr)
        if club.balance < cost:
            return Response({"error": "Insufficient funds", "code": "INSUFFICIENT_FUNDS"}, status=400)

        club.balance -= cost
        club.save()

        current_level = getattr(fac, level_attr)
        setattr(fac, level_attr, current_level + 1)
        # Update cost for next level
        setattr(fac, cost_attr, int(cost * 1.5))
        fac.save()

        return Response({"status": "Upgraded", "new_level": current_level + 1})

    @action(detail=True, methods=['post'], url_path='accept-sponsor')
    def accept_sponsor(self, request, pk=None):
        club = self.get_object()
        sponsor_id = request.data.get('sponsor_id')
        sponsor = get_object_or_404(Sponsor, id=sponsor_id, club=club)

        sponsor.status = 'ACTIVE'
        sponsor.save()
        return Response({"status": "Sponsor accepted"})

# ── PLAYERS ──────────────────────────────────────────

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.select_related('club').all()
    serializer_class = PlayerSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        pos = self.request.query_params.get('position')
        listed = self.request.query_params.get('is_transfer_listed')

        if club_id: qs = qs.filter(club_id=club_id)
        if pos: qs = qs.filter(position=pos)
        if listed: qs = qs.filter(is_transfer_listed=(listed.lower() == 'true'))

        return qs

# ── MANAGERS & STAFF ─────────────────────────────────

class ManagerViewSet(viewsets.ModelViewSet):
    queryset = Manager.objects.select_related('club').all()
    serializer_class = ManagerSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        unattached = self.request.query_params.get('unattached')
        if unattached == 'true':
            qs = qs.filter(club__isnull=True)
        return qs

    @action(detail=True, methods=['post'])
    def sack(self, request, pk=None):
        manager = self.get_object()
        club = manager.club
        if club:
            manager.club = None
            manager.wants_to_leave = False
            manager.save()
            return Response({"status": "Manager sacked"})
        return Response({"error": "Manager not employed"}, status=400)

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.select_related('club').all()
    serializer_class = StaffSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        role = self.request.query_params.get('role')
        unattached = self.request.query_params.get('unattached')

        if club_id: qs = qs.filter(club_id=club_id)
        if role: qs = qs.filter(role=role)
        if unattached == 'true': qs = qs.filter(club__isnull=True)

        return qs

    @action(detail=True, methods=['delete'])
    def dismiss(self, request, pk=None):
        staff = self.get_object()
        staff.club = None
        staff.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ── MATCHES ──────────────────────────────────────────

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Match.objects.select_related('home_club', 'away_club', 'league').all()
    serializer_class = MatchSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        week = self.request.query_params.get('week')
        season = self.request.query_params.get('season')

        if club_id: qs = qs.filter(Q(home_club_id=club_id) | Q(away_club_id=club_id))
        if week: qs = qs.filter(week=week)
        if season: qs = qs.filter(season=season)

        return qs

    @action(detail=True, methods=['post'])
    def simulate(self, request, pk=None):
        match = self.get_object()
        h_players = list(match.home_club.players.all())
        a_players = list(match.away_club.players.all())

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

        res = simulate_match(
            match.home_club, match.away_club,
            [make_snapshot(p) for p in h_players],
            [make_snapshot(p) for p in a_players],
            getattr(match.home_club, 'manager', None),
            getattr(match.away_club, 'manager', None),
            match.season, match.week
        )
        return Response(res)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        match = self.get_object()
        match.home_score = request.data.get('home_score')
        match.away_score = request.data.get('away_score')
        match.events = request.data.get('events')
        match.played = True
        match.save()
        # Post-match logic would go here in a production app
        return Response({"status": "Match finalized"})

# ── LEAGUES ──────────────────────────────────────────

class LeagueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = League.objects.all()
    serializer_class = LeagueSerializer

    @action(detail=True, methods=['get'])
    def table(self, request, pk=None):
        league = self.get_object()
        clubs = Club.objects.filter(league=league)
        table = []
        for club in clubs:
            # Computed from Match model
            matches = Match.objects.filter(
                Q(home_club=club) | Q(away_club=club),
                league=league, played=True
            )
            played = matches.count()
            won = 0; drawn = 0; lost = 0; gf = 0; ga = 0
            for m in matches:
                if m.home_club == club:
                    gf += m.home_score; ga += m.away_score
                    if m.home_score > m.away_score: won += 1
                    elif m.home_score == m.away_score: drawn += 1
                    else: lost += 1
                else:
                    gf += m.away_score; ga += m.home_score
                    if m.away_score > m.home_score: won += 1
                    elif m.home_score == m.away_score: drawn += 1
                    else: lost += 1

            table.append({
                "club_id": club.id, "name": club.name,
                "played": played, "won": won, "drawn": drawn, "lost": lost,
                "gf": gf, "ga": ga, "gd": gf - ga, "pts": won * 3 + drawn
            })

        table.sort(key=lambda x: (x['pts'], x['gd'], x['gf']), reverse=True)
        return Response(table)

# ── TRANSFERS ────────────────────────────────────────

class TransferBidViewSet(viewsets.ModelViewSet):
    queryset = TransferBid.objects.select_related('player', 'from_club', 'to_club').all()
    serializer_class = TransferBidSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        if club_id:
            qs = qs.filter(Q(from_club_id=club_id) | Q(to_club_id=club_id))
        return qs

    @action(detail=False, methods=['post'], url_path='make-bid')
    def make_bid(self, request):
        state = GameState.objects.get(pk=1)
        if not state.is_transfer_window_open:
            return Response({"error": "Transfer window is closed", "code": "WINDOW_CLOSED"}, status=400)

        player_id = request.data.get('player_id')
        amount = int(request.data.get('amount', 0))
        user_club = state.user_club

        if not user_club:
            return Response({"error": "User does not control a club"}, status=400)

        if amount > user_club.transfer_budget:
            return Response({"error": "Insufficient transfer budget", "code": "INSUFFICIENT_BUDGET"}, status=400)

        player = get_object_or_404(Player, id=player_id)
        if TransferBid.objects.filter(player=player, from_club=user_club, status='PENDING').exists():
            return Response({"error": "Bid already pending for this player"}, status=400)

        bid = TransferBid.objects.create(
            player=player,
            from_club=user_club,
            to_club=player.club,
            amount=amount,
            status='PENDING',
            created_week=state.current_week,
            created_season=state.current_season
        )

        return Response(TransferBidSerializer(bid).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        bid = self.get_object()
        state = GameState.objects.get(pk=1)
        if bid.to_club != state.user_club:
            return Response({"error": "Not your player", "code": "FORBIDDEN"}, status=403)

        if bid.status != 'PENDING':
            return Response({"error": "Bid is not pending"}, status=400)

        player = bid.player
        # Loyalty roll: if loyalty > 80, random chance they refuse
        import random
        if player.hidden_loyalty > 80 and random.random() < 0.5:
            return Response({"error": "Player refused to leave", "code": "PLAYER_REFUSED", "status": "PLAYER_REFUSED"}, status=200)

        bid.status = 'ACCEPTED'
        bid.is_player_interested = True
        bid.save()
        return Response(TransferBidSerializer(bid).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        bid = self.get_object()
        bid.status = 'REJECTED'
        bid.save()
        return Response({"status": "Bid rejected"})

    @action(detail=True, methods=['post'])
    def counter(self, request, pk=None):
        bid = self.get_object()
        if bid.negotiation_count >= 3:
            return Response({"error": "Maximum negotiations reached", "code": "MAX_NEGOTIATIONS"}, status=400)

        counter_amount = int(request.data.get('counter_amount', 0))
        if counter_amount < bid.amount * 1.05:
            return Response({"error": "Counter must be at least 5% higher"}, status=400)

        bid.amount = counter_amount
        bid.negotiation_count += 1
        bid.save()
        return Response(TransferBidSerializer(bid).data)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        bid = self.get_object()
        if bid.status != 'ACCEPTED':
            return Response({"error": "Bid not accepted", "code": "NOT_ACCEPTED"}, status=400)

        player = bid.player
        buying_club = bid.from_club # The one who made the bid
        selling_club = bid.to_club # The user's club or AI club

        # Execute transfer
        player.club = buying_club
        player.is_transfer_listed = False
        player.save()

        # Buyer pays
        if buying_club:
            buying_club.balance -= bid.amount
            buying_club.transfer_budget -= bid.amount
            buying_club.weekly_wages += player.wage
            buying_club.save()

        # Seller receives
        if selling_club:
            selling_club.balance += bid.amount
            selling_club.weekly_wages -= player.wage
            selling_club.save()

        bid.status = 'COMPLETED'
        bid.save()

        state = GameState.objects.get(pk=1)
        NewsStory.objects.create(
            title=f"TRANSFER: {player.last_name} joins {buying_club.name if buying_club else 'Free Agency'}",
            content=f"{player.first_name} {player.last_name} has completed a move to {buying_club.name if buying_club else 'Free Agency'} for £{bid.amount:,}.",
            category='TRANSFER',
            importance='HIGH',
            club=buying_club,
            week=state.current_week,
            season=state.current_season
        )

        return Response({"status": "Transfer completed"})

class TransferRequestViewSet(viewsets.ModelViewSet):
    queryset = TransferRequest.objects.select_related('manager', 'club').all()
    serializer_class = TransferRequestSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        if club_id:
            qs = qs.filter(club_id=club_id)
        return qs

# ── NEWS ─────────────────────────────────────────────

class NewsStoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NewsStory.objects.select_related('club').all()
    serializer_class = NewsStorySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        importance = self.request.query_params.get('importance')
        if club_id: qs = qs.filter(club_id=club_id)
        if importance: qs = qs.filter(importance=importance)
        return qs

# ── SCOUTING ─────────────────────────────────────────

class ScoutAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ScoutAssignment.objects.select_related('scout', 'club').all()
    serializer_class = ScoutAssignmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        club_id = self.request.query_params.get('club_id')
        if club_id: qs = qs.filter(club_id=club_id)
        return qs

# ── SHORTLIST ────────────────────────────────────────

class ShortlistViewSet(viewsets.ViewSet):
    def list(self, request):
        state = GameState.objects.get(pk=1)
        players = Player.objects.filter(id__in=state.shortlist)
        serializer = PlayerSerializer(players, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def handle_player(self, request, pk=None):
        state = GameState.objects.get(pk=1)
        player_id = int(pk)

        if request.method == 'POST':
            if player_id not in state.shortlist:
                state.shortlist.append(player_id)
                state.save()
            return Response({"status": "Added to shortlist"})
        else: # DELETE
            if player_id in state.shortlist:
                state.shortlist.remove(player_id)
                state.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
