from django.contrib import admin
from .models import (
    League, Club, ClubFacilities, Sponsor, ScoutAssignment,
    Player, Manager, Staff, Match, TransferBid, TransferRequest,
    NewsStory, GameState
)

@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'country', 'reputation')
    list_filter = ('tier', 'country')

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'league', 'reputation', 'balance', 'is_user_controlled')
    list_filter = ('league', 'is_user_controlled', 'board_type')
    search_fields = ('name',)

@admin.register(ClubFacilities)
class ClubFacilitiesAdmin(admin.ModelAdmin):
    list_display = ('club', 'stadium_level', 'training_level', 'youth_level', 'medical_level')

@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'sponsor_type', 'amount', 'status')
    list_filter = ('sponsor_type', 'status')

@admin.register(ScoutAssignment)
class ScoutAssignmentAdmin(admin.ModelAdmin):
    list_display = ('club', 'scout', 'region', 'progress')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'club', 'position', 'overall_rating', 'value')
    list_filter = ('position', 'club', 'is_injured', 'is_transfer_listed')
    search_fields = ('first_name', 'last_name')

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'coaching_ability', 'morale')

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'role', 'rating')
    list_filter = ('role', 'is_applicant')

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('home_club', 'away_club', 'home_score', 'away_score', 'season', 'week', 'played')
    list_filter = ('played', 'season', 'week', 'league')

@admin.register(TransferBid)
class TransferBidAdmin(admin.ModelAdmin):
    list_display = ('player', 'from_club', 'to_club', 'amount', 'status')
    list_filter = ('status', 'created_season')

@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ('manager', 'club', 'request_type', 'priority', 'status')
    list_filter = ('status', 'priority', 'request_type')

@admin.register(NewsStory)
class NewsStoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'importance', 'club', 'season', 'week')
    list_filter = ('category', 'importance', 'season')

@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    list_display = ('current_season', 'current_week', 'is_transfer_window_open', 'user_club')
