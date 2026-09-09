from django.db import models
from apps.curriculum.models import Topic

class CodeSubmission(models.Model):
    class Status(models.TextChoices):
        PASSED = 'passed', 'Aprovado'
        FAILED = 'failed', 'Reprovado'
        TIMEOUT = 'timeout', 'Tempo Limite Excedido'
        MEMORY_LIMIT = 'memory_limit', 'Limite de Memória Excedido'
        RUNTIME_ERROR = 'runtime_error', 'Erro de Execução'

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='code_submissions')
    session_seed = models.CharField(max_length=64, default='481029')
    language = models.CharField(max_length=32, default='python')
    code = models.TextField()
    stdout = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    exit_code = models.IntegerField(null=True, blank=True)
    signal = models.CharField(max_length=32, blank=True, null=True)
    execution_time_ms = models.IntegerField(null=True, blank=True)
    
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.FAILED)
    tests_passed = models.IntegerField(default=0)
    tests_total = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)
    threshold_applied = models.FloatField(default=70.0)
    is_approved = models.BooleanField(default=False)
    
    feedback_summary = models.TextField(blank=True)
    feedback_hint = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"CodeSub[{self.topic.code}] {self.status} ({self.score:.1f}%)"
