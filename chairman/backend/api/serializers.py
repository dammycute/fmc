from rest_framework import serializers
from game.models import (
    League, Club, ClubFacilities, Player, Manager, Staff,
    Match, TransferBid, TransferRequest, NewsStory, GameState,
    ScoutAssignment, Sponsor
)

class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = '__all__'

class ClubFacilitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubFacilities
        fields = '__all__'

class ManagerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = ['id', 'name', 'coaching_ability']

class ClubSerializer(serializers.ModelSerializer):
    league_name = serializers.CharField(source='league.name', read_only=True)
    manager_name = serializers.CharField(source='manager.name', read_only=True, default="No Manager")
    facilities = ClubFacilitiesSerializer(read_only=True)

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'league', 'league_name', 'primary_color', 'secondary_color',
            'stadium_name', 'reputation', 'valuation', 'is_user_controlled',
            'is_for_sale', 'balance', 'transfer_budget', 'weekly_wages',
            'weekly_staff_wages', 'board_type', 'board_expectations',
            'board_patience', 'board_confidence', 'fan_confidence',
            'formation', 'tactics', 'season_target', 'starting_lineup',
            'culture', 'rivals', 'history', 'manager_name', 'facilities'
        ]

class PlayerSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

    class Meta:
        model = Player
        fields = '__all__'

class ManagerSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

    class Meta:
        model = Manager
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

    class Meta:
        model = Staff
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    home_club_name = serializers.CharField(source='home_club.name', read_only=True)
    away_club_name = serializers.CharField(source='away_club.name', read_only=True)
    league_name = serializers.CharField(source='league.name', read_only=True)

    class Meta:
        model = Match
        fields = '__all__'

class TransferBidSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.last_name', read_only=True)
    from_club_name = serializers.CharField(source='from_club.name', read_only=True)
    to_club_name = serializers.CharField(source='to_club.name', read_only=True)

    class Meta:
        model = TransferBid
        fields = '__all__'

class TransferRequestSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = TransferRequest
        fields = '__all__'

class NewsStorySerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name', read_only=True, allow_null=True)

    class Meta:
        model = NewsStory
        fields = '__all__'

class GameStateSerializer(serializers.ModelSerializer):
    user_club_name = serializers.CharField(source='user_club.name', read_only=True, allow_null=True)

    class Meta:
        model = GameState
        fields = '__all__'

class ScoutAssignmentSerializer(serializers.ModelSerializer):
    scout_name = serializers.CharField(source='scout.name', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = ScoutAssignment
        fields = '__all__'

class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = '__all__'
