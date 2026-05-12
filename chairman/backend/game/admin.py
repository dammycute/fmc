from django.contrib import admin
from .models import (
    League, Club, ClubFacilities, Sponsor, ScoutAssignment,
    Player, Manager, Staff, Match, TransferBid, TransferRequest,
    NewsStory, GameState
)

@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ['name', 'tier', 'country', 'club_count']
    list_filter = ['tier', 'country']

    def club_count(self, obj):
        return obj.clubs.count()
    club_count.short_description = 'Clubs'

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ['name', 'league', 'reputation', 'balance_display',
                    'is_user_controlled', 'board_confidence', 'fan_confidence']
    list_filter = ['league', 'is_user_controlled', 'formation']
    search_fields = ['name']
    readonly_fields = ['weekly_wages', 'weekly_staff_wages']

    def balance_display(self, obj):
        return f"£{obj.balance:,}"
    balance_display.short_description = 'Balance'

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'club', 'position', 'overall_rating',
                    'age', 'value_display', 'morale', 'is_injured', 'is_transfer_listed']
    list_filter = ['position', 'club__league', 'is_injured', 'is_transfer_listed']
    search_fields = ['first_name', 'last_name']
    list_select_related = ['club', 'club__league']

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Name'

    def value_display(self, obj):
        return f"£{obj.value:,}"
    value_display.short_description = 'Value'

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ['name', 'club', 'coaching_ability', 'morale',
                    'relationship_with_chairman', 'wants_to_leave']
    list_filter = ['preferred_formation', 'preferred_style']
    search_fields = ['name']

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['match_display', 'week', 'season', 'played',
                    'home_score', 'away_score', 'home_xg', 'away_xg']
    list_filter = ['played', 'season', 'league']

    def match_display(self, obj):
        return f"{obj.home_club.name} vs {obj.away_club.name}"
    match_display.short_description = 'Fixture'

@admin.register(TransferBid)
class TransferBidAdmin(admin.ModelAdmin):
    list_display = ['player', 'from_club', 'to_club', 'amount_display',
                    'status', 'negotiation_count']
    list_filter = ['status']

    def amount_display(self, obj):
        return f"£{obj.amount:,}"
    amount_display.short_description = 'Amount'

@admin.register(NewsStory)
class NewsStoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'importance', 'week', 'season', 'club']
    list_filter = ['category', 'importance', 'season']
    search_fields = ['title', 'content']

@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    list_display = ['current_season', 'current_week', 'is_transfer_window_open',
                    'user_club', 'personal_balance_display']

    def personal_balance_display(self, obj):
        return f"£{obj.personal_balance:,}"
    personal_balance_display.short_description = 'Balance'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

# Registering remaining models with default admins if not covered above
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

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'role', 'rating')
    list_filter = ('role', 'is_applicant')

@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ('manager', 'club', 'request_type', 'priority', 'status')
    list_filter = ('status', 'priority', 'request_type')
