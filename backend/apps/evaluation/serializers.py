from rest_framework import serializers
from .models import Submission

class SubmissionInputSerializer(serializers.Serializer):
    topic_slug = serializers.CharField(required=True)
    session_seed = serializers.CharField(required=True)
    reported_behaviors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    submission_type = serializers.CharField(required=False, default="behavior_list")
    bug_report = serializers.DictField(required=False, default=dict)

class SubmissionDetailSerializer(serializers.ModelSerializer):
    topic_code = serializers.CharField(source='topic.code', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    guidance_level = serializers.CharField(source='topic.module.guidance_level', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'topic_code', 'topic_title', 'guidance_level',
            'session_seed', 'reported_behaviors', 'active_behaviors_snapshot',
            'precision_score', 'recall_score', 'final_score',
            'threshold_applied', 'is_approved', 'feedback_hint',
            'feedback_summary', 'created_at'
        ]
