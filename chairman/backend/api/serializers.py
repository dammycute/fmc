from rest_framework import serializers
from game.models import (
    League, Club, ClubFacilities, Player, Manager, Staff,
    Match, TransferBid, TransferRequest, NewsStory, GameState,
    ScoutAssignment, ScoutReport, Sponsor
)

class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ['id', 'name', 'tier', 'country']

class ClubFacilitiesSerializer(serializers.ModelSerializer):
    stadium = serializers.SerializerMethodField()
    trainingGround = serializers.SerializerMethodField()
    medicalCenter = serializers.SerializerMethodField()
    youthAcademy = serializers.SerializerMethodField()

    class Meta:
        model = ClubFacilities
        fields = ['stadium', 'trainingGround', 'medicalCenter', 'youthAcademy']

    def get_stadium(self, obj):
        return {
            "level": obj.stadium_level,
            "name": "Stadium",
            "upgradeCost": obj.stadium_upgrade_cost,
            "capacity": obj.stadium_capacity
        }

    def get_trainingGround(self, obj):
        return {
            "level": obj.training_level,
            "name": "Training Ground",
            "upgradeCost": obj.training_upgrade_cost
        }

    def get_medicalCenter(self, obj):
        return {
            "level": obj.medical_level,
            "name": "Medical Center",
            "upgradeCost": obj.medical_upgrade_cost
        }

    def get_youthAcademy(self, obj):
        return {
            "level": obj.youth_level,
            "name": "Youth Academy",
            "upgradeCost": obj.youth_upgrade_cost
        }

class ClubSerializer(serializers.ModelSerializer):
    leagueId = serializers.PrimaryKeyRelatedField(source='league', read_only=True)
    primaryColor = serializers.CharField(source='primary_color')
    secondaryColor = serializers.CharField(source='secondary_color')
    stadiumName = serializers.CharField(source='stadium_name')
    isUserControlled = serializers.BooleanField(source='is_user_controlled')
    fanConfidence = serializers.IntegerField(source='fan_confidence')
    boardConfidence = serializers.IntegerField(source='board_confidence')
    isForSale = serializers.BooleanField(source='is_for_sale')
    transferBudget = serializers.IntegerField(source='transfer_budget')
    seasonTarget = serializers.CharField(source='season_target')
    startingLineup = serializers.JSONField(source='starting_lineup')
    trainingFocus = serializers.CharField(source='training_focus')

    facilities = ClubFacilitiesSerializer(read_only=True)
    finances = serializers.SerializerMethodField()
    board = serializers.SerializerMethodField()
    records = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'leagueId', 'primaryColor', 'secondaryColor',
            'stadiumName', 'reputation', 'isUserControlled', 'fanConfidence',
            'boardConfidence', 'facilities', 'finances', 'board', 'culture',
            'rivals', 'history', 'records', 'transferBudget', 'seasonTarget',
            'valuation', 'isForSale', 'formation', 'tactics', 'startingLineup',
            'trainingFocus'
        ]

    def get_finances(self, obj):
        return {
            "balance": obj.balance,
            "transferBudget": obj.transfer_budget,
            "weeklyWages": obj.weekly_wages,
            "weeklyStaffWages": obj.weekly_staff_wages,
            "revenue": {"tickets": 0, "sponsorship": 0, "merchandise": 0, "tvRights": 0, "prizeMoney": 0},
            "expenses": {"playerWages": obj.weekly_wages, "staffWages": obj.weekly_staff_wages, "facilityMaintenance": 0, "loanRepayments": 0, "transfers": 0},
            "loans": []
        }

    def get_board(self, obj):
        return {
            "type": obj.board_type,
            "expectations": obj.board_expectations,
            "confidence": obj.board_confidence,
            "patience": obj.board_patience,
            "funds": 0
        }

    def get_records(self, obj):
        return {
            "biggestWin": "N/A",
            "worstDefeat": "N/A",
            "recordSigning": 0,
            "recordSale": 0,
            "hallOfFame": []
        }

class PlayerSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    overallRating = serializers.FloatField(source='overall_rating')
    potentialRating = serializers.IntegerField(source='potential_rating')
    contractYears = serializers.IntegerField(source='contract_years')
    isInjured = serializers.BooleanField(source='is_injured')
    injuryWeeksRemaining = serializers.IntegerField(source='injury_weeks_remaining')
    clubId = serializers.PrimaryKeyRelatedField(source='club', read_only=True)
    isTransferListed = serializers.BooleanField(source='is_transfer_listed')
    isLoanListed = serializers.BooleanField(source='is_loan_listed')
    tacticalFamiliarity = serializers.FloatField(source='tactical_familiarity')
    isLegend = serializers.BooleanField(source='is_legend')

    technical = serializers.SerializerMethodField()
    physical = serializers.SerializerMethodField()
    mental = serializers.SerializerMethodField()
    hidden = serializers.SerializerMethodField()
    happiness = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            'id', 'firstName', 'lastName', 'age', 'position', 'archetype',
            'overallRating', 'potentialRating', 'value', 'wage', 'morale',
            'fitness', 'fatigue', 'isInjured', 'injuryWeeksRemaining', 'clubId',
            'personality', 'contractYears', 'isTransferListed', 'isLoanListed',
            'tacticalFamiliarity', 'form', 'isLegend', 'technical', 'physical',
            'mental', 'hidden', 'happiness', 'history'
        ]

    def get_technical(self, obj):
        return {
            "passing": obj.tech_passing,
            "shooting": obj.tech_shooting,
            "dribbling": obj.tech_dribbling,
            "tackling": obj.tech_tackling,
            "positioning": obj.tech_positioning,
            "vision": obj.tech_vision,
            "finishing": obj.tech_finishing,
            "handling": obj.tech_handling,
            "reflexes": obj.tech_reflexes,
            "commandOfArea": obj.tech_command_of_area,
            "rushingOut": obj.tech_rushing_out
        }

    def get_physical(self, obj):
        return {
            "pace": obj.phys_pace,
            "strength": obj.phys_strength,
            "stamina": obj.phys_stamina,
            "agility": obj.phys_agility,
            "acceleration": obj.phys_acceleration
        }

    def get_mental(self, obj):
        return {
            "leadership": obj.ment_leadership,
            "composure": obj.ment_composure,
            "aggression": obj.ment_aggression,
            "workRate": obj.ment_work_rate,
            "decisions": obj.ment_decisions,
            "determination": obj.ment_determination
        }

    def get_hidden(self, obj):
        return {
            "professionalism": obj.hidden_professionalism,
            "ambition": obj.hidden_ambition,
            "loyalty": obj.hidden_loyalty,
            "injuryProneness": obj.hidden_injury_proneness,
            "temperament": obj.hidden_temperament,
            "bigMatchMentality": obj.hidden_big_match,
            "consistency": obj.hidden_consistency
        }

    def get_happiness(self, obj):
        return {
            "contract": obj.happiness_contract,
            "playingTime": obj.happiness_playing_time,
            "manager": obj.happiness_manager,
            "clubAmbition": obj.happiness_club_ambition,
            "adaptation": 80,
            "cityLife": 80
        }

    def get_history(self, obj):
        return {
            "appearances": obj.appearances,
            "goals": obj.goals,
            "trophies": 0,
            "joinedSeason": 2024,
            "joinedWeek": 1
        }

class ManagerSerializer(serializers.ModelSerializer):
    clubId = serializers.PrimaryKeyRelatedField(source='club', read_only=True)
    coachingAbility = serializers.IntegerField(source='coaching_ability')
    preferredFormation = serializers.CharField(source='preferred_formation')
    preferredStyle = serializers.CharField(source='preferred_style')
    creativeFreedom = serializers.IntegerField(source='creative_freedom')
    contractWeeksRemaining = serializers.IntegerField(source='contract_weeks_remaining')
    relationshipWithChairman = serializers.FloatField(source='relationship_with_chairman')
    wantsToLeave = serializers.BooleanField(source='wants_to_leave')

    coaching = serializers.SerializerMethodField()
    personality = serializers.SerializerMethodField()

    class Meta:
        model = Manager
        fields = [
            'id', 'name', 'archetype', 'coaching', 'preferredStyle',
            'preferredFormation', 'pressing', 'creativeFreedom', 'personality',
            'coachingAbility', 'salary', 'contractWeeksRemaining', 'clubId',
            'relationshipWithChairman', 'wantsToLeave', 'morale'
        ]

    def get_coaching(self, obj):
        return {
            "attacking": obj.coaching_attacking,
            "defensive": obj.coaching_defensive,
            "tactical": obj.coaching_tactical,
            "mental": obj.coaching_mental,
            "workingWithYouth": obj.coaching_youth
        }

    def get_personality(self, obj):
        return {
            "discipline": obj.personality_discipline,
            "loyalty": obj.personality_loyalty,
            "ambition": obj.personality_ambition,
            "mediaHandling": obj.personality_media,
            "playerManagement": obj.personality_player_mgmt
        }

