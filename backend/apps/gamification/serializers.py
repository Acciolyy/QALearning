from rest_framework import serializers
from apps.curriculum.models import Track, Topic
from .models import AnalystProfile, PracticeActivity, Badge, UserBadge
from .services import StreakCalculationService

class StreakSummarySerializer(serializers.Serializer):
    enabled = serializers.BooleanField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    tolerance_used = serializers.BooleanField()
    last_practice_date = serializers.CharField(allow_null=True)
    is_active_today = serializers.BooleanField()
    scope = serializers.CharField()
    track_id = serializers.IntegerField(allow_null=True)

class AnalystProfileSerializer(serializers.ModelSerializer):
    callsign = serializers.CharField(source='get_callsign', read_only=True)
    rank_info = serializers.ReadOnlyField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = AnalystProfile
        fields = [
            'id',
            'callsign',
            'analyst_id',
            'total_xp',
            'streak_enabled',
            'rank_info',
            'streak',
            'created_at',
            'updated_at'
        ]

    def get_streak(self, obj):
        if not obj.streak_enabled:
            return None
        return StreakCalculationService.calculate_streak(obj.user)

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = [
            'id',
            'code',
            'name',
            'category',
            'description',
            'icon_symbol',
            'rarity',
            'xp_reward'
        ]

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = [
            'id',
            'badge',
            'awarded_at',
            'evidence_context'
        ]

class SkillTreeNodeSerializer(serializers.Serializer):
    track_id = serializers.IntegerField()
    track_number = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    category = serializers.CharField()
    total_topics = serializers.IntegerField()
    completed_topics = serializers.IntegerField()
    earned_xp = serializers.IntegerField()
    status = serializers.CharField() # HOMOLOGADO, ATIVA, DISPONIVEL, BLOQUEADO
