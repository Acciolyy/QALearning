from django.test import TestCase
from django.urls import reverse
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity
from apps.bug_engine.services import ScopedSeedService

class CurriculumAndBugEngineTestCase(TestCase):
    def setUp(self):
        self.track = Track.objects.create(
            number=1,
            name="Testes Manuais",
            slug="testes-manuais",
            category=TrackCategory.FOUNDATIONS,
            description="Descrição teste",
            mini_site_route="/mini-sites/manual-vault/"
        )
        self.module = Module.objects.create(
            track=self.track,
            number=1,
            title="Fundamentos",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1"
        )
        self.topic = Topic.objects.create(
            module=self.module,
            code="QA-TEST-001",
            title="Tópico Teste",
            slug="topico-teste",
            target_element="input#test",
            oracle_description="Comportamento esperado",
            investigation_scope="O que investigar"
        )
        # 4 comportamentos de teste
        for i in range(1, 5):
            ScopedBehavior.objects.create(
                topic=self.topic,
                code=f"BUG-00{i}",
                title=f"Bug de Teste {i}",
                description=f"Detalhe {i}",
                severity=BugSeverity.MAJOR,
                is_defect=True
            )

    def test_track_list_api(self):
        url = reverse('curriculum:track-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 1)

    def test_track_detail_api(self):
        url = reverse('curriculum:track-detail', kwargs={'slug': 'testes-manuais'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], 'testes-manuais')
        self.assertEqual(len(response.data['modules']), 1)

    def test_topic_detail_with_deterministic_seed(self):
        url = reverse('curriculum:topic-detail', kwargs={'slug': 'topico-teste'})

        # Mesma semente deve produzir rigorosamente a mesma seleção de bugs
        res1 = self.client.get(url, {'seed': 'seed-481029'})
        res2 = self.client.get(url, {'seed': 'seed-481029'})

        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)

        bugs1 = [b['code'] for b in res1.data['topic']['active_behaviors']]
        bugs2 = [b['code'] for b in res2.data['topic']['active_behaviors']]

        self.assertEqual(bugs1, bugs2, "A mesma semente deve gerar a mesma lista determinística de bugs")
        self.assertEqual(len(bugs1), 2, "Amostragem deve respeitar o limite padrão de 2 bugs ativos")

    def test_scoped_seed_service_never_leaks_other_topics(self):
        # Cria outro tópico em outro módulo com comportamentos
        other_topic = Topic.objects.create(
            module=self.module,
            code="QA-OTHER-999",
            title="Outro Tópico Alheio",
            slug="outro-topico",
            oracle_description="Outro oráculo",
            investigation_scope="Outro escopo"
        )
        foreign_bug = ScopedBehavior.objects.create(
            topic=other_topic,
            code="LEAK-RISK-001",
            title="Bug de Outro Tópico",
            description="Não pode aparecer no tópico teste",
            is_defect=True
        )

        active_bugs = ScopedSeedService.get_active_behaviors_for_session(
            topic=self.topic,
            session_seed="random-seed-9999",
            sample_size=4
        )

        active_codes = [b.code for b in active_bugs]
        self.assertNotIn("LEAK-RISK-001", active_codes, "Comportamento de outro tópico JAMAIS pode vazar")
