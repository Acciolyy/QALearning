from rest_framework import serializers
from .models import CodeSubmission

class RunCodeInputSerializer(serializers.Serializer):
    code = serializers.CharField()
    language = serializers.CharField(default='python', required=False)

class VerifyCodeInputSerializer(serializers.Serializer):
    topic_slug = serializers.CharField()
    session_seed = serializers.CharField(default='481029', required=False)
    code = serializers.CharField()
    language = serializers.CharField(default='python', required=False)

class CodeSubmissionDetailSerializer(serializers.ModelSerializer):
    topic_code = serializers.CharField(source='topic.code', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)

    class Meta:
        model = CodeSubmission
        fields = [
            'id',
            'topic_code',
            'topic_title',
            'session_seed',
            'language',
            'stdout',
            'stderr',
            'exit_code',
            'signal',
            'execution_time_ms',
            'status',
            'tests_passed',
            'tests_total',
            'score',
            'threshold_applied',
            'is_approved',
            'feedback_summary',
            'feedback_hint',
            'created_at'
        ]
