import re
from typing import Dict, Any, Tuple
from apps.curriculum.models import Topic, GuidanceLevel
from .models import CodeSubmission
from .piston_client import PistonClient

# Harness 012: Validação de Regras de Negócio de Idade (18 a 120 anos)
# IMPORTANTE: Este harness NÃO emite descrições de oráculo, valores esperados ou tracebacks.
# Todas as exceções são capturadas internamente para evitar vazamento de implementação.
HARNESS_012 = """
import sys

tests = [
    lambda: validate_age(18) == True,
    lambda: validate_age(17) == False,
    lambda: validate_age(-5) == False,
    lambda: validate_age(120) == True,
    lambda: validate_age(121) == False,
]

passed = 0
for test_fn in tests:
    try:
        if test_fn():
            passed += 1
    except Exception:
        pass

print("SUMMARY: " + str(passed) + "/" + str(len(tests)) + " passed")
sys.exit(0 if passed == len(tests) else 1)
"""

# Harness 031: Validação de Cálculo de Checkout e Cupons
HARNESS_031 = """
import sys

tests = [
    lambda: calculate_checkout_total(249.0, 35.0, None) == 284.0,
    lambda: calculate_checkout_total(249.0, 35.0, "VAULT10") == 259.10,
    lambda: calculate_checkout_total(249.0, 35.0, "INVALIDO") == 284.0,
    lambda: calculate_checkout_total(0.0, 35.0, "VAULT10") == 35.0,
]

passed = 0
for test_fn in tests:
    try:
        if test_fn():
            passed += 1
    except Exception:
        pass

print("SUMMARY: " + str(passed) + "/" + str(len(tests)) + " passed")
sys.exit(0 if passed == len(tests) else 1)
"""

class CodeEvaluationService:
    """
    Serviço de orquestração e verificação de código na Sandbox.
    Garante sanitização estrita para que o aluno nunca receba tracebacks brutos
    ou código-fonte/valores esperados do test harness oculto.
    """
    THRESHOLDS = {
        GuidanceLevel.DIRECT: 70.0,
        GuidanceLevel.SUBTLE: 85.0,
        GuidanceLevel.AUTONOMOUS: 100.0,
    }

    HARNESSES = {
        'QA-MAN-012': {
            'target_function': 'validate_age(age: int) -> bool',
            'harness_code': HARNESS_012
        },
        'QA-MAN-031': {
            'target_function': 'calculate_checkout_total(subtotal: float, shipping: float, coupon: str = None) -> float',
            'harness_code': HARNESS_031
        }
    }

    @classmethod
    def run_free_script(cls, code: str, language: str = 'python') -> dict:
        """Execução livre no Playground do aluno (sem test harness oculto)."""
        return PistonClient.execute(code=code, language=language)

    @classmethod
    def verify_solution(
        cls,
        topic: Topic,
        session_seed: str,
        student_code: str,
        language: str = 'python'
    ) -> CodeSubmission:
        """
        Executa o código do aluno acoplado ao test harness oculto.
        Sanitiza completamente stdout/stderr antes de persistir e devolver ao cliente.
        """
        harness_info = cls.HARNESSES.get(topic.code, cls.HARNESSES['QA-MAN-012'])
        composite_code = f"{student_code}\n\n# --- TEST HARNESS ---\n{harness_info['harness_code']}"

        result = PistonClient.execute(
            code=composite_code,
            language=language,
            run_timeout=2000
        )

        raw_stdout = result.get('stdout', '')
        raw_stderr = result.get('stderr', '')
        exit_code = result.get('code')
        signal = result.get('signal')
        status_raw = result.get('status')
        wall_time = result.get('wall_time', 0)

        # Identificação de Timeout / Loop Infinito
        if signal == 'SIGKILL' or status_raw == 'TO' or 'SIGKILL' in str(result):
            status = CodeSubmission.Status.TIMEOUT
            summary = "Tempo limite de execução excedido (2.000 ms). Evite laços infinitos ou bloqueios síncronos."
            hint = "Verifique as condições de parada de laços de repetição (while/for)."
            tests_passed, tests_total, score = 0, 5, 0.0
            is_approved = False
        elif 'Killed' in raw_stderr or (status_raw == 'RE' and 'Memory' in raw_stderr):
            status = CodeSubmission.Status.MEMORY_LIMIT
            summary = "Limite de memória RAM excedido (256 MB). Alocação excessiva contida pelo sandbox."
            hint = "Otimize as estruturas de dados e evite acumular buffers volumosos em memória."
            tests_passed, tests_total, score = 0, 5, 0.0
            is_approved = False
        elif not result.get('success'):
            status = CodeSubmission.Status.RUNTIME_ERROR
            summary = f"Erro no serviço de execução: {result.get('error')}"
            hint = "Revise a sintaxe do script submetido."
            tests_passed, tests_total, score = 0, 5, 0.0
            is_approved = False
        else:
            match = re.search(r'SUMMARY: (\d+)/(\d+) passed', raw_stdout)
            if match:
                tests_passed = int(match.group(1))
                tests_total = int(match.group(2))
            else:
                tests_passed = 0
                tests_total = 5

            score = round((tests_passed / max(tests_total, 1)) * 100.0, 1)
            guidance_level = topic.module.guidance_level if topic.module else GuidanceLevel.DIRECT
            threshold = cls.THRESHOLDS.get(guidance_level, 70.0)
            is_approved = (score >= threshold)

            if is_approved:
                status = CodeSubmission.Status.PASSED
                summary = f"Validação automatizada homologada com {score}% de sucesso ({tests_passed}/{tests_total} casos de teste cobertos)."
                hint = ""
            else:
                status = CodeSubmission.Status.FAILED
                summary = f"Cobertura insuficiente: {score}% obtido, abaixo do limiar de {threshold}% exigido para aprovação."
                
                if guidance_level == GuidanceLevel.DIRECT:
                    hint = "Atenção especial aos casos de fronteira: certifique-se de testar valores exatamente nos limites (18 e 120 anos)."
                elif guidance_level == GuidanceLevel.SUBTLE:
                    hint = "Considere valores negativos e certifique-se de que a lógica trata ambos os extremos do intervalo."
                else:
                    hint = "Revise a especificação de regras de negócio. O nível autônomo não oferece pistas adicionais."

        guidance_level = topic.module.guidance_level if topic.module else GuidanceLevel.DIRECT
        threshold = cls.THRESHOLDS.get(guidance_level, 70.0)

        # Sanitização estrita: NUNCA devolver traceback bruto ou stdout do harness oculto
        # O aluno deve receber apenas score, status, resumo pedagógico e a dica escalonada.
        sanitized_stdout = ""
        sanitized_stderr = ""

        return CodeSubmission.objects.create(
            topic=topic,
            session_seed=session_seed,
            language=language,
            code=student_code,
            stdout=sanitized_stdout,
            stderr=sanitized_stderr,
            exit_code=exit_code,
            signal=signal,
            execution_time_ms=wall_time,
            status=status,
            tests_passed=tests_passed,
            tests_total=tests_total,
            score=score,
            threshold_applied=threshold,
            is_approved=is_approved,
            feedback_summary=summary,
            feedback_hint=hint
        )
