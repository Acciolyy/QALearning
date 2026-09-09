import os
import tempfile
from pathlib import Path
from django.test import TestCase, Client
from django.urls import reverse
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity
from apps.bug_engine.services import ScopedSeedService, BugState
from apps.bug_engine.loader import CatalogLoader, CatalogValidationError

class CatalogLoaderAndSeedServiceTestCase(TestCase):
    def setUp(self):
        self.track = Track.objects.create(
            number=1,
            name="Testes Manuais",
            slug="testes-manuais",
            category=TrackCategory.FOUNDATIONS,
            description="Trilha de fundamentos manuais",
            mini_site_route="/mini-sites/vault-commerce/checkout/"
        )
        self.module = Module.objects.create(
            track=self.track,
            number=1,
            title="Fundamentos",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo de fundamentos"
        )
        self.topic_a = Topic.objects.create(
            module=self.module,
            code="QA-TEST-001",
            title="Tópico de Teste A",
            slug="topico-teste-a",
            target_element="input#test-a",
            oracle_description="Comportamento esperado A",
            investigation_scope="Investigação A"
        )
        self.topic_b = Topic.objects.create(
            module=self.module,
            code="QA-TEST-002",
            title="Tópico de Teste B",
            slug="topico-teste-b",
            target_element="input#test-b",
            oracle_description="Comportamento esperado B",
            investigation_scope="Investigação B"
        )

        # 4 comportamentos no tópico A
        for i in range(1, 5):
            ScopedBehavior.objects.create(
                topic=self.topic_a,
                code=f"BEH-A-00{i}",
                title=f"Bug A{i}",
                severity=BugSeverity.MAJOR,
                is_defect=True,
                trigger_element=f"input#elem-a-{i}",
                trigger_action="submit_form",
                trigger_value=str(i)
            )

        # 2 comportamentos no tópico B
        for i in range(1, 3):
            ScopedBehavior.objects.create(
                topic=self.topic_b,
                code=f"BEH-B-00{i}",
                title=f"Bug B{i}",
                severity=BugSeverity.CRITICAL,
                is_defect=True,
                trigger_element=f"input#elem-b-{i}"
            )

    def test_seed_service_determinism(self):
        """Garante que a mesma semente retorne exatamente a mesma lista de comportamentos."""
        seed = "alpha-481029"
        res1 = ScopedSeedService.get_active_behaviors_for_session(self.topic_a, seed, sample_size=2)
        res2 = ScopedSeedService.get_active_behaviors_for_session(self.topic_a, seed, sample_size=2)

        codes1 = [b.code for b in res1]
        codes2 = [b.code for b in res2]

        self.assertEqual(codes1, codes2)
        self.assertEqual(len(codes1), 2)

    def test_strict_topic_isolation(self):
        """Garante isolamento estrito: nenhum comportamento de B vaza para A."""
        seed = "test-seed-999"
        active_a = ScopedSeedService.get_active_behaviors_for_session(self.topic_a, seed, sample_size=3)
        for b in active_a:
            self.assertEqual(b.topic, self.topic_a)
            self.assertFalse(b.code.startswith("BEH-B"))

    def test_bug_state_helper(self):
        """Verifica a conveniência e consistência do helper BugState."""
        seed = "omega-12345"
        state = BugState(topic=self.topic_a, session_seed=seed, sample_size=2)
        active_codes = list(state.active_codes)
        self.assertEqual(len(active_codes), 2)

        for code in active_codes:
            self.assertTrue(state.is_active(code))
            beh = state.get_behavior(code)
            self.assertIsNotNone(beh)
            self.assertEqual(beh.code, code)

        self.assertFalse(state.is_active("NON-EXISTENT-CODE"))

        d = state.to_dict()
        self.assertEqual(d["topic_code"], "QA-TEST-001")
        self.assertEqual(d["session_seed"], seed)
        self.assertEqual(len(d["active_behaviors"]), 2)

    def test_yaml_catalog_loader_valid(self):
        """Testa o carregamento de catálogo YAML válido e sincronização com banco."""
        yaml_content = f"""
topic_code: "QA-TEST-001"
topic_title: "Tópico de Teste A Atualizado"
oracle:
  description: "Descrição de oráculo vinda do catálogo YAML"
  acceptance_criteria:
    - code: "§ 1.1"
      rule: "Critério A1"
    - code: "§ 1.2"
      rule: "Critério A2"
candidate_behaviors:
  - code: "CAT-BEH-901"
    title: "Bug de Catálogo 901"
    category: "boundary_validation"
    severity: "blocker"
    weight: 15
    is_defect: true
    trigger:
      element: "input#cat-test"
      action: "blur"
      input_value: "invalid"
    deviation:
      expected: "Deveria bloquear"
      actual: "Aceitou valor inválido"
    hints:
      direct: "Pista direta"
      subtle: "Pista sutil"
"""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "test-catalog.yaml"
            file_path.write_text(yaml_content, encoding="utf-8")

            results = CatalogLoader.load_all(Path(tmpdir))
            self.assertEqual(results["files_processed"], 1)
            self.assertEqual(results["topics_updated"], 1)
            self.assertEqual(results["behaviors_synced"], 1)
            self.assertEqual(len(results["errors"]), 0)

            # Verifica se o Topic foi atualizado com oracle_criteria
            self.topic_a.refresh_from_db()
            self.assertEqual(self.topic_a.oracle_description, "Descrição de oráculo vinda do catálogo YAML")
            self.assertEqual(len(self.topic_a.oracle_criteria), 2)
            self.assertEqual(self.topic_a.oracle_criteria[0]["code"], "§ 1.1")

            # Verifica se o ScopedBehavior foi criado com todos os metadados
            beh = ScopedBehavior.objects.get(code="CAT-BEH-901")
            self.assertEqual(beh.topic, self.topic_a)
            self.assertEqual(beh.severity, BugSeverity.BLOCKER)
            self.assertEqual(beh.trigger_element, "input#cat-test")
            self.assertEqual(beh.trigger_action, "blur")
            self.assertEqual(beh.hint_direct, "Pista direta")

    def test_yaml_catalog_loader_invalid_schema(self):
        """Garante que esquemas corrompidos ou com campos ausentes gerem erro explícito."""
        invalid_yaml = "invalid_root_key: 123"
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = Path(tmpdir) / "bad.yaml"
            file_path.write_text(invalid_yaml, encoding="utf-8")

            results = CatalogLoader.load_all(Path(tmpdir))
            self.assertEqual(len(results["errors"]), 1)
            self.assertIn("bad.yaml", results["errors"][0])

