from datetime import timedelta, date
from typing import Dict, Any, Optional, List, Set
from django.utils import timezone
from django.contrib.auth.models import User
from apps.curriculum.models import Topic, Track
from .models import AnalystProfile, PracticeActivity, Badge, UserBadge

class StreakCalculationService:
    """
    Motor de Sequência de Prática conforme Seção 7 e Adendo de Gamificação:
    - O streak mede presença, não desempenho (submissões aprovadas ou reprovadas).
    - 1 dia de tolerância por semana corrida (janela móvel de 7 dias).
    - Tolerância se recompõe conforme a janela avança (não é acumulável nem comprável).
    - Escopo duplo: Global e por Trilha.
    - Se desabilitado nas configurações, não é computado e retorna dados zerados/ocultos.
    """

    @classmethod
    def calculate_streak(
        cls,
        user: User,
        track: Optional[Track] = None,
        reference_date: Optional[date] = None
    ) -> Dict[str, Any]:
        profile = getattr(user, 'analyst_profile', None)
        if profile and not profile.streak_enabled:
            return {
                'enabled': False,
                'current_streak': 0,
                'longest_streak': 0,
                'tolerance_used': False,
                'last_practice_date': None,
                'is_active_today': False,
                'scope': 'track' if track else 'global',
                'track_id': track.id if track else None
            }

        ref_date = reference_date or timezone.localtime().date()

        # Query de atividades de prática
        qs = PracticeActivity.objects.filter(user=user)
        if track:
            qs = qs.filter(track=track)

        practice_dates: Set[date] = set(qs.values_list('date', flat=True))

        if not practice_dates:
            return {
                'enabled': True,
                'current_streak': 0,
                'longest_streak': 0,
                'tolerance_used': False,
                'last_practice_date': None,
                'is_active_today': False,
                'scope': 'track' if track else 'global',
                'track_id': track.id if track else None
            }

        is_active_today = (ref_date in practice_dates)
        sorted_dates = sorted(practice_dates)
        last_practice_date = sorted_dates[-1]

        # Determina o ponto de partida do streak ativo:
        # Se praticou hoje: começa de hoje
        # Se não praticou hoje, mas praticou ontem: começa de ontem (hoje está em aberto)
        # Se não praticou hoje nem ontem:
        #   Se anteontem praticou, ontem foi o único dia perdido na janela atual (tolerância em uso hoje)
        #   Se anteontem também não praticou: streak quebrado (0)
        if is_active_today:
            start_day = ref_date
        elif (ref_date - timedelta(days=1)) in practice_dates:
            start_day = ref_date - timedelta(days=1)
        elif (ref_date - timedelta(days=2)) in practice_dates:
            # Ontem foi pulado, mas anteontem praticou -> tolerância cobre ontem
            start_day = ref_date - timedelta(days=1) # ontem entra como tolerado
        else:
            # 2 dias seguidos sem atividade recente -> streak quebrado
            start_day = None

        current_streak_days = 0
        tolerance_used_in_window = False

        if start_day:
            curr = start_day
            missed_dates_in_streak: List[date] = []
            active_days_count = 0

            # Retrocede dia a dia avaliando a janela móvel de 7 dias
            while True:
                if curr in practice_dates:
                    active_days_count += 1
                else:
                    # Dia não praticado encontrado. Verifica se viola a regra de tolerância:
                    # Não pode haver outro dia pulado a menos de 7 dias deste dia (|d1 - d2| <= 6)
                    conflict = False
                    for prev_missed in missed_dates_in_streak:
                        if abs((curr - prev_missed).days) <= 6:
                            conflict = True
                            break

                    if conflict:
                        # Segundo dia pulado dentro de uma mesma janela móvel de 7 dias -> quebra a sequência!
                        break
                    else:
                        # Primeiro dia pulado na janela -> tolerado!
                        missed_dates_in_streak.append(curr)

                # Verifica se há atividade anterior para continuar retrocedendo
                # Se curr for anterior à primeira atividade do usuário, interrompe
                if curr < sorted_dates[0]:
                    break

                curr -= timedelta(days=1)

            current_streak_days = active_days_count

            # Um dia pulado só consome tolerância se foi efetivamente 'pontilhado/superado'
            # pela sequência ativa (ou seja, se há dias ativos anteriores a ele na sequência).
            if active_days_count > 0:
                # Localiza a data mais antiga ativa da sequência atual
                active_in_streak = [d for d in practice_dates if d <= start_day and (curr is None or d > curr)]
                if active_in_streak:
                    earliest_active = min(active_in_streak)
                    # Apenas dias pulados posteriores ao dia ativo mais antigo foram tolerados pela sequência
                    bridged_missed_days = [m for m in missed_dates_in_streak if m > earliest_active]
                    
                    current_7day_window_start = ref_date - timedelta(days=6)
                    for m in bridged_missed_days:
                        if current_7day_window_start <= m <= ref_date:
                            tolerance_used_in_window = True
                            break

        # Cálculo simplificado de recorde histórico (longest_streak)
        # Se o streak atual for maior que qualquer streak passado, ele é o longest
        longest_streak = max(current_streak_days, 1 if practice_dates else 0)

        return {
            'enabled': True,
            'current_streak': current_streak_days,
            'longest_streak': longest_streak,
            'tolerance_used': tolerance_used_in_window,
            'last_practice_date': last_practice_date.isoformat(),
            'is_active_today': is_active_today,
            'scope': 'track' if track else 'global',
            'track_id': track.id if track else None
        }


