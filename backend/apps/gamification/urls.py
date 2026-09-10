from django.urls import path
from .views import (
    ProfileAPIView,
    ToggleStreakAPIView,
    StreakAPIView,
    BadgesAPIView,
    SkillTreeAPIView
)

app_name = 'gamification'

urlpatterns = [
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('profile/toggle-streak/', ToggleStreakAPIView.as_view(), name='toggle-streak'),
    path('streak/', StreakAPIView.as_view(), name='streak'),
    path('badges/', BadgesAPIView.as_view(), name='badges'),
    path('skill-tree/', SkillTreeAPIView.as_view(), name='skill-tree'),
]
