from django.test import TestCase, Client
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity
from apps.evaluation.models import Submission
from apps.evaluation.services import EvaluationService

class EvaluationEngineTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.track = Track.objects.create(
            number=1,
            name="Testes Manuais",
            slug="testes-manuais",
            category=TrackCategory.FOUNDATIONS,
            description="Trilha manual",
            mini_site_route="/mini-sites/vault-commerce/checkout/"
        )

        # Módulo 1 (Direct - limiar 70%)
        self.mod_direct = Module.objects.create(
            track=self.track,
            number=1,
            title="Módulo Direto",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1"
        )
        self.topic_direct = Topic.objects.create(
            module=self.mod_direct,
            code="QA-TEST-DIR",
            title="Tópico Direto",
            slug="topico-direto",
            oracle_description="Oráculo direto"
        )

        # Módulo 2 (Subtle - limiar 85%)
        self.mod_subtle = Module.objects.create(
            track=self.track,
            number=2,
            title="Módulo Sutil",
            guidance_level=GuidanceLevel.SUBTLE,
            description="Módulo 2"
        )
        self.topic_subtle = Topic.objects.create(
            module=self.mod_subtle,
            code="QA-TEST-SUB",
            title="Tópico Sutil",
            slug="topico-sutil",
            oracle_description="Oráculo sutil"
        )

        # Módulo 3 (Autonomous - limiar 100%)
        self.mod_auto = Module.objects.create(
            track=self.track,
            number=3,
            title="Módulo Autônomo",
            guidance_level=GuidanceLevel.AUTONOMOUS,
            description="Módulo 3"
        )
        self.topic_auto = Topic.objects.create(
            module=self.mod_auto,
            code="QA-TEST-AUT",
            title="Tópico Autônomo",
            slug="topico-autonomo",
            oracle_description="Oráculo autônomo"
        )

        # Tópico sem bugs cadastrados (para teste de aplicação nominal)
        self.topic_nominal = Topic.objects.create(
            module=self.mod_direct,
            code="QA-TEST-NOM",
            title="Tópico Nominal Sem Bugs",
            slug="topico-nominal",
            oracle_description="Sem bugs"
        )

        # Criando comportamentos nos tópicos
        for i in [1, 2]:
            ScopedBehavior.objects.create(
                topic=self.topic_direct,
                code=f"BUG-DIR-00{i}",
                title=f"Bug Direto {i}",
                severity=BugSeverity.MAJOR,
                is_defect=True,
                trigger_element=f"input#dir-{i}",
                hint_direct=f"Pista direta {i}",
                hint_subtle=f"Pista sutil {i}"
            )
            ScopedBehavior.objects.create(
                topic=self.topic_subtle,
                code=f"BUG-SUB-00{i}",
                title=f"Bug Sutil {i}",
                severity=BugSeverity.CRITICAL,
                is_defect=True,
                trigger_element=f"input#sub-{i}",
                hint_direct=f"Pista direta {i}",
                hint_subtle=f"Pista sutil {i}"
            )
            ScopedBehavior.objects.create(
                topic=self.topic_auto,
                code=f"BUG-AUT-00{i}",
                title=f"Bug Autônomo {i}",
                severity=BugSeverity.BLOCKER,
                is_defect=True,
                trigger_element=f"input#aut-{i}"
            )

    def test_zero_bugs_session_correct_no_reports(self):
        """Cenário de zero bugs ativos: aluno que não reporta nada ganha 100% e aprovação."""
        sub = EvaluationService.evaluate_submission(
            topic=self.topic_nominal,
            session_seed="seed-clean-123",
            reported_codes=[]
        )
        self.assertEqual(sub.final_score, 100.0)
        self.assertEqual(sub.precision_score, 100.0)
        self.assertEqual(sub.recall_score, 100.0)
        self.assertTrue(sub.is_approved)
        self.assertIn("Excelente discernimento", sub.feedback_summary)

    def test_zero_bugs_session_false_alarms(self):
        """Cenário de zero bugs ativos: aluno que inventa anomalia inexistente recebe 0%."""
        sub = EvaluationService.evaluate_submission(
            topic=self.topic_nominal,
            session_seed="seed-clean-123",
            reported_codes=["PHANTOM-BUG-001"]
        )
        self.assertEqual(sub.final_score, 0.0)
        self.assertFalse(sub.is_approved)
        self.assertIn("Falso alarme", sub.feedback_summary)

    def test_direct_module_threshold_70_percent(self):
        """No Módulo Direct, score de 70% é suficiente para aprovação."""
        # Supondo semente que ative os 2 bugs
        active = [b.code for b in ScopedBehavior.objects.filter(topic=self.topic_direct)]
        # Reporta 1 de 2: recall = 50%, precision = 100% => final_score = 0.6*50 + 0.4*100 = 70.0%
        sub = EvaluationService.evaluate_submission(
            topic=self.topic_direct,
            session_seed="test-seed-direct",
            reported_codes=[active[0]]
        )
        self.assertEqual(sub.threshold_applied, 70.0)
        self.assertGreaterEqual(sub.final_score, 70.0)
        self.assertTrue(sub.is_approved)

    def test_subtle_module_threshold_85_percent(self):
        """No Módulo Subtle, score de 70% NÃO é suficiente (exige >= 85%)."""
        active = [b.code for b in ScopedBehavior.objects.filter(topic=self.topic_subtle)]
        sub = EvaluationService.evaluate_submission(
            topic=self.topic_subtle,
            session_seed="test-seed-subtle",
            reported_codes=[active[0]] # 70%
        )
        self.assertEqual(sub.threshold_applied, 85.0)
        self.assertFalse(sub.is_approved)
        self.assertIn("abaixo do limiar de 85.0%", sub.feedback_summary)
        self.assertIn("Pista sutil", sub.feedback_hint)

    def test_autonomous_module_threshold_100_percent(self):
        """No Módulo Autônomo, apenas 100% perfeito aprova."""
        active = [b.code for b in ScopedBehavior.objects.filter(topic=self.topic_auto)]
        # Submissão parcial: reprova
        sub_partial = EvaluationService.evaluate_submission(
            topic=self.topic_auto,
            session_seed="test-seed-auto",
            reported_codes=[active[0]]
        )
        self.assertEqual(sub_partial.threshold_applied, 100.0)
        self.assertFalse(sub_partial.is_approved)
        self.assertIn("não fornece pistas", sub_partial.feedback_hint)

        # Submissão perfeita: aprova
        sub_perfect = EvaluationService.evaluate_submission(
            topic=self.topic_auto,
            session_seed="test-seed-auto",
            reported_codes=active
        )
        self.assertEqual(sub_perfect.final_score, 100.0)
        self.assertTrue(sub_perfect.is_approved)

    def test_submission_rest_api_endpoint(self):
        """Verifica a submissão via API REST POST /api/v1/evaluation/submit/."""
        payload = {
            "topic_slug": "topico-direto",
            "session_seed": "test-seed-direct",
            "reported_behaviors": ["BUG-DIR-001"]
        }
        response = self.client.post('/api/v1/evaluation/submit/', payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["topic_code"], "QA-TEST-DIR")
        self.assertIn("final_score", data)
        self.assertIn("threshold_applied", data)
        self.assertIn("is_approved", data)
