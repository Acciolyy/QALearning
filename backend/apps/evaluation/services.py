from django.contrib.auth.models import User
from typing import List, Set, Dict, Any
from apps.curriculum.models import Topic, GuidanceLevel
from apps.bug_engine.services import ScopedSeedService
from apps.bug_engine.models import ScopedBehavior
from .models import Submission

class EvaluationService:
    """
    Motor de avaliação formativa não-binária de auditorias e bug reports.
    Implementa:
    1. Tratamento explícito de sessões sem bugs (premiação por zero falsos alarmes).
    2. Cálculo de precisão e cobertura não-binários.
    3. Limiares de aprovação estritos por nível:
       - Direct (Módulo 1): >= 70%
       - Subtle (Módulo 2): >= 85%
       - Autonomous (Módulo 3): 100%
    4. Feedback formativo com dica única escalonada sem revelar a resposta.
    """

    THRESHOLDS = {
        GuidanceLevel.DIRECT: 70.0,
        GuidanceLevel.SUBTLE: 85.0,
        GuidanceLevel.AUTONOMOUS: 100.0,
    }


    @classmethod
    def evaluate_bug_report(
        cls,
        topic: Topic,
        session_seed: str,
        bug_report: Dict[str, Any],
        user: User = None
    ) -> Submission:
        from apps.bug_engine.bug_report_engine import BugReportEvaluationEngine
        return BugReportEvaluationEngine.evaluate(
            topic=topic,
            session_seed=session_seed,
            bug_report=bug_report,
            user=user
        )

    @classmethod
    def evaluate_submission(
        cls,
        topic: Topic,
        session_seed: str,
        reported_codes: List[str],
        user: User = None
    ) -> Submission:
        active_behaviors = ScopedSeedService.get_active_behaviors_for_session(topic, session_seed)
        active_codes = {b.code for b in active_behaviors}
        reported_codes_set = set(reported_codes)

        guidance_level = topic.module.guidance_level
        threshold = cls.THRESHOLDS.get(guidance_level, 70.0)

        # -------------------------------------------------------------
        # CASO 1: Sessão com Zero Bugs Ativos (Aplicação Nominal)
        # -------------------------------------------------------------
        if len(active_codes) == 0:
            if len(reported_codes_set) == 0:
                # Aluno acertou: não inventou falsos positivos!
                precision = 100.0
                recall = 100.0
                final_score = 100.0
                is_approved = True
                summary = (
                    "Excelente discernimento técnico: a aplicação operou estritamente conforme "
                    "o oráculo e nenhum falso alarme foi reportado. Saber validar a conformidade "
                    "sem levantar incidentes fictícios é uma das marcas de senioridade em QA."
                )
                hint = ""
            else:
                # Aluno falhou: levantou falsos alarmes onde tudo estava correto
                precision = 0.0
                recall = 0.0
                final_score = 0.0
                is_approved = False
                summary = (
                    f"Falso alarme: a aplicação comportou-se de acordo com os critérios de aceite "
                    f"nesta rodada, mas {len(reported_codes_set)} anomalia(s) inexistente(s) foram reportadas."
                )
                hint = (
                    "Atenção aos critérios do oráculo: certifique-se de que o comportamento observado "
                    "realmente viola uma regra especificada antes de abrir um chamado."
                )

            sub = Submission.objects.create(
                topic=topic,
                session_seed=session_seed,
                reported_behaviors=list(reported_codes_set),
                active_behaviors_snapshot=list(active_codes),
                precision_score=precision,
                recall_score=recall,
                final_score=final_score,
                threshold_applied=threshold,
                is_approved=is_approved,
                feedback_hint=hint,
                feedback_summary=summary
            )
            from apps.gamification.models import PracticeActivity
            from apps.gamification.services import GamificationService
            act_user = user or User.objects.filter(is_superuser=True).first() or User.objects.get_or_create(username='thiago')[0]
            GamificationService.record_submission_activity(
                user=act_user,
                activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
                topic=topic,
                is_approved=is_approved,
                score=final_score,
                reference_id=sub.id
            )
            return sub

        # -------------------------------------------------------------
        # CASO 2: Sessão com Bugs Ativos Presentes
        # -------------------------------------------------------------
        hits = reported_codes_set.intersection(active_codes)
        false_positives = reported_codes_set.difference(active_codes)
        misses = active_codes.difference(reported_codes_set)

        recall = (len(hits) / len(active_codes)) * 100.0
        precision = (len(hits) / max(len(reported_codes_set), 1)) * 100.0 if reported_codes_set else 0.0
        final_score = round((0.6 * recall) + (0.4 * precision), 1)

        # Regra de aprovação estrita pelo limiar do módulo
        is_approved = (final_score >= threshold)

        # Elaboração do diagnóstico formativo
        if is_approved:
            if final_score == 100.0:
                summary = (
                    "Auditoria perfeita! Todos os desvios foram mapeados com precisão cirúrgica "
                    "e zero falsos positivos registrados."
                )
            else:
                summary = (
                    f"Auditoria aprovada com {final_score:.1f}% de assertividade ({len(hits)}/{len(active_codes)} "
                    f"anomalias identificadas). Superou o limiar de corte exigido de {threshold}%."
                )
            hint = ""
        else:
            summary = (
                f"Auditoria insuficiente: score obtido de {final_score:.1f}% abaixo do limiar "
                f"de {threshold}% exigido para o nível {topic.module.get_guidance_level_display()}."
            )

            # Seleção de DICA ÚNICA ESCALONADA (nunca dá a resposta pronta)
            if misses:
                # Localiza a primeira anomalia omitida
                missed_code = sorted(list(misses))[0]
                missed_beh = next((b for b in active_behaviors if b.code == missed_code), None)

                if guidance_level == GuidanceLevel.DIRECT and missed_beh:
                    hint = missed_beh.hint_direct or f"Dedique atenção especial ao elemento {missed_beh.trigger_element}."
                elif guidance_level == GuidanceLevel.SUBTLE and missed_beh:
                    hint = missed_beh.hint_subtle or "Considere testar dados limítrofes e combinações atípicas de preenchimento."
                else: # AUTONOMOUS
                    hint = "Revise a matriz de requisitos e os critérios de aceite. O nível de autonomia real não fornece pistas adicionais."
            elif false_positives:
                hint = "Você reportou elementos que se comportam estritamente de acordo com o oráculo. Elimine os falsos positivos para elevar seu score."
            else:
                hint = "Submeta suas evidências para avaliação."

        sub = Submission.objects.create(
            topic=topic,
            session_seed=session_seed,
            reported_behaviors=list(reported_codes_set),
            active_behaviors_snapshot=list(active_codes),
            precision_score=round(precision, 1),
            recall_score=round(recall, 1),
            final_score=final_score,
            threshold_applied=threshold,
            is_approved=is_approved,
            feedback_hint=hint,
            feedback_summary=summary
        )
        from apps.gamification.models import PracticeActivity
        from apps.gamification.services import GamificationService
        act_user = user or User.objects.filter(is_superuser=True).first() or User.objects.get_or_create(username='thiago')[0]
        GamificationService.record_submission_activity(
            user=act_user,
            activity_type=PracticeActivity.ActivityType.AUDIT_SUBMISSION,
            topic=topic,
            is_approved=is_approved,
            score=final_score,
            reference_id=sub.id
        )
        return sub
