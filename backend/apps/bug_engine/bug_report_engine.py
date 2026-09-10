import re
from typing import Dict, Any, List, Optional, Tuple
from django.contrib.auth.models import User
from apps.curriculum.models import Topic, GuidanceLevel
from apps.bug_engine.models import ScopedBehavior, BugSeverity
from apps.bug_engine.services import ScopedSeedService
from apps.evaluation.models import Submission

class BugReportEvaluationEngine:
    """
    Motor de avaliação determinístico para redação de Bug Reports (Trilha 02).
    Implementa a rubrica formal da ADR-0014 com detecção morfológica tolerante (Reparo 3):
    1. title_clarity (20%): Componente + anomalia, 20-120 chars, ausência de termos emotivos/ruído.
    2. steps_quality (30%): >= 2 passos sequenciais com verbos de ação morfológicos (-ar/-er/-ir ou imperativo) e menção a dados contextuais.
    3. expected_vs_actual (30%): Contraste oracular substancial, dissimilaridade léxica cruzada.
    4. severity_alignment (20%): Calibração de severidade em relação ao defeito nominal.
    Suporta triagem forense de relatórios de terceiros para QA-REP-031.
    """

    PROHIBITED_TITLE_BUZZWORDS = [
        "não funciona", "nao funciona", "bug horroroso", "urgente",
        "quebrou", "socorro", "lixo", "estragado", "porcaria",
        "horrível", "pessimo", "péssimo", "ajuda", "travou tudo"
    ]

    IMPERATIVE_VERBS = {
        "abra", "acesse", "clique", "digite", "insira", "navegue",
        "preencha", "selecione", "submeta", "verifique", "informe",
        "envie", "marque", "confira", "teste", "observe", "adicione",
        "limpe", "remova", "coloque", "tente", "volte", "avance",
        "atualize", "recarregue", "aperte", "pressione", "valide",
        "aplique", "escolha", "desmarque", "delete", "copie", "cole"
    }

    SEVERITY_SCALE = ["minor", "major", "critical", "blocker"]

    @classmethod
    def evaluate(
        cls,
        topic: Topic,
        session_seed: str,
        bug_report: Dict[str, Any],
        user: Optional[User] = None
    ) -> Submission:
        active_behaviors = ScopedSeedService.get_active_behaviors_for_session(topic, session_seed)
        active_codes = [b.code for b in active_behaviors]

        title = str(bug_report.get('title', '')).strip()
        raw_steps = bug_report.get('steps', [])
        expected_result = str(bug_report.get('expected_result', '')).strip()
        actual_result = str(bug_report.get('actual_result', '')).strip()
        reported_severity = str(bug_report.get('severity', 'minor')).strip().lower()
        reported_priority = str(bug_report.get('priority', 'p2')).strip().lower()
        associated_behavior_code = str(bug_report.get('associated_behavior', '')).strip()
        triaged_vices = bug_report.get('triaged_vices', [])

        # 1. Avaliar Clareza do Título (20%)
        title_score, title_diag = cls._evaluate_title_clarity(title, topic)

        # 2. Avaliar Qualidade dos Passos (30%) - Tolerante & Morfológico
        steps_score, steps_diag, normalized_steps = cls._evaluate_steps_quality(raw_steps)

        # 3. Avaliar Contraste Oracular (30%)
        contrast_score, contrast_diag = cls._evaluate_expected_vs_actual(expected_result, actual_result)

        # 4. Avaliar Alinhamento de Severidade (20%)
        target_behavior = None
        if associated_behavior_code:
            target_behavior = ScopedBehavior.objects.filter(code=associated_behavior_code, topic=topic).first()
        if not target_behavior and active_behaviors:
            target_behavior = active_behaviors[0]

        severity_score, severity_diag = cls._evaluate_severity(reported_severity, target_behavior)

        # Pontuação combinada da redação
        rubric_score = (
            (title_score * 0.20) +
            (steps_score * 0.30) +
            (contrast_score * 0.30) +
            (severity_score * 0.20)
        )

        # Caso especial: QA-REP-031 (Triagem de Relatórios Legados)
        vices_diag = ""
        if topic.code == "QA-REP-031":
            expected_vices = {"missing_steps", "vague_title", "no_environment", "missing_expected_result"}
            submitted_vices = set(triaged_vices) if isinstance(triaged_vices, list) else set()
            hits = len(submitted_vices.intersection(expected_vices))
            total_vices = len(expected_vices)
            vices_score = (hits / total_vices) * 100.0 if total_vices > 0 else 100.0
            final_score = round((vices_score * 0.30) + (rubric_score * 0.70), 1)
            vices_diag = f" | Triagem de Vícios: {vices_score:.0f}% ({hits}/{total_vices} detectados)"
        else:
            final_score = round(rubric_score, 1)

        # Limiar por nível
        guidance_level = topic.module.guidance_level
        thresholds = {
            GuidanceLevel.DIRECT: 70.0,
            GuidanceLevel.SUBTLE: 85.0,
            GuidanceLevel.AUTONOMOUS: 100.0,
        }
        threshold = thresholds.get(guidance_level, 70.0)
        is_approved = (final_score >= threshold)

        # Diagnóstico e feedback formativo
        feedback_summary = (
            f"Relatório Técnico Avaliado: {final_score:.1f}% (Corte: {threshold:.0f}%)\n"
            f"• Título: {title_score:.0f}% ({title_diag})\n"
            f"• Passos: {steps_score:.0f}% ({steps_diag})\n"
            f"• Contraste Oracular: {contrast_score:.0f}% ({contrast_diag})\n"
            f"• Severidade: {severity_score:.0f}% ({severity_diag})"
            f"{vices_diag}"
        )

        feedback_hint = cls._generate_feedback_hint(
            title_score, steps_score, contrast_score, severity_score, is_approved, topic
        )

        submission = Submission.objects.create(
            topic=topic,
            session_seed=session_seed,
            reported_behaviors=[associated_behavior_code] if associated_behavior_code else [],
            active_behaviors_snapshot=active_codes,
            precision_score=round((title_score + contrast_score) / 2.0, 1),
            recall_score=round((steps_score + severity_score) / 2.0, 1),
            final_score=final_score,
            threshold_applied=threshold,
            is_approved=is_approved,
            feedback_hint=feedback_hint,
            feedback_summary=feedback_summary
        )

        try:
            from apps.gamification.models import PracticeActivity
            from apps.gamification.services import GamificationService
            act_user = user or User.objects.filter(is_superuser=True).first() or User.objects.get_or_create(username='thiago')[0]
            GamificationService.record_submission_activity(
                user=act_user,
                activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                topic=topic,
                is_approved=is_approved,
                score=final_score,
                reference_id=submission.id
            )
        except Exception:
            pass

        return submission

    @classmethod
    def _evaluate_title_clarity(cls, title: str, topic: Topic) -> Tuple[float, str]:
        if not title:
            return 0.0, "Título ausente"

        length = len(title)
        lower_title = title.lower()

        for buzzword in cls.PROHIBITED_TITLE_BUZZWORDS:
            if buzzword in lower_title:
                return 0.0, f"Contém adjetivação emocional/ruído proibido ('{buzzword}')"

        if length < 15:
            return 20.0, "Título excessivamente conciso/vago (< 15 caracteres)"
        if length > 140:
            return 40.0, "Título excessivamente prolixo (> 140 caracteres)"

        technical_keywords = ["checkout", "carrinho", "idade", "frete", "cupom", "documento",
                              "botão", "botao", "campo", "pagamento", "valor", "máscara", "mascara",
                              "pedido", "input", "select", "total", "sedex", "pix", "resumo"]
        has_component = any(kw in lower_title for kw in technical_keywords)

        if 20 <= length <= 120 and has_component:
            return 100.0, "Título conciso, técnico e contextualizado"
        elif 20 <= length <= 120:
            return 80.0, "Bom comprimento, mas recomendável citar o elemento afetado"
        else:
            return 70.0, "Comprimento aceitável"

    @classmethod
    def _evaluate_steps_quality(cls, raw_steps: Any) -> Tuple[float, str, List[str]]:
        lines = []
        if isinstance(raw_steps, list):
            lines = [str(s).strip() for s in raw_steps if str(s).strip()]
        elif isinstance(raw_steps, str):
            raw_text = raw_steps.strip()
            if '\n' in raw_text:
                lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
            elif re.search(r'\d+\.\s+', raw_text):
                parts = re.split(r'(?=\d+\.\s+)', raw_text)
                lines = [p.strip() for p in parts if p.strip()]
            elif ';' in raw_text:
                lines = [p.strip() for p in raw_text.split(';') if p.strip()]
            else:
                lines = [raw_text]

        cleaned_steps = []
        for line in lines:
            cleaned = re.sub(r'^(?:\d+[\.\)\-]?|(?:passo|step)\s*\d*[:\.\-]?|[\-\*/•>–—▪▫])\s*', '', line, flags=re.IGNORECASE).strip()
            if len(cleaned) >= 4:
                cleaned_steps.append(cleaned)

        if len(cleaned_steps) < 2:
            return 10.0, "Passos insuficientes (necessário ao menos 2 ações sequenciais)", cleaned_steps

        steps_with_action_verb = 0
        has_context_data = False

        for step in cleaned_steps:
            tokens = [t.lower().strip('.,:;()[]"') for t in step.split()[:4]]
            step_has_verb = False
            for token in tokens:
                if len(token) >= 3 and (token.endswith('ar') or token.endswith('er') or token.endswith('ir')):
                    step_has_verb = True
                    break
                if token in cls.IMPERATIVE_VERBS:
                    step_has_verb = True
                    break
            if step_has_verb:
                steps_with_action_verb += 1

            if re.search(r'\d+|["\'].+?["\']|vault10|sedex|pix', step, re.IGNORECASE):
                has_context_data = True

        verb_ratio = steps_with_action_verb / len(cleaned_steps)

        if verb_ratio >= 0.75 and has_context_data and len(cleaned_steps) >= 3:
            return 100.0, f"{len(cleaned_steps)} passos isolados, verbos de ação e valores de teste presentes", cleaned_steps
        elif verb_ratio >= 0.5:
            score = 80.0 if has_context_data else 70.0
            return score, f"{len(cleaned_steps)} passos identificados com boa atomicidade", cleaned_steps
        else:
            return 50.0, f"{len(cleaned_steps)} passos detectados, mas prefira iniciar com ações atômicas (ex: abrir, preencher, clicar)", cleaned_steps

    @classmethod
    def _evaluate_expected_vs_actual(cls, expected: str, actual: str) -> Tuple[float, str]:
        if not expected or not actual:
            return 0.0, "Resultado esperado ou obtido ausente"

        if len(expected) < 10 or len(actual) < 10:
            return 30.0, "Descrições de resultado excessivamente curtas (< 10 caracteres)"

        exp_tokens = set(re.findall(r'\w+', expected.lower()))
        act_tokens = set(re.findall(r'\w+', actual.lower()))
        union = exp_tokens.union(act_tokens)
        intersection = exp_tokens.intersection(act_tokens)

        similarity = len(intersection) / len(union) if union else 1.0
        if similarity > 0.85:
            return 0.0, "Resultado esperado e obtido idênticos (ausência de contraste oracular)"

        expected_signals = ["deve", "esperado", "bloquear", "impedir", "sucesso", "erro", "validar", "exibir", "rejeitar", "correto"]
        actual_signals = ["avança", "avanca", "permite", "ocorre", "não", "nao", "aceita", "quebra", "falha", "exibe", "ignora", "processa"]

        has_exp_signal = any(s in expected.lower() for s in expected_signals)
        has_act_signal = any(s in actual.lower() for s in actual_signals)

        if has_exp_signal and has_act_signal:
            return 100.0, "Contraste oracular claro entre especificação e falha real"
        else:
            return 80.0, "Contraste satisfatório entre esperado e obtido"

    @classmethod
    def _evaluate_severity(cls, reported_severity: str, target_behavior: Optional[ScopedBehavior]) -> Tuple[float, str]:
        if not target_behavior:
            return 75.0, "Severidade aceita (sem anomalia de referência específica)"

        nominal_severity = str(target_behavior.severity).lower()
        if reported_severity == nominal_severity:
            return 100.0, f"Severidade calibrada com precisão ({reported_severity.upper()})"

        try:
            nominal_idx = cls.SEVERITY_SCALE.index(nominal_severity)
            reported_idx = cls.SEVERITY_SCALE.index(reported_severity)
            distance = abs(nominal_idx - reported_idx)
        except ValueError:
            distance = 2

        if distance == 1:
            return 60.0, f"Severidade aproximada ({reported_severity.upper()} vs nominal {nominal_severity.upper()})"
        else:
            return 10.0, f"Divergência grosseira de impacto ({reported_severity.upper()} vs nominal {nominal_severity.upper()})"

    @classmethod
    def _generate_feedback_hint(
        cls,
        title_score: float,
        steps_score: float,
        contrast_score: float,
        severity_score: float,
        is_approved: bool,
        topic: Topic
    ) -> str:
        if is_approved:
            return "Bug report de qualidade executiva: técnico, reprodutível e com contraste oracular acionável."

        if steps_score < 70:
            return "Dica formativa: Estruture os passos em ações atômicas sequenciais (ex: 1. Acessar..., 2. Preencher..., 3. Clicar...) informando os dados exatos digitados."
        if contrast_score < 70:
            return "Dica formativa: Diferencie nitidamente o que a regra de negócio exigia (Resultado Esperado) da anomalia que você observou (Resultado Obtido)."
        if title_score < 70:
            return "Dica formativa: O título deve ser objetivo e contextualizado (Componente + Ação + Desvio), sem termos informais ou adjetivos vagos."
        if severity_score < 60:
            return "Dica formativa: Calibre o impacto sistêmico do defeito. Erros que impedem transação são Críticos/Blockers; falhas cosméticas são Menores."
        return "Revise o preenchimento do formulário técnico para atingir o limiar de conformidade da norma."
