import re
from typing import Dict, Any, Tuple
from apps.curriculum.models import Topic, GuidanceLevel
from .models import CodeSubmission
from .piston_client import PistonClient

class CodeEvaluationService:
    """
    Serviço de orquestração e verificação de código na Sandbox.
    """
    THRESHOLDS = {
        GuidanceLevel.DIRECT: 70.0,
        GuidanceLevel.SUBTLE: 85.0,
        GuidanceLevel.AUTONOMOUS: 100.0,
    }

    HARNESSES = {
        'QA-MAN-012': {
            'target_function': 'validate_age(age: int) -> bool',
            'harness_code': '\nimport sys\n\n# Test Harness Oculto de Validação de Idade (Regra de Negócio: 18 a 120 anos)\ntests = [\n    ("idade_minima_18", lambda: validate_age(18) == True, "18 anos deve ser aceito como maioridade"),\n    ("idade_abaixo_minima_17", lambda: validate_age(17) == False, "17 anos deve ser rejeitado (< 18)"),\n    ("idade_negativa_invalida", lambda: validate_age(-5) == False, "Idade negativa deve ser rejeitada"),\n    ("idade_maxima_120", lambda: validate_age(120) == True, "120 anos é o limite superior aceito"),\n    ("idade_acima_maxima_121", lambda: validate_age(121) == False, "121 anos ultrapassa a fronteira permitida"),\n]\n\npassed = 0\nfailed_cases = []\n\nfor name, test_fn, desc in tests:\n    try:\n        if test_fn():\n            passed += 1\n            print("PASS: " + name)\n        else:\n            failed_cases.append((name, desc))\n            print("FAIL: " + name + " - " + desc)\n    except Exception as e:\n        failed_cases.append((name, str(e)))\n        print("ERROR: " + name + " - " + str(e))\n\nprint("SUMMARY: " + str(passed) + "/" + str(len(tests)) + " passed")\nsys.exit(0 if passed == len(tests) else 1)\n'
        },
        'QA-MAN-031': {
            'target_function': 'calculate_checkout_total(subtotal: float, shipping: float, coupon: str = None) -> float',
            'harness_code': '\nimport sys\n\ntests = [\n    ("sem_cupom_nominal", lambda: calculate_checkout_total(249.0, 35.0, None) == 284.0, "Subtotal + frete nominal sem cupom"),\n    ("cupom_valido_10_pct", lambda: calculate_checkout_total(249.0, 35.0, "VAULT10") == 259.10, "10% de desconto sobre produtos"),\n    ("cupom_invalido_ignorado", lambda: calculate_checkout_total(249.0, 35.0, "INVALIDO") == 284.0, "Cupom invalido mantem total inalterado"),\n    ("subtotal_zerado", lambda: calculate_checkout_total(0.0, 35.0, "VAULT10") == 35.0, "Subtotal zero com frete fixo"),\n]\n\npassed = 0\nfailed_cases = []\n\nfor name, test_fn, desc in tests:\n    try:\n        if test_fn():\n            passed += 1\n            print("PASS: " + name)\n        else:\n            failed_cases.append((name, desc))\n            print("FAIL: " + name + " - " + desc)\n    except Exception as e:\n        failed_cases.append((name, str(e)))\n        print("ERROR: " + name + " - " + str(e))\n\nprint("SUMMARY: " + str(passed) + "/" + str(len(tests)) + " passed")\nsys.exit(0 if passed == len(tests) else 1)\n'
        }
    }

    @classmethod
    def run_free_script(cls, code: str, language: str = 'python') -> dict:
        return PistonClient.execute(code=code, language=language)

    @classmethod
    def verify_solution(
        cls,
        topic: Topic,
        session_seed: str,
        student_code: str,
        language: str = 'python'
    ) -> CodeSubmission:
        harness_info = cls.HARNESSES.get(topic.code, cls.HARNESSES['QA-MAN-012'])
        composite_code = f"{student_code}\n\n# --- TEST HARNESS ---\n{harness_info['harness_code']}"

        result = PistonClient.execute(
            code=composite_code,
            language=language,
            run_timeout=2000
        )

        stdout = result.get('stdout', '')
        stderr = result.get('stderr', '')
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
        elif 'Killed' in stderr or status_raw == 'RE' and 'Memory' in stderr:
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
            match = re.search(r'SUMMARY: (\d+)/(\d+) passed', stdout)
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

        return CodeSubmission.objects.create(
            topic=topic,
            session_seed=session_seed,
            language=language,
            code=student_code,
            stdout=stdout,
            stderr=stderr,
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
