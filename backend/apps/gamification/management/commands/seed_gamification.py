from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from apps.curriculum.models import Topic, Track
from apps.gamification.models import AnalystProfile, Badge, UserBadge, PracticeActivity

class Command(BaseCommand):
    help = 'Popula catálogo de badges de QA e perfil de demonstração do analista Thiago Accioly'

    def handle(self, *args, **options):
        self.stdout.write("Semeando catálogo de badges de QA...")

        badges_data = [
            {
                'code': 'FIRST_AUTOMATION_HOMOLOGATED',
                'name': 'Automação Homologada',
                'category': 'Automação',
                'description': 'Primeiro script de validação de regras de negócio aprovado com 100% no sandbox.',
                'icon_symbol': '⚡',
                'rarity': Badge.Rarity.COMMON,
                'xp_reward': 50
            },
            {
                'code': 'PERFECT_BUG_REPORT',
                'name': 'Bug Report Homologado',
                'category': 'Precisão',
                'description': 'Auditoria manual concluída com 100% de cobertura e zero falsos alarmes.',
                'icon_symbol': '📜',
                'rarity': Badge.Rarity.NOTABLE,
                'xp_reward': 75
            },
            {
                'code': 'RAREST_BUG_DISCOVERED',
                'name': 'Rastreador de Anomalias Críticas',
                'category': 'Investigação',
                'description': 'Identificação e isolamento de anomalia de alta severidade (blocker).',
                'icon_symbol': '🎯',
                'rarity': Badge.Rarity.RARE,
                'xp_reward': 100
            },
            {
                'code': 'ZERO_FALSE_POSITIVES',
                'name': 'Precisão Cirúrgica',
                'category': 'Auditoria',
                'description': 'Rodada de auditoria de regressão concluída sem reportar falso alarme.',
                'icon_symbol': '⚖️',
                'rarity': Badge.Rarity.NOTABLE,
                'xp_reward': 75
            },
            {
                'code': 'SEVEN_DAY_HABIT',
                'name': 'Constância de Investigação',
                'category': 'Hábito',
                'description': 'Manteve 7 dias de prática técnica com respeito à janela móvel de tolerância.',
                'icon_symbol': '🛡️',
                'rarity': Badge.Rarity.RARE,
                'xp_reward': 150
            },
            {
                'code': 'CHIEF_AUDITOR',
                'name': 'Inspetor-Chefe de Fronteira',
                'category': 'Carreira',
                'description': 'Atingiu o patamar de Especialista com domínio de testes manuais e automação sandboxed.',
                'icon_symbol': '🎖️',
                'rarity': Badge.Rarity.CHIEF_INSPECTOR,
                'xp_reward': 250
            },
        ]

        for b in badges_data:
            Badge.objects.update_or_create(code=b['code'], defaults=b)

        self.stdout.write("Semeando perfil de demonstração (Thiago Accioly)...")
        user, _ = User.objects.get_or_create(
            username='thiago',
            defaults={
                'first_name': 'Thiago',
                'last_name': 'Accioly',
                'email': 'thiago@qalearning.internal'
            }
        )

        profile, _ = AnalystProfile.objects.update_or_create(
            user=user,
            defaults={
                'callsign': 'Thiago Accioly',
                'analyst_id': 'QA::ID-842',
                'total_xp': 1420,
                'streak_enabled': True
            }
        )

        # Associa badges iniciais
        b_auto = Badge.objects.get(code='FIRST_AUTOMATION_HOMOLOGATED')
        b_perf = Badge.objects.get(code='PERFECT_BUG_REPORT')
        UserBadge.objects.get_or_create(user=user, badge=b_auto, defaults={'evidence_context': {'topic': 'QA-MAN-012'}})
        UserBadge.objects.get_or_create(user=user, badge=b_perf, defaults={'evidence_context': {'topic': 'QA-MAN-011'}})

        # Popula sequência de prática recente (4 dias ativos nos últimos 5 dias: hoje, ontem, anteontem e 4 dias atrás)
        topic = Topic.objects.first()
        if topic:
            track = topic.module.track
            now = timezone.now()
            today = timezone.localtime(now).date()
            practice_days = [
                today,
                today - timedelta(days=1),
                today - timedelta(days=2),
                today - timedelta(days=4), # pulou dia 3 (dentro da janela de 7 dias = tolerância usada!)
            ]
            for d in practice_days:
                dt = timezone.make_aware(timezone.datetime(d.year, d.month, d.day, 14, 30))
                PracticeActivity.objects.get_or_create(
                    user=user,
                    date=d,
                    topic=topic,
                    track=track,
                    defaults={
                        'activity_type': PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                        'timestamp': dt,
                        'is_approved': True,
                        'score': 100.0,
                        'reference_id': 'demo-seed'
                    }
                )

        self.stdout.write(self.style.SUCCESS("Gamificação semeada com sucesso!"))
