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
    active_track_slug = serializers.SerializerMethodField()
    active_track_number = serializers.SerializerMethodField()
    tracks_progress = serializers.SerializerMethodField()

    class Meta:
        model = AnalystProfile
        fields = [
            'id',
            'callsign',
            'analyst_id',
            'total_xp',
            'active_topic_code',
            'active_track_slug',
            'active_track_number',
            'completed_topics',
            'tracks_progress',
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
        """
        Retorna os tópicos homologados com pontuação máxima alcançada pelo analista.
        Regra de Integridade: Apenas submissões efetivamente aprovadas (is_approved=True)
        são computadas. Submissões de código no sandbox só contam para tópicos que de fato
        possuem atividades de código/automação, impedindo contaminação cruzada em tópicos manuais.
        """
        res = {}
        try:
            from apps.evaluation.models import Submission
            for sub in Submission.objects.filter(is_approved=True).select_related('topic'):
                if sub.topic:
                    res[sub.topic.code] = max(res.get(sub.topic.code, 0), int(sub.final_score))
        except Exception:
            pass
        try:
            from apps.sandbox.models import CodeSubmission
            from apps.curriculum.models import ActivityType
            for cs in CodeSubmission.objects.filter(is_approved=True).select_related('topic'):
                if cs.topic:
                    # Tópicos manuais puros (como QA-MAN-011) não possuem atividade de automação
                    has_code_activity = cs.topic.activities.filter(
                        activity_type__in=[ActivityType.CODE_AUTOMATION, ActivityType.UNIT_TEST]
                    ).exists()
                    # Trilha de automação/estrutura ou tópico com código explícito
                    if has_code_activity or (cs.topic.module and cs.topic.module.track and cs.topic.module.track.number not in [0, 1]):
                        res[cs.topic.code] = max(res.get(cs.topic.code, 0), int(cs.score))
        except Exception:
            pass
        return res

    def get_active_topic_code(self, obj):
        if obj.active_topic:
            return obj.active_topic.code
        first_topic = Topic.objects.order_by('module__track__number', 'module__order', 'order').first()
        return first_topic.code if first_topic else 'QA-MAN-011'

    def get_active_track_slug(self, obj):
        if obj.active_topic and obj.active_topic.module and obj.active_topic.module.track:
            return obj.active_topic.module.track.slug
        first = Topic.objects.order_by('module__track__number', 'module__order', 'order').first()
        return first.module.track.slug if first and first.module and first.module.track else 'testes-manuais'

    def get_active_track_number(self, obj):
        if obj.active_topic and obj.active_topic.module and obj.active_topic.module.track:
            return obj.active_topic.module.track.number
        first = Topic.objects.order_by('module__track__number', 'module__order', 'order').first()
        return first.module.track.number if first and first.module and first.module.track else 1

    def get_tracks_progress(self, obj):
        """
        Calcula o progresso consolidado por trilha com base estrita nas
        submissoes aprovadas do analista (reutilizando get_completed_topics).
        """
        completed = self.get_completed_topics(obj)
        res = {}
        for track in Track.objects.all().order_by('number'):
            track_topic_codes = list(Topic.objects.filter(module__track=track).values_list('code', flat=True))
            total_count = len(track_topic_codes)
            completed_count = sum(1 for code in track_topic_codes if code in completed)
            percentage = round((completed_count / total_count * 100)) if total_count > 0 else 0
            res[track.slug] = {
                'track_number': track.number,
                'total_topics': total_count,
                'completed_topics': completed_count,
                'progress_percent': percentage,
            }
        return res

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
