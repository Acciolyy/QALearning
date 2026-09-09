from django.db import models
from apps.curriculum.models import Topic

class Submission(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='submissions')
    session_seed = models.CharField(max_length=64)
    reported_behaviors = models.JSONField(default=list, help_text="Códigos de bugs reportados pelo aluno")
    active_behaviors_snapshot = models.JSONField(default=list, help_text="Códigos de bugs ativos na semente")
    precision_score = models.FloatField(default=0.0, help_text="Percentual de precisão dos reports (0 a 100)")
    recall_score = models.FloatField(default=0.0, help_text="Percentual de cobertura dos bugs ativos (0 a 100)")
    final_score = models.FloatField(default=0.0, help_text="Score final combinado (0 a 100)")
    threshold_applied = models.FloatField(default=70.0, help_text="Limiar de corte exigido pelo nível")
    is_approved = models.BooleanField(default=False, help_text="Status de aprovação")
    feedback_hint = models.TextField(blank=True, help_text="Dica pedagógica calibrada ao nível")
    feedback_summary = models.TextField(help_text="Diagnóstico técnico formativo")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Submissão de Auditoria'
        verbose_name_plural = 'Submissões de Auditoria'

    def __str__(self):
        status = "APROVADO" if self.is_approved else "PENDENTE"
        return f"[{self.topic.code}] Seed {self.session_seed} - {self.final_score:.1f}% ({status})"
