from datetime import date, timedelta
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.utils import timezone
import zoneinfo

from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.gamification.models import AnalystProfile, PracticeActivity, Badge, UserBadge
from apps.gamification.services import GamificationService, StreakCalculationService
from apps.evaluation.services import EvaluationService
from apps.sandbox.services import CodeEvaluationService

class GamificationEngineTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='qa_tester_01',
            first_name='Carlos',
            last_name='Silva',
            email='carlos@qa.internal'
        )

        self.track1 = Track.objects.create(
            number=1,
            name="Testes Manuais",
            slug="testes-manuais",
            category=TrackCategory.FOUNDATIONS,
            description="Trilha manual"
        )
        self.module1 = Module.objects.create(
            track=self.track1,
            number=1,
            title="Fundamentos",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1"
        )
        self.topic1 = Topic.objects.create(
            module=self.module1,
            code="QA-MAN-012",
            title="Limites de Idade",
            slug="limites-idade",
            oracle_description="18 a 120 anos"
        )

        self.track2 = Track.objects.create(
            number=2,
            name="Bug Reports",
            slug="bug-reports",
            category=TrackCategory.STRUCTURE,
            description="Trilha 2"
        )
        self.module2 = Module.objects.create(
            track=self.track2,
            number=1,
            title="Comunicação Técnica",
            guidance_level=GuidanceLevel.SUBTLE,
            description="Módulo 2"
        )
        self.topic2 = Topic.objects.create(
            module=self.module2,
            code="QA-REP-021",
            title="Relatórios de Defeito",
            slug="relatorios-defeito",
            oracle_description="Critérios de clareza"
        )

        # Badges básicas
        Badge.objects.create(
            code='FIRST_AUTOMATION_HOMOLOGATED',
            name='Automação Homologada',
            category='Automação',
            description='Primeira automação 100%',
            rarity=Badge.Rarity.COMMON,
            xp_reward=50
        )
        Badge.objects.create(
            code='PERFECT_BUG_REPORT',
            name='Bug Report Perfeito',
            category='Precisão',
            description='100% de precisão e recall',
            rarity=Badge.Rarity.NOTABLE,
            xp_reward=75
        )

    def test_reparo_1_analyst_profile_starts_clean_without_mockup_values(self):
        """
        Reparo 1 do usuário:
        Novo usuário deve nascer estritamente com total_xp = 0, callsign derivado
        do próprio usuário e analyst_id único gerado dinamicamente (nunca mockups).
        """
        profile = GamificationService.get_or_create_profile(self.user)
        self.assertEqual(profile.total_xp, 0)
        self.assertEqual(profile.get_callsign(), "Carlos Silva")
        self.assertTrue(profile.analyst_id.startswith("QA::ID-"))
        self.assertNotEqual(profile.analyst_id, "QA::ID-842")
        self.assertEqual(profile.rank_info["level"], 1)
        self.assertEqual(profile.rank_info["title"], "Trainee de QA")

    def test_reparo_2_timezone_boundary_at_midnight(self):
        """
        Reparo 2 do usuário:
        Prova que uma submissão feita às 23:45 no fuso America/Sao_Paulo (que equivale
        às 02:45 do dia seguinte em UTC) é gravada na data local correta que o aluno espera.
        """
        sao_paulo_tz = zoneinfo.ZoneInfo("America/Sao_Paulo")
        # 23:45 em São Paulo no dia 2026-09-09 (equivale a 2026-09-10 02:45 UTC)
        local_time_near_midnight = timezone.datetime(2026, 9, 9, 23, 45, 0, tzinfo=sao_paulo_tz)

        activity = GamificationService.record_submission_activity(
            user=self.user,
            activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
            topic=self.topic1,
            is_approved=True,
            score=100.0,
            reference_id="sub-midnight-test",
            timestamp=local_time_near_midnight
        )

        # O DateField date DEVE ser 2026-09-09, não 2026-09-10
        self.assertEqual(activity.date, date(2026, 9, 9))
        self.assertNotEqual(activity.date, date(2026, 9, 10))

    def test_failed_submission_counts_for_practice_streak(self):
        """
        Regra 1 do Adendo:
        O streak mede presença, não desempenho. Reprovar conta como prática legítima.
        """
        ref_date = date(2026, 9, 9)
        dt = timezone.make_aware(timezone.datetime(2026, 9, 9, 14, 0))

        # Submissão reprovada (score 20%)
        activity = GamificationService.record_submission_activity(
            user=self.user,
            activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
            topic=self.topic1,
            is_approved=False,
            score=20.0,
            reference_id="failed-sub-1",
            timestamp=dt
        )
        self.assertFalse(activity.is_approved)

        streak = StreakCalculationService.calculate_streak(user=self.user, reference_date=ref_date)
        self.assertEqual(streak['current_streak'], 1)
        self.assertTrue(streak['is_active_today'])

    def test_streak_tolerance_one_day_in_seven_day_window(self):
        """
        Regra 2 do Adendo:
        Pular 1 dia dentro de uma janela móvel de 7 dias utiliza a tolerância e NÃO quebra a sequência.
        """
        ref_date = date(2026, 9, 7) # Segunda-feira
        # Praticou dia 1, 2, 3, pulou dia 4, praticou dia 5, 6, 7
        practice_days = [
            date(2026, 9, 1),
            date(2026, 9, 2),
            date(2026, 9, 3),
            # date(2026, 9, 4) foi pulado!
            date(2026, 9, 5),
            date(2026, 9, 6),
            date(2026, 9, 7),
        ]
        for d in practice_days:
            dt = timezone.make_aware(timezone.datetime(d.year, d.month, d.day, 10, 0))
            PracticeActivity.objects.create(
                user=self.user,
                activity_type=PracticeActivity.ActivityType.CODE_VERIFICATION,
                topic=self.topic1,
                track=self.track1,
                date=d,
                timestamp=dt,
                is_approved=True,
                score=100.0
            )

        streak = StreakCalculationService.calculate_streak(user=self.user, reference_date=ref_date)
        # 6 dias praticados ativos mantidos graças à tolerância do dia 4
        self.assertEqual(streak['current_streak'], 6)
        self.assertTrue(streak['tolerance_used'], "A tolerância da semana deve constar como utilizada.")

    def test_streak_breaks_on_second_missed_day_in_seven_day_window(self):
        """
        Regra 2 do Adendo:
        Pular 2 dias dentro da mesma janela de 7 dias QUEBRA a sequência.
        """
        ref_date = date(2026, 9, 7)
        # Praticou dia 1, 2, pulou dia 3 e pulou dia 4, praticou dia 5, 6, 7
        practice_days = [
            date(2026, 9, 1),
            date(2026, 9, 2),
            # Pulou dia 3
            # Pulou dia 4
            date(2026, 9, 5),
            date(2026, 9, 6),
            date(2026, 9, 7),
        ]
        for d in practice_days:
            dt = timezone.make_aware(timezone.datetime(d.year, d.month, d.day, 10, 0))
            PracticeActivity.objects.create(
                user=self.user,
                activity_type=PracticeActivity.ActivityType.CODE_VERIFICATION,
                topic=self.topic1,
                track=self.track1,
                date=d,
                timestamp=dt,
                is_approved=True,
                score=100.0
            )

        streak = StreakCalculationService.calculate_streak(user=self.user, reference_date=ref_date)
        # Como pulou dia 3 e 4, a sequência retroativa quebrou no dia 4. O streak ativo conta a partir do dia 5 (5, 6, 7 = 3 dias)
        self.assertEqual(streak['current_streak'], 3)
        self.assertFalse(streak['tolerance_used'], "Na janela recente dos 3 dias não houve dia pulado tolerado.")

    def test_tolerance_replenishes_as_window_advances(self):
        """
        Regra 2 do Adendo:
        A tolerância se recompõe conforme a janela móvel avança (não é saldo fixo).
        Um dia pulado há 8 dias atrás não consome mais a tolerância da janela atual [t-6, t].
        """
        ref_date = date(2026, 9, 15)
        # Dia 6 foi pulado (9 dias atrás). Dos dias 7 ao 15, o aluno praticou todos os dias!
        practice_days = [
            date(2026, 9, 5),
            # date(2026, 9, 6) pulado
            date(2026, 9, 7),
            date(2026, 9, 8),
            date(2026, 9, 9),
            date(2026, 9, 10),
            date(2026, 9, 11),
            date(2026, 9, 12),
            date(2026, 9, 13),
            date(2026, 9, 14),
            date(2026, 9, 15),
        ]
        for d in practice_days:
            dt = timezone.make_aware(timezone.datetime(d.year, d.month, d.day, 10, 0))
            PracticeActivity.objects.create(
                user=self.user,
                activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                topic=self.topic1,
                track=self.track1,
                date=d,
                timestamp=dt,
                is_approved=True,
                score=100.0
            )

        streak = StreakCalculationService.calculate_streak(user=self.user, reference_date=ref_date)
        self.assertEqual(streak['current_streak'], 10)
        # Como nos últimos 7 dias [9 ao 15] todos os dias foram praticados, a tolerância está DISPONÍVEL!
        self.assertFalse(streak['tolerance_used'], "Tolerância deve estar disponível pois o dia pulado ficou para trás da janela móvel.")

    def test_dual_scope_global_and_track_independent(self):
        """
        Regra 3 do Adendo:
        Sequência global (todas as trilhas) e sequência por trilha (foco) são independentes.
        """
        ref_date = date(2026, 9, 3)
        # Dia 1: Trilha 1
        # Dia 2: Trilha 2
        # Dia 3: Trilha 1
        sub_plan = [
            (date(2026, 9, 1), self.topic1, self.track1),
            (date(2026, 9, 2), self.topic2, self.track2),
            (date(2026, 9, 3), self.topic1, self.track1),
        ]
        for d, top, trk in sub_plan:
            dt = timezone.make_aware(timezone.datetime(d.year, d.month, d.day, 11, 0))
            PracticeActivity.objects.create(
                user=self.user,
                activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                topic=top,
                track=trk,
                date=d,
                timestamp=dt,
                is_approved=True,
                score=100.0
            )

        global_streak = StreakCalculationService.calculate_streak(user=self.user, reference_date=ref_date)
        track1_streak = StreakCalculationService.calculate_streak(user=self.user, track=self.track1, reference_date=ref_date)
        track2_streak = StreakCalculationService.calculate_streak(user=self.user, track=self.track2, reference_date=ref_date)

        # Global praticou dias 1, 2, 3 -> streak de 3 dias
        self.assertEqual(global_streak['current_streak'], 3)
        # Trilha 1 praticou dia 1 e 3 (dia 2 foi tolerado) -> streak de 2 dias na trilha 1 com tolerância usada
        self.assertEqual(track1_streak['current_streak'], 2)
        self.assertTrue(track1_streak['tolerance_used'])
        # Trilha 2 praticou dia 2, não praticou hoje (dia 3) -> ontem foi o último dia
        self.assertEqual(track2_streak['current_streak'], 1)

    def test_streak_can_be_disabled_in_settings_and_omitted_from_api(self):
        """
        Regra 5 do Adendo:
        O streak pode ser desabilitado nas configurações. Desligado, ele não é computado e é omitido.
        """
        profile = GamificationService.get_or_create_profile(self.user)
        self.assertTrue(profile.streak_enabled)

        # Desativa via API
        response = self.client.post('/api/v1/gamification/profile/toggle-streak/', {'enabled': False}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['streak_enabled'])

        # Consulta Perfil: streak deve vir nulo
        res_profile = self.client.get('/api/v1/gamification/profile/')
        self.assertEqual(res_profile.status_code, 200)
        self.assertIsNone(res_profile.json()['streak'])
        self.assertFalse(res_profile.json()['streak_enabled'])

        # Consulta Endpoint de Streak diretamente: deve retornar enabled=False
        res_streak = self.client.get('/api/v1/gamification/streak/')
        self.assertEqual(res_streak.status_code, 200)
        self.assertFalse(res_streak.json()['enabled'])

    def test_badges_and_skill_tree_api_endpoints(self):
        """Valida que endpoints de Badges e Skill Tree retornam catálogo sem erros."""
        res_badges = self.client.get('/api/v1/gamification/badges/')
        self.assertEqual(res_badges.status_code, 200)
        data_b = res_badges.json()
        self.assertGreaterEqual(data_b['total_badges'], 2)

        res_tree = self.client.get('/api/v1/gamification/skill-tree/')
        self.assertEqual(res_tree.status_code, 200)
        data_t = res_tree.json()
        self.assertIn('tracks', data_t)
        self.assertEqual(len(data_t['tracks']), 2)

    def test_productive_persistence_badges_awarded_on_iteration(self):
        """
        Calibragem de Produto: O sistema reconhece persistência produtiva.
        Aluno que reprova 3 vezes num tópico e depois o homologa ganha TENACIOUS_DEBUGGER.
        Aluno que realiza 5 ensaios no mesmo tópico ganha METHODICAL_EXPLORATION.
        """
        Badge.objects.create(
            code='TENACIOUS_DEBUGGER',
            name='Depuração Tenaz',
            category='Resiliência',
            description='Homologou após 3 falhas',
            rarity=Badge.Rarity.RARE,
            xp_reward=100
        )
        Badge.objects.create(
            code='METHODICAL_EXPLORATION',
            name='Investigação Exaustiva',
            category='Investigação',
            description='5 ensaios no tópico',
            rarity=Badge.Rarity.NOTABLE,
            xp_reward=75
        )

        # 3 submissões reprovadas no topic1
        for i in range(3):
            GamificationService.record_submission_activity(
                user=self.user,
                activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                topic=self.topic1,
                is_approved=False,
                score=30.0,
                reference_id=f"fail-{i}"
            )

        # Ainda não homologou, não deve ter TENACIOUS_DEBUGGER
        self.assertFalse(UserBadge.objects.filter(user=self.user, badge__code='TENACIOUS_DEBUGGER').exists())

        # 4ª submissão: o aluno finalmente APROVA o tópico!
        GamificationService.record_submission_activity(
            user=self.user,
            activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
            topic=self.topic1,
            is_approved=True,
            score=100.0,
            reference_id="pass-final"
        )

        # Agora a badge TENACIOUS_DEBUGGER deve ter sido concedida!
        self.assertTrue(UserBadge.objects.filter(user=self.user, badge__code='TENACIOUS_DEBUGGER').exists())

        # 5ª submissão: ensaio adicional no mesmo tópico atingindo total de 5
        GamificationService.record_submission_activity(
            user=self.user,
            activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
            topic=self.topic1,
            is_approved=True,
            score=100.0,
            reference_id="pass-extra-5"
        )

        # Atingiu 5 ensaios no topic1 -> badge METHODICAL_EXPLORATION concedida!
        self.assertTrue(UserBadge.objects.filter(user=self.user, badge__code='METHODICAL_EXPLORATION').exists())

    def test_patch_profile_scopes_strictly_to_request_user_and_ignores_foreign_identifiers(self):
        """
        Seguranca de Escopo (ADR-0017):
        Testa que o endpoint PATCH /api/v1/gamification/profile/ ignora qualquer id de perfil,
        id de usuario ou analyst_id enviado no payload. Quando autenticado via force_login,
        opera estritamente no escopo da sessao e nao permite sequestro de perfis de terceiros.
        """
        # Cria usuario B com seu perfil independente
        user_b = User.objects.create_user(
            username='analyst_bob',
            first_name='Bob',
            last_name='Fischer',
            email='bob@qa.internal'
        )
        profile_a = GamificationService.get_or_create_profile(self.user)
        profile_b = GamificationService.get_or_create_profile(user_b)

        profile_a.active_topic = self.topic1
        profile_a.save()
        profile_b.active_topic = self.topic1
        profile_b.save()

        # Autentica como Usuario A (Carlos)
        self.client.force_login(self.user)

        # Envia payload hostil com IDs do Usuario B tentando alterar o perfil do Bob
        malicious_payload = {
            "active_topic_code": self.topic2.code,
            "id": profile_b.id,
            "user_id": user_b.id,
            "profile_id": profile_b.id,
            "analyst_id": profile_b.analyst_id
        }
        response = self.client.patch(
            '/api/v1/gamification/profile/',
            data=malicious_payload,
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)

        # Recarrega do banco
        profile_a.refresh_from_db()
        profile_b.refresh_from_db()

        # O perfil do usuario autenticado A foi atualizado para o topic2
        self.assertEqual(profile_a.active_topic, self.topic2)
        # O perfil do usuario B PERMANECEU INTACTO no topic1 (sem sequestro de sessao)
        self.assertEqual(profile_b.active_topic, self.topic1)

        # Valida que topico inexistente retorna 400 Bad Request
        bad_response = self.client.patch(
            '/api/v1/gamification/profile/',
            data={"active_topic_code": "QA-INVALID-CODE"},
            content_type='application/json'
        )
        self.assertEqual(bad_response.status_code, 400)

    def test_completed_topics_excludes_unapproved_topics_and_spurious_code_submissions(self):
        """
        Garante a integridade do completed_topics:
        1. Topicos sem submissoes aprovadas (como QA-MAN-011) ou apenas com submissoes
           reprovadas NAO constam em completed_topics.
        2. Submissoes de codigo espurias em topicos puramente manuais (Trilha 1 sem atividade
           de automacao) sao ignoradas e nao homologam indevidamente o caso.
        3. Apenas topicos com submissoes efetivamente aprovadas (is_approved=True) constam
           com suas respectivas notas.
        """
        from apps.evaluation.models import Submission
        from apps.sandbox.models import CodeSubmission
        from apps.gamification.serializers import AnalystProfileSerializer

        # Topico manual sob teste ativo (QA-MAN-011)
        topic_man_11 = Topic.objects.create(
            module=self.module1,
            code="QA-MAN-011",
            title="Formulario de Cadastro",
            slug="form-cadastro",
            oracle_description="Validar campos obrigatorios"
        )

        # Submissao de avaliacao REPROVADA (nao homologada)
        Submission.objects.create(
            topic=topic_man_11,
            session_seed="seed-11-test",
            reported_behaviors=["BR-273"],
            active_behaviors_snapshot=["BR-273", "BR-274", "BR-275"],
            final_score=60.0,
            is_approved=False
        )

        # Submissao de codigo espuria criada indevidamente com topic=topic_man_11 (trilha 1 manual)
        CodeSubmission.objects.create(
            topic=topic_man_11,
            session_seed="seed-spurious",
            code="print('exploit')",
            score=100.0,
            is_approved=True
        )

        # Topico 2 com submissao de avaliacao APROVADA
        Submission.objects.create(
            topic=self.topic2,
            session_seed="seed-approved-21",
            reported_behaviors=["BUG-1"],
            active_behaviors_snapshot=["BUG-1"],
            final_score=85.0,
            is_approved=True
        )

        profile = GamificationService.get_or_create_profile(self.user)
        profile.active_topic = topic_man_11
        profile.save()

        serializer = AnalystProfileSerializer(profile)
        completed = serializer.data['completed_topics']

        # QA-MAN-011 NAO deve estar em completed_topics
        self.assertNotIn('QA-MAN-011', completed)
        # QA-REP-021 DEVE estar em completed_topics com a nota 85
        self.assertIn(self.topic2.code, completed)
        self.assertEqual(completed[self.topic2.code], 85)

