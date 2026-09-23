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

    def test_computed_status_strictly_reflects_database_without_autounfreeze(self):
        """
        Correção 1: Track.computed_status deve refletir o status explícito do banco de dados,
        sem descongelamento automático mesmo quando comportamentos e tópicos estão cadastrados.
        """
        from apps.curriculum.models import TrackStatus
        frozen_track = Track.objects.create(
            number=3,
            name="Testes de API",
            slug="testes-api-test",
            status=TrackStatus.FROZEN,
            description="Trilha de API congelada",
            mini_site_route="/mini-sites/faulty-api/"
        )
        mod = Module.objects.create(
            track=frozen_track,
            number=1,
            title="Módulo API",
            description="Desc"
        )
        top = Topic.objects.create(
            module=mod,
            code="API-TEST-001",
            title="Tópico API",
            slug="topico-api-teste",
            oracle_description="Oracle",
            investigation_scope="Scope"
        )
        ScopedBehavior.objects.create(
            topic=top,
            code="API-BUG-001",
            title="Bug de API",
            description="Desc",
            is_defect=True
        )

        # Mesmo com módulos, tópicos e comportamentos, o status NÃO deve descongelar sozinho
        self.assertEqual(frozen_track.computed_status, TrackStatus.FROZEN)
        self.assertTrue(frozen_track.is_frozen)

    def test_track_list_api_includes_total_topics(self):
        """
        Verifica que o TrackListSerializer e TrackDetailSerializer expõem o total de tópicos cadastrados.
        """
        url = reverse('curriculum:track-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        tracks_data = response.data.get('results', response.data)
        t_data = next(t for t in tracks_data if t['slug'] == self.track.slug)
        self.assertIn('total_topics', t_data)
        self.assertEqual(t_data['total_topics'], 1)

    def test_utf8_encoding_integrity(self):
        """
        ADR-0016: Verifica a integridade de encoding UTF-8 em todo o projeto.
        Falha a suíte caso qualquer arquivo contenha corrupção de caracteres (acentos virando ?).
        """
        import os, re
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

        p_letter_q = re.compile(r'[a-zA-Z\u00C0-\u00FF]\?[a-zA-Z\u00C0-\u00FF]')
        p_upper_q = re.compile(r'\b[A-Z\u00C0-\u00FF]+\?[A-Z\u00C0-\u00FF]+\b')
        p_word_q = re.compile(r'\?[a-zA-Z\u00C0-\u00FF]{2,}')
        p_quote_q = re.compile(r'["\x27].*\s\?\s[a-zA-Z\u00C0-\u00FF].*["\x27]')

        url_ignore = ('?seed', '?topic', '?delete', '?v=', '?t=', '?id=', '?name=', '?code=')
        corruptions = []

        for base in ['backend/apps', 'frontend/src']:
            scan_dir = os.path.join(repo_root, base)
            for root, dirs, files in os.walk(scan_dir):
                if any(x in root for x in ['node_modules', '.next', '__pycache__']):
                    continue
                for f in files:
                    if f.endswith(('.py', '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml')) and 'encoding.test' not in f:
                        fpath = os.path.join(root, f)
                        rel_path = os.path.relpath(fpath, repo_root)
                        with open(fpath, 'r', encoding='utf-8', errors='replace') as fp:
                            for idx, line in enumerate(fp, 1):
                                if p_letter_q.search(line):
                                    corruptions.append(f"{rel_path}:{idx} -> {line.strip()[:80]}")
                                    continue
                                if p_upper_q.search(line):
                                    corruptions.append(f"{rel_path}:{idx} -> {line.strip()[:80]}")
                                    continue
                                m = p_word_q.findall(line)
                                if m and not any(any(token.startswith(u) for u in url_ignore) for token in m):
                                    corruptions.append(f"{rel_path}:{idx} -> {line.strip()[:80]}")
                                    continue
                                if p_quote_q.search(line):
                                    corruptions.append(f"{rel_path}:{idx} -> {line.strip()[:80]}")

        self.assertEqual(len(corruptions), 0, f"Corrupção de encoding UTF-8 detectada:\n" + "\n".join(corruptions))
