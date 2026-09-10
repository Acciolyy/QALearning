import socket
from django.test import TestCase, Client
from apps.curriculum.models import Track, Module, Topic, TrackCategory, GuidanceLevel
from apps.sandbox.models import CodeSubmission
from apps.sandbox.services import CodeEvaluationService
from apps.sandbox.piston_client import PistonClient

class SandboxEngineTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.track = Track.objects.create(
            number=1,
            name="Testes Manuais",
            slug="testes-manuais",
            category=TrackCategory.FOUNDATIONS,
            description="Trilha manual"
        )
        self.module_direct = Module.objects.create(
            track=self.track,
            number=1,
            title="Fundamentos",
            guidance_level=GuidanceLevel.DIRECT,
            description="Módulo com limiar de 70%"
        )
        self.topic = Topic.objects.create(
            module=self.module_direct,
            code="QA-MAN-012",
            title="Limites e Particionamento de Idade",
            slug="limites-idade-cadastro",
            oracle_description="Idade entre 18 e 120 anos"
        )

    def test_free_run_nominal(self):
        """Valida a execução de script livre no playground."""
        res = CodeEvaluationService.run_free_script("print(40 + 2)")
        self.assertTrue(res.get('success'))
        self.assertEqual(res.get('code'), 0)
        self.assertIn("42", res.get('stdout'))

    def test_solution_verification_100_percent(self):
        """Aluno submete código perfeito: 100% de cobertura nos testes de negócio."""
        valid_code = """
def validate_age(age: int) -> bool:
    if not isinstance(age, int):
        return False
    return 18 <= age <= 120
"""
        sub = CodeEvaluationService.verify_solution(
            topic=self.topic,
            session_seed="seed-123",
            student_code=valid_code
        )
        self.assertEqual(sub.score, 100.0)
        self.assertEqual(sub.tests_passed, 5)
        self.assertEqual(sub.tests_total, 5)
        self.assertTrue(sub.is_approved)
        self.assertEqual(sub.status, CodeSubmission.Status.PASSED)
        self.assertIn("homologada com 100.0%", sub.feedback_summary)

    def test_solution_verification_partial_score_non_binary(self):
        """Aluno submete código incompleto: pontuação não-binária e dica escalonada."""
        # Código que aceita idades negativas e menores que 18
        incomplete_code = """
def validate_age(age: int) -> bool:
    return age <= 120
"""
        sub = CodeEvaluationService.verify_solution(
            topic=self.topic,
            session_seed="seed-123",
            student_code=incomplete_code
        )
        # Passa apenas nos testes de 18 e 120 (2 de 5 = 40%)
        self.assertLess(sub.score, 70.0)
        self.assertFalse(sub.is_approved)
        self.assertEqual(sub.status, CodeSubmission.Status.FAILED)
        self.assertIn("Atenção especial aos casos de fronteira", sub.feedback_hint)

    def test_network_isolation_strictly_blocked(self):
        """
        Requisito de Segurança: Prova que chamadas de rede externas de dentro do
        sandbox falham obrigatoriamente (Network is unreachable).
        """
        net_code = """
import urllib.request
import socket

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.5)
    s.connect(('1.1.1.1', 80))
    print('FAIL_NETWORK_ACCESSIBLE')
except OSError as e:
    print(f'NETWORK_BLOCKED_SUCCESS: {e}')
"""
        res = PistonClient.execute(code=net_code)
        self.assertTrue(res.get('success'))
        self.assertIn("NETWORK_BLOCKED_SUCCESS", res.get('stdout'))
        self.assertNotIn("FAIL_NETWORK_ACCESSIBLE", res.get('stdout'))

    def test_hostile_infinite_loop_timeout(self):
        """Código com loop infinito é contido pelo timeout de CPU do sandbox."""
        loop_code = """
while True:
    pass
"""
        sub = CodeEvaluationService.verify_solution(
            topic=self.topic,
            session_seed="seed-123",
            student_code=loop_code
        )
        self.assertEqual(sub.status, CodeSubmission.Status.TIMEOUT)
        self.assertFalse(sub.is_approved)
        self.assertIn("Tempo limite de execução excedido", sub.feedback_summary)

    def test_hostile_memory_exhaustion(self):
        """Código que tenta alocar 500MB é interrompido pelo limite de 256MB."""
        mem_code = """
b = bytearray(500 * 1024 * 1024)
"""
        res = PistonClient.execute(code=mem_code, memory_limit=268435456)
        self.assertTrue(res.get('success'))
        # Piston encerra com Killed no stderr ou status RE
        is_killed = ('Killed' in res.get('stderr', '')) or (res.get('status') == 'RE')
        self.assertTrue(is_killed, f"Esperava processo eliminado por limite de memória. Output: {res}")

    def test_hostile_filesystem_read_protection(self):
        """Tentativa de leitura de arquivo protegido do host falha com PermissionError."""
        read_code = """
try:
    with open('/etc/shadow', 'r') as f:
        print('PWNED')
except PermissionError:
    print('READ_PROTECTED')
"""
        res = PistonClient.execute(code=read_code)
        self.assertTrue(res.get('success'))
        self.assertIn("READ_PROTECTED", res.get('stdout'))
        self.assertNotIn("PWNED", res.get('stdout'))

    def test_hostile_filesystem_write_protection(self):
        """Tentativa de gravação no filesystem raiz falha com Read-only file system."""
        write_code = """
try:
    with open('/etc/injected_file', 'w') as f:
        f.write('bad')
    print('PWNED_WRITE')
except OSError:
    print('WRITE_PROTECTED')
"""
        res = PistonClient.execute(code=write_code)
        self.assertTrue(res.get('success'))
        self.assertIn("WRITE_PROTECTED", res.get('stdout'))
        self.assertNotIn("PWNED_WRITE", res.get('stdout'))

    def test_hostile_fork_bomb(self):
        """Tentativa de fork bomb é contida por limite de processos (pids) ou timeout."""
        fork_code = """
import os
try:
    for i in range(200):
        os.fork()
    print('PWNED_FORK')
except OSError as e:
    print(f'FORK_PROTECTED_{type(e).__name__}')
"""
        res = PistonClient.execute(code=fork_code)
        self.assertTrue(res.get('success'))
        stdout = res.get('stdout', '')
        self.assertNotIn("PWNED_FORK", stdout)
        is_contained = ("FORK_PROTECTED" in stdout) or ("SIGKILL" in str(res)) or (res.get('signal') == 'SIGKILL')
        self.assertTrue(is_contained, f"Fork bomb não foi contido: {res}")

    def test_verify_rest_api_endpoint(self):
        """Valida submissão e resposta através da API REST DRF."""
        payload = {
            "topic_slug": "limites-idade-cadastro",
            "session_seed": "seed-api-456",
            "code": "def validate_age(age): return 18 <= age <= 120"
        }
        response = self.client.post('/api/v1/sandbox/verify/', payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["topic_code"], "QA-MAN-012")
        self.assertEqual(data["score"], 100.0)
        self.assertTrue(data["is_approved"])
        self.assertIn("homologada", data["feedback_summary"])

    def test_verify_sanitizes_output_on_harness_failure(self):
        """
        Requisito de Segurança Pedagógica (Seção 6):
        Quando a submissão do aluno falha ou lança exceção durante os testes do harness,
        o endpoint NÃO deve vazar o stderr, tracebacks, descrições internas ou
        o código-fonte/valores esperados do harness oculto.
        A resposta deve conter estritamente score, status e a dica escalonada.
        """
        # 1. Aluno submete código com lógica falha e que lança exceção em valores específicos
        failing_code = """
def validate_age(age: int) -> bool:
    if age < 0:
        raise ValueError("Idade negativa inválida")
    return age > 1000  # Falha em todas as regras válidas (18 a 120)
"""
        payload = {
            "topic_slug": "limites-idade-cadastro",
            "session_seed": "seed-harness-sanitization-999",
            "code": failing_code
        }
        response = self.client.post('/api/v1/sandbox/verify/', payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Score, status e dica pedagógica entregues corretamente
        self.assertEqual(data["topic_code"], "QA-MAN-012")
        self.assertLess(data["score"], 70.0)
        self.assertFalse(data["is_approved"])
        self.assertEqual(data["status"], "failed")
        self.assertIn("Cobertura insuficiente", data["feedback_summary"])
        self.assertIn("Atenção especial aos casos de fronteira", data["feedback_hint"])

        # SANITIZAÇÃO ESTRITA:
        # stderr e stdout devem estar vazios ou livres de tracebacks / código do harness
        self.assertEqual(data.get("stderr"), "")
        self.assertEqual(data.get("stdout"), "")

        # Verificação do corpo bruto da resposta HTTP JSON:
        # Garante que nenhum trecho interno do harness ou oráculo vazou
        raw_body = response.content.decode("utf-8")
        self.assertNotIn("Traceback", raw_body)
        self.assertNotIn("AssertionError", raw_body)
        self.assertNotIn("TEST HARNESS", raw_body)
        self.assertNotIn("test_fn", raw_body)
        self.assertNotIn("lambda", raw_body)
        self.assertNotIn("validate_age(18)", raw_body)
        self.assertNotIn("validate_age(120)", raw_body)
        self.assertNotIn("validate_age(121)", raw_body)

        # 2. Caso adicional: Aluno submete função que sempre explode com exceção
        crash_code = "def validate_age(age: int) -> bool: raise RuntimeError('crash_explosivo_do_aluno')"
        res_crash = self.client.post('/api/v1/sandbox/verify/', {
            "topic_slug": "limites-idade-cadastro",
            "session_seed": "seed-harness-sanitization-crash",
            "code": crash_code
        }, content_type='application/json')
        self.assertEqual(res_crash.status_code, 201)
        data_crash = res_crash.json()
        self.assertEqual(data_crash["score"], 0.0)
        self.assertFalse(data_crash["is_approved"])
        self.assertEqual(data_crash.get("stderr"), "")
        self.assertEqual(data_crash.get("stdout"), "")
        crash_body = res_crash.content.decode("utf-8")
        self.assertNotIn("Traceback", crash_body)
        self.assertNotIn("TEST HARNESS", crash_body)
        self.assertNotIn("lambda", crash_body)
