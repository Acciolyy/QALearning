import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from apps.curriculum.models import Topic, Track

def generate_analyst_id():
    # Formato único e técnico: QA::ID-XXXXXX (6 hexadecimais aleatórios)
    return f"QA::ID-{uuid.uuid4().hex[:6].upper()}"

class AnalystProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analyst_profile')
    callsign = models.CharField(max_length=64, blank=True, default="", help_text="Nome de campo do analista")
    analyst_id = models.CharField(max_length=32, unique=True, default=generate_analyst_id, help_text="Identificador institucional único")
    total_xp = models.IntegerField(default=0, help_text="Experiência acumulada (começa estritamente em 0 para novos usuários)")
    active_topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='active_analysts', help_text="Tópico de auditoria atualmente ativo no dossiê")
    streak_enabled = models.BooleanField(default=True, help_text="Se o mecanismo de sequência de prática está ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Patamares de Carreira (Tiers de QA do Field Manual)
    LEVEL_TIERS = [
        (1, "Trainee de QA", 0, 499),
        (2, "Analista de QA Jr. I", 500, 999),
        (3, "Analista de QA Jr. II", 1000, 1999),
        (4, "Analista de QA Pleno I", 2000, 3499),
        (5, "Analista de QA Pleno II", 3500, 4999),
        (6, "Especialista de Qualidade", 5000, 999999),
    ]

    @property
    def rank_info(self):
        xp = self.total_xp
        for lvl, title, min_xp, max_xp in self.LEVEL_TIERS:
            if min_xp <= xp <= max_xp:
                span = (max_xp - min_xp) + 1
                curr_in_lvl = xp - min_xp
                pct = min(100, int((curr_in_lvl / span) * 100))
                return {
                    "level": lvl,
                    "title": title,
                    "current_xp": xp,
                    "min_xp": min_xp,
                    "max_xp": max_xp,
                    "pct": pct,
                    "xp_to_next": max(0, (max_xp + 1) - xp)
                }
        return {
            "level": 6,
            "title": "Especialista de Qualidade",
            "current_xp": xp,
            "min_xp": 5000,
            "max_xp": 5000,
            "pct": 100,
            "xp_to_next": 0
        }

    def get_callsign(self):
        if self.callsign:
            return self.callsign
        if self.user:
            full_name = self.user.get_full_name()
            if full_name:
                return full_name
            return self.user.username
        return "Analista Anônimo"

    def __str__(self):
        return f"{self.get_callsign()} ({self.analyst_id}) - {self.total_xp} XP"


class PracticeActivity(models.Model):
    class ActivityType(models.TextChoices):
        AUDIT_SUBMISSION = 'audit_submission', 'Submissão de Auditoria Manual'
        CODE_VERIFICATION = 'code_verification', 'Verificação de Automação Sandboxed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practice_activities')
    activity_type = models.CharField(max_length=32, choices=ActivityType.choices, default=ActivityType.AUDIT_SUBMISSION)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='practice_activities')
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='practice_activities')
    timestamp = models.DateTimeField(default=timezone.now)
    date = models.DateField(db_index=True, help_text="Data local da submissão no fuso horário configurado (America/Sao_Paulo)")
    is_approved = models.BooleanField(default=False, help_text="Se a submissão atingiu o limiar de aprovação")
    score = models.FloatField(default=0.0)
    reference_id = models.CharField(max_length=64, blank=True, help_text="ID da submissão de origem (Audit ou Code)")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Atividade de Prática'
        verbose_name_plural = 'Atividades de Prática'
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'track', 'date']),
        ]

    def save(self, *args, **kwargs):
        if not self.date:
            local_dt = timezone.localtime(self.timestamp)
            self.date = local_dt.date()
        super().save(*args, **kwargs)

    def __str__(self):
        status = "APROVADO" if self.is_approved else "REPROVADO"
        return f"{self.user.username} - {self.date} - {self.activity_type} ({status})"


class Badge(models.Model):
    class Rarity(models.TextChoices):
        COMMON = 'common', 'Padrão'
        NOTABLE = 'notable', 'Notável'
        RARE = 'rare', 'Raro'
        CHIEF_INSPECTOR = 'chief_inspector', 'Inspetor-Chefe'

    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    category = models.CharField(max_length=64)
    description = models.TextField()
    icon_symbol = models.CharField(max_length=16, default="🔍")
    rarity = models.CharField(max_length=32, choices=Rarity.choices, default=Rarity.COMMON)
    xp_reward = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.code}] {self.name} ({self.rarity})"


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_awards')
    awarded_at = models.DateTimeField(auto_now_add=True)
    evidence_context = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-awarded_at']

    def __str__(self):
        return f"{self.user.username} -> {self.badge.name} em {self.awarded_at.strftime('%Y-%m-%d')}"
