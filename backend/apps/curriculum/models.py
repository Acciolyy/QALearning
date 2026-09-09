from django.db import models

class TrackCategory(models.TextChoices):
    FOUNDATIONS = 'foundations', 'Fundações & Processos'
    STRUCTURE = 'structure', 'Estrutura & Lógica Interna'
    PROTOCOLS = 'protocols', 'Protocolos & APIs'
    AUTOMATION = 'automation', 'Automação & Engenharia'
    SPECIALTIES = 'specialties', 'Especialidades Técnicas'

class Track(models.Model):
    number = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    category = models.CharField(max_length=30, choices=TrackCategory.choices, default=TrackCategory.FOUNDATIONS)
    description = models.TextField()
    mini_site_route = models.CharField(max_length=200, help_text="Rota do iframe sandboxed (ex: /mini-sites/manual-vault/)")
    color_theme = models.CharField(max_length=60, default="default-track")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['number']
        verbose_name = 'Trilha'
        verbose_name_plural = 'Trilhas'

    def __str__(self):
        return f"{self.number:02d}. {self.name}"

class GuidanceLevel(models.TextChoices):
    DIRECT = 'direct', 'Pistas Diretas (Iniciação)'
    SUBTLE = 'subtle', 'Pistas Sutis (Intermediário)'
    AUTONOMOUS = 'autonomous', 'Sem Pistas (Autonomia Real)'

class Module(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='modules')
    number = models.PositiveIntegerField()
    title = models.CharField(max_length=160)
    guidance_level = models.CharField(max_length=20, choices=GuidanceLevel.choices, default=GuidanceLevel.DIRECT)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['track', 'number']
        unique_together = ('track', 'number')
        verbose_name = 'Módulo'
        verbose_name_plural = 'Módulos'

    def __str__(self):
        return f"Trilha {self.track.number:02d} - Módulo {self.number:02d}: {self.title}"

class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    code = models.CharField(max_length=30, unique=True, help_text="Ex: QA-MAN-012")
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=180, unique=True)
    target_element = models.CharField(max_length=150, blank=True, help_text="Seletor alvo sob teste (ex: input#user-age)")
    oracle_description = models.TextField(help_text="Comportamento esperado / Critérios de aceite")
    oracle_criteria = models.JSONField(default=list, blank=True, help_text="Critérios estruturados de aceite")
    investigation_scope = models.TextField(help_text="O que o aluno vai investigar — NUNCA o que vai encontrar")
    xp_reward = models.PositiveIntegerField(default=75)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['module', 'order']
        verbose_name = 'Tópico'
        verbose_name_plural = 'Tópicos'

    def __str__(self):
        return f"[{self.code}] {self.title}"

class ActivityType(models.TextChoices):
    BUG_HUNT = 'bug_hunt', 'Caça a Comportamentos / Interação'
    BUG_REPORT = 'bug_report', 'Escrita de Bug Report'
    CODE_AUTOMATION = 'code_automation', 'Script de Automação (Playwright)'
    UNIT_TEST = 'unit_test', 'Teste Unitário'
    SQL_QUERY = 'sql_query', 'Consulta SQL'

class Activity(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=180)
    activity_type = models.CharField(max_length=30, choices=ActivityType.choices, default=ActivityType.BUG_HUNT)
    instructions = models.TextField()
    harness_code = models.TextField(blank=True, help_text="Suite oculta de validação para o Piston")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['topic', 'order']
        verbose_name = 'Atividade'
        verbose_name_plural = 'Atividades'

    def __str__(self):
        return f"{self.topic.code} - {self.title}"
