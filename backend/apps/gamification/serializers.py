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
    completed_topics = serializers.SerializerMethodField()
    active_topic_code = serializers.SerializerMethodField()

    class Meta:
        model = AnalystProfile
        fields = [
            'id',
            'callsign',
            'analyst_id',
            'total_xp',
            'active_topic_code',
            'completed_topics',
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

    def get_completed_topics(self, obj):
        res = {}
        # Submissoes homologadas de avaliacao e sandbox
        try:
            from apps.evaluation.models import Submission
            for sub in Submission.objects.filter(is_approved=True).select_related('topic'):
                if sub.topic:
                    res[sub.topic.code] = max(res.get(sub.topic.code, 0), int(sub.final_score))
        except Exception:
            pass
        try:
            from apps.sandbox.models import CodeSubmission
            for cs in CodeSubmission.objects.filter(is_approved=True).select_related('topic'):
                if cs.topic:
                    res[cs.topic.code] = max(res.get(cs.topic.code, 0), int(cs.score))
        except Exception:
            pass
        return res

    def get_active_topic_code(self, obj):
        if obj.active_topic:
            return obj.active_topic.code
        first_topic = Topic.objects.order_by('module__track__number', 'module__order', 'order').first()
        return first_topic.code if first_topic else 'QA-MAN-011'

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
