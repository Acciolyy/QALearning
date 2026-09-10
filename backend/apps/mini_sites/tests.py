from django.test import TestCase, Client
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity

class MiniSiteModularBehaviorsTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Track 00 (Fundamentos)
        self.track_00 = Track.objects.create(
            number=0,
            name="Fundamentos de QA",
            slug="fundamentos-qa",
            category=TrackCategory.FOUNDATIONS,
            description="Onboarding e anatomia web",
            mini_site_route="/mini-sites/vault-commerce/checkout/"
        )
        self.mod_00 = Module.objects.create(
            track=self.track_00,
            number=1,
            title="Anatomia Web",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1"
        )
        self.topic_00 = Topic.objects.create(
            module=self.mod_00,
            code="QA-ONB-011",
            title="Reconhecimento de Elementos DOM",
            slug="reconhecimento-elementos-dom",
            target_element="form#checkout-form",
            oracle_description="Campos obrigatórios",
            investigation_scope="Auditar formulário"
        )
        ScopedBehavior.objects.create(
            topic=self.topic_00,
            code="ONB-REQ-001",
            title="Nome aceita espaços em branco",
            severity=BugSeverity.MAJOR,
            is_defect=True,
            trigger_element="input#user-name",
            trigger_action="submit_form"
        )

        # Track 12 (Acessibilidade WCAG)
        self.track_12 = Track.objects.create(
            number=12,
            name="Testes de Acessibilidade (WCAG)",
            slug="testes-acessibilidade-wcag",
            category=TrackCategory.SPECIALTIES,
            description="Barreiras WCAG",
            mini_site_route="/mini-sites/vault-commerce/checkout/"
        )
        self.mod_12 = Module.objects.create(
            track=self.track_12,
            number=1,
            title="Operabilidade e Teclado",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo 1 WCAG"
        )
        self.topic_12 = Topic.objects.create(
            module=self.mod_12,
            code="QA-A11-011",
            title="Navegação por Teclado e Foco Visível",
            slug="navegacao-teclado-foco-visivel",
            target_element="form#checkout-form",
            oracle_description="Foco visível obrigatório",
            investigation_scope="Testar navegação via tab"
        )
        ScopedBehavior.objects.create(
            topic=self.topic_12,
            code="A11-FOC-001",
            title="Foco invisível suprimido",
            severity=BugSeverity.CRITICAL,
            is_defect=True,
            trigger_element="input, button, select",
            trigger_action="focus"
        )

    def test_mini_site_renders_modular_behavior_scripts(self):
        """Verifica que o mini-site inclui todos os scripts de comportamentos modulares (ADR-0013)."""
        response = self.client.get('/mini-sites/vault-commerce/checkout/?seed=test-seed-1&topic=QA-ONB-011')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode('utf-8')

        self.assertIn('/static/mini_sites/behaviors/input_validation.js', content)
        self.assertIn('/static/mini_sites/behaviors/state_machine.js', content)
        self.assertIn('/static/mini_sites/behaviors/a11y_barriers.js', content)
        self.assertIn('ONB-REQ-001', content)

    def test_mini_site_wcag_topic_isolation(self):
        """Verifica que o tópico de Acessibilidade injeta os bugs WCAG sem contaminar com ONB."""
        response = self.client.get('/mini-sites/vault-commerce/checkout/?seed=test-seed-2&topic=QA-A11-011')
        self.assertEqual(response.status_code, 200)
        content = response.content.decode('utf-8')

        self.assertIn('A11-FOC-001', content)
        self.assertNotIn('ONB-REQ-001', content)
