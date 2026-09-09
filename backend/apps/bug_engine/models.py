from django.db import models
from apps.curriculum.models import Topic

class BugSeverity(models.TextChoices):
    BLOCKER = 'blocker', 'Bloqueador (Blocker)'
    CRITICAL = 'critical', 'Crítico (Critical)'
    MAJOR = 'major', 'Grave (Major)'
    MINOR = 'minor', 'Menor (Minor)'
    TRIVIAL = 'trivial', 'Trivial (Trivial)'

class ScopedBehavior(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='behaviors')
    code = models.CharField(max_length=40, unique=True, help_text="Ex: VAL-AGE-001")
    title = models.CharField(max_length=180)
    description = models.TextField(help_text="Descrição do comportamento defeituoso ou anômalo")
    severity = models.CharField(max_length=20, choices=BugSeverity.choices, default=BugSeverity.MAJOR)
    weight = models.PositiveIntegerField(default=10, help_text="Peso no sorteio determinístico por seed")
    is_defect = models.BooleanField(default=True, help_text="True = bug/desvio de regra; False = comportamento correto de controle")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['topic', 'code']
        verbose_name = 'Comportamento Escopado'
        verbose_name_plural = 'Comportamentos Escopados'

    def __str__(self):
        return f"[{self.topic.code}] {self.code} - {self.title}"