class MiniSiteCheckoutViewTestCase(TestCase):
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
        self.module = Module.objects.create(
            track=self.track,
            number=1,
            title="Fundamentos",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1"
        )
        self.topic = Topic.objects.create(
            module=self.module,
            code="QA-MAN-012",
            title="Limites e Particionamento de Idade",
            slug="limites-idade-cadastro",
            target_element="input#user-age",
            oracle_description="Critérios de idade 18 a 120",
            investigation_scope="Auditar formulário"
        )
        ScopedBehavior.objects.create(
            topic=self.topic,
            code="VAL-AGE-001",
            title="Idade 17 anos aceita",
            severity=BugSeverity.BLOCKER,
            is_defect=True,
            trigger_element="input#user-age",
            trigger_action="submit_form",
            trigger_value="17"
        )

    def test_mini_site_render_success(self):
        """Verifica a renderização do mini-site com injeção de seed e bridge."""
        response = self.client.get('/mini-sites/vault-commerce/checkout/?seed=481029&topic=QA-MAN-012')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode('utf-8')

        # Verifica títulos e elementos do mini-site
        self.assertIn("Vault Commerce", content)
        self.assertIn("Checkout Seguro", content)
        self.assertIn('name="qa-topic-code" content="QA-MAN-012"', content)
        self.assertIn('name="qa-session-seed" content="481029"', content)
        self.assertIn('/static/mini_sites/qa_bridge.js', content)

        # Verifica presença de active_bug_codes
        self.assertIn("activeBugCodes", content)
        self.assertIn("VAL-AGE-001", content)

        # Verifica CSP frame-ancestors para isolamento cross-origin e meta qa-hub-origin
        self.assertIn('Content-Security-Policy', response.headers)
        self.assertIn("frame-ancestors 'self'", response.headers['Content-Security-Policy'])
        self.assertIn('http://localhost:3000', response.headers['Content-Security-Policy'])
        self.assertIn('name="qa-hub-origin"', content)