class GamificationService:
    """
    Serviço de orquestração de gamificação:
    - Perfil do Analista (criação automática sob demanda, sem dados de mockup fixos)
    - Concessão de XP e cálculo de patamar de carreira
    - Registro de Atividades de Prática no fuso local America/Sao_Paulo
    - Avaliação de Gatilhos de Badges e Selos de Inspeção
    """

    @classmethod
    def get_or_create_profile(cls, user: User) -> AnalystProfile:
        profile, created = AnalystProfile.objects.get_or_create(
            user=user,
            defaults={
                'callsign': user.get_full_name() or user.username,
                'total_xp': 0, # Começa estritamente em 0 conforme reparo do usuário
                'streak_enabled': True
            }
        )
        return profile

    @classmethod
    def record_submission_activity(
        cls,
        user: User,
        activity_type: str,
        topic: Topic,
        is_approved: bool,
        score: float,
        reference_id: str,
        timestamp=None
    ) -> PracticeActivity:
        """
        Registra uma atividade de prática real (manual ou código, aprovada ou reprovada).
        A data é convertida estritamente para o fuso local configurado (America/Sao_Paulo).
        """
        ts = timestamp or timezone.now()
        local_date = timezone.localtime(ts).date()
        track = topic.module.track

        activity = PracticeActivity.objects.create(
            user=user,
            activity_type=activity_type,
            topic=topic,
            track=track,
            timestamp=ts,
            date=local_date,
            is_approved=is_approved,
            score=score,
            reference_id=str(reference_id)
        )

        # Concessão de XP pedagógico
        profile = cls.get_or_create_profile(user)
        xp_gain = 0
        if activity_type == PracticeActivity.ActivityType.AUDIT_SUBMISSION:
            xp_gain = 75 if is_approved else 15
        elif activity_type == PracticeActivity.ActivityType.CODE_VERIFICATION:
            xp_gain = 100 if is_approved else 20

        if xp_gain > 0:
            profile.total_xp += xp_gain
            profile.save()

        # Avaliação de Badges de QA
        cls._evaluate_badges(user=user, activity=activity, profile=profile)

        return activity

    @classmethod
    def _evaluate_badges(cls, user: User, activity: PracticeActivity, profile: AnalystProfile):
        """Avalia regras de concessão de selos de inspeção técnicos."""
        # 1. Primeira Automação Homologada
        if activity.activity_type == PracticeActivity.ActivityType.CODE_VERIFICATION and activity.is_approved:
            cls.award_badge_if_eligible(user, 'FIRST_AUTOMATION_HOMOLOGATED', {
                'topic': activity.topic.code,
                'score': activity.score
            })

        # 2. Bug Report Perfeito (100% de pontuação)
        if activity.activity_type == PracticeActivity.ActivityType.AUDIT_SUBMISSION and activity.score >= 100.0:
            cls.award_badge_if_eligible(user, 'PERFECT_BUG_REPORT', {
                'topic': activity.topic.code,
                'score': activity.score
            })

        # 3. Precisão Cirúrgica (Módulo de Regressão com 100% sem falsos positivos)
        if activity.activity_type == PracticeActivity.ActivityType.AUDIT_SUBMISSION and activity.is_approved:
            if 'regressao' in activity.topic.slug or 'REG' in activity.topic.code:
                cls.award_badge_if_eligible(user, 'ZERO_FALSE_POSITIVES', {
                    'topic': activity.topic.code
                })

        # 4. Hábito de 7 Dias
        streak_info = StreakCalculationService.calculate_streak(user)
        if streak_info['current_streak'] >= 7:
            cls.award_badge_if_eligible(user, 'SEVEN_DAY_HABIT', {
                'streak_days': streak_info['current_streak']
            })

    @classmethod
    def award_badge_if_eligible(cls, user: User, badge_code: str, evidence: dict = None) -> Optional[UserBadge]:
        badge = Badge.objects.filter(code=badge_code).first()
        if not badge:
            return None
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            return None

        ub = UserBadge.objects.create(
            user=user,
            badge=badge,
            evidence_context=evidence or {}
        )
        # XP bônus da badge
        if badge.xp_reward > 0:
            profile = cls.get_or_create_profile(user)
            profile.total_xp += badge.xp_reward
            profile.save()
        return ub
