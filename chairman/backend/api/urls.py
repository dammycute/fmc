from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GameStateViewSet, AdvanceWeekView, ClubViewSet, PlayerViewSet,
    ManagerViewSet, StaffViewSet, MatchViewSet, LeagueViewSet,
    TransferBidViewSet, TransferRequestViewSet, NewsStoryViewSet,
    ScoutAssignmentViewSet, ShortlistViewSet
)

router = DefaultRouter()
router.register(r'game-state', GameStateViewSet, basename='game-state')
router.register(r'clubs', ClubViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'managers', ManagerViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'leagues', LeagueViewSet)
router.register(r'transfer-bids', TransferBidViewSet)
router.register(r'transfer-requests', TransferRequestViewSet)
router.register(r'news', NewsStoryViewSet)
router.register(r'scout-assignments', ScoutAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('advance-week/', AdvanceWeekView.as_view(), name='advance-week'),
    path('shortlist/', ShortlistViewSet.as_view({'get': 'list'}), name='shortlist-list'),
    path('shortlist/<int:pk>/', ShortlistViewSet.as_view({'post': 'handle_player', 'delete': 'handle_player'}), name='shortlist-handle'),
]