class StaffSerializer(serializers.ModelSerializer):
    clubId = serializers.PrimaryKeyRelatedField(source='club', read_only=True)
    isApplicant = serializers.BooleanField(source='is_applicant')

    class Meta:
        model = Staff
        fields = ['id', 'name', 'role', 'rating', 'salary', 'clubId', 'isApplicant']

class MatchSerializer(serializers.ModelSerializer):
    homeClubId = serializers.PrimaryKeyRelatedField(source='home_club', read_only=True)
    awayClubId = serializers.PrimaryKeyRelatedField(source='away_club', read_only=True)
    leagueId = serializers.PrimaryKeyRelatedField(source='league', read_only=True)
    homeScore = serializers.IntegerField(source='home_score')
    awayScore = serializers.IntegerField(source='away_score')
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            'id', 'homeClubId', 'awayClubId', 'leagueId', 'season', 'week',
            'played', 'homeScore', 'awayScore', 'events', 'stats'
        ]

    def get_stats(self, obj):
        return {
            "homePossession": obj.home_possession,
            "awayPossession": obj.away_possession,
            "homeShots": obj.home_shots,
            "awayShots": obj.away_shots,
            "homePassRate": 80,
            "awayPassRate": 80,
            "homeXg": obj.home_xg,
            "awayXg": obj.away_xg,
        }

class TransferBidSerializer(serializers.ModelSerializer):
    playerId = serializers.PrimaryKeyRelatedField(source='player', read_only=True)
    fromClubId = serializers.PrimaryKeyRelatedField(source='from_club', read_only=True)
    toClubId = serializers.PrimaryKeyRelatedField(source='to_club', read_only=True)
    isPlayerInterested = serializers.BooleanField(source='is_player_interested')
    negotiationCount = serializers.IntegerField(source='negotiation_count')
    week = serializers.IntegerField(source='created_week')
    season = serializers.IntegerField(source='created_season')

    class Meta:
        model = TransferBid
        fields = [
            'id', 'playerId', 'fromClubId', 'toClubId', 'amount', 'status',
            'week', 'season', 'isPlayerInterested', 'negotiationCount'
        ]

class TransferRequestSerializer(serializers.ModelSerializer):
    managerId = serializers.PrimaryKeyRelatedField(source='manager', read_only=True)
    clubId = serializers.PrimaryKeyRelatedField(source='club', read_only=True)
    suggestedPosition = serializers.CharField(source='suggested_position')
    weekRequested = serializers.IntegerField(source='week_requested')
    seasonRequested = serializers.IntegerField(source='season_requested')

    class Meta:
        model = TransferRequest
        fields = [
            'id', 'managerId', 'clubId', 'request_type', 'priority', 'message',
            'status', 'suggestedPosition', 'weekRequested', 'seasonRequested'
        ]

class NewsStorySerializer(serializers.ModelSerializer):
    clubId = serializers.PrimaryKeyRelatedField(source='club', read_only=True)

    class Meta:
        model = NewsStory
        fields = ['id', 'week', 'season', 'title', 'content', 'category', 'importance', 'clubId']

class GameStateSerializer(serializers.ModelSerializer):
    userClubId = serializers.PrimaryKeyRelatedField(source='user_club', read_only=True)
    currentSeason = serializers.IntegerField(source='current_season')
    currentWeek = serializers.IntegerField(source='current_week')
    isTransferWindowOpen = serializers.BooleanField(source='is_transfer_window_open')
    personalBalance = serializers.IntegerField(source='personal_balance')

    class Meta:
        model = GameState
        fields = [
            'id', 'currentSeason', 'currentWeek', 'isTransferWindowOpen', 'userClubId',
            'personalBalance', 'shortlist'
        ]

class ScoutReportSerializer(serializers.ModelSerializer):
    playerId = serializers.PrimaryKeyRelatedField(source='player', read_only=True)
    reportedRating = serializers.FloatField(source='reported_rating')
    week = serializers.IntegerField(source='created_week')
    season = serializers.IntegerField(source='created_season')

    class Meta:
        model = ScoutReport
        fields = ['id', 'playerId', 'reportedRating', 'week', 'season']

class ScoutAssignmentSerializer(serializers.ModelSerializer):
    scoutId = serializers.PrimaryKeyRelatedField(source='scout', read_only=True)
    reports = ScoutReportSerializer(many=True, read_only=True)

    class Meta:
        model = ScoutAssignment
        fields = ['id', 'scoutId', 'region', 'progress', 'reports']

class SponsorSerializer(serializers.ModelSerializer):
    duration = serializers.IntegerField(source='duration_seasons')
    reputationRequired = serializers.IntegerField(source='reputation_required')

    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'sponsor_type', 'amount', 'duration', 'reputationRequired', 'status']
