from rest_framework import serializers
from .models import Track, Module, Topic, Activity
from apps.bug_engine.models import ScopedBehavior

class ScopedBehaviorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScopedBehavior
        fields = [
            'id', 'code', 'title', 'category', 'description', 'severity',
            'is_defect', 'trigger_element', 'trigger_action', 'trigger_value',
            'expected_behavior', 'actual_behavior', 'hint_direct', 'hint_subtle'
        ]

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'activity_type', 'instructions', 'order']

class TopicListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = [
            'id', 'code', 'title', 'slug', 'target_element',
            'oracle_description', 'oracle_criteria', 'investigation_scope',
            'xp_reward', 'order'
        ]

class TopicDetailSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)
    active_behaviors = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id', 'code', 'title', 'slug', 'target_element',
            'oracle_description', 'oracle_criteria', 'investigation_scope', 'xp_reward',
            'order', 'activities', 'active_behaviors'
        ]

    def get_active_behaviors(self, obj):
        # Injetado pela view com base na semente (seed) determinística ativa
        behaviors = self.context.get('active_behaviors', [])
        return ScopedBehaviorSerializer(behaviors, many=True).data

class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicListSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'number', 'title', 'guidance_level', 'description', 'order', 'topics']

class TrackListSerializer(serializers.ModelSerializer):
    module_count = serializers.IntegerField(source='modules.count', read_only=True)
    total_topics = serializers.SerializerMethodField()
    status = serializers.CharField(source='computed_status', read_only=True)
    is_frozen = serializers.BooleanField(read_only=True)

    class Meta:
        model = Track
        fields = [
            'id', 'number', 'name', 'slug', 'category', 'description',
            'mini_site_route', 'order', 'module_count', 'total_topics', 'status', 'is_frozen'
        ]

    def get_total_topics(self, obj):
        return Topic.objects.filter(module__track=obj).count()

class TrackDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    total_topics = serializers.SerializerMethodField()
    status = serializers.CharField(source='computed_status', read_only=True)
    is_frozen = serializers.BooleanField(read_only=True)

    class Meta:
        model = Track
        fields = [
            'id', 'number', 'name', 'slug', 'category', 'description',
            'mini_site_route', 'color_theme', 'order', 'modules', 'total_topics', 'status', 'is_frozen'
        ]

    def get_total_topics(self, obj):
        return Topic.objects.filter(module__track=obj).count()
