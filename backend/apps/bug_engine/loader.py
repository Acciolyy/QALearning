import os
import yaml
from pathlib import Path
from typing import Dict, Any, List
from django.db import transaction
from apps.curriculum.models import Topic
from apps.bug_engine.models import ScopedBehavior, BugSeverity

class CatalogValidationError(Exception):
    pass

class CatalogLoader:
    """
    Carregador e validador de catálogos declarativos de oráculos e comportamentos em YAML.
    Garante a integridade do banco de bugs e a sincronização com os tópicos pedagógicos.
    """

    DEFAULT_CATALOG_DIR = Path(__file__).resolve().parent / 'catalogs'

    @classmethod
    def load_all(cls, catalog_dir: Path = None) -> Dict[str, Any]:
        target_dir = catalog_dir or cls.DEFAULT_CATALOG_DIR
        results = {
            "files_processed": 0,
            "topics_updated": 0,
            "behaviors_synced": 0,
            "errors": []
        }

        if not os.path.exists(target_dir):
            results["errors"].append(f"Diretório de catálogos não encontrado: {target_dir}")
            return results

        yaml_files = list(Path(target_dir).rglob("*.yaml")) + list(Path(target_dir).rglob("*.yml"))

        for yml_path in yaml_files:
            try:
                topic, count = cls.load_file(yml_path)
                results["files_processed"] += 1
                results["topics_updated"] += 1
                results["behaviors_synced"] += count
            except Exception as exc:
                results["errors"].append(f"Erro em {yml_path.name}: {str(exc)}")

        return results

    @classmethod
    @transaction.atomic
    def load_file(cls, file_path: Path) -> tuple[Topic, int]:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        cls._validate_schema(data, file_path)

        topic_code = data["topic_code"]
        try:
            topic = Topic.objects.get(code=topic_code)
        except Topic.DoesNotExist:
            raise CatalogValidationError(
                f"Tópico com código '{topic_code}' não existe no banco de dados. "
                f"Certifique-se de que a trilha correspondente foi semeada."
            )

        # Atualiza oráculo e critérios de aceite no Topic
        oracle_data = data.get("oracle", {})
        if "description" in oracle_data:
            topic.oracle_description = oracle_data["description"]
        if "acceptance_criteria" in oracle_data:
            topic.oracle_criteria = oracle_data["acceptance_criteria"]
        topic.save(update_fields=["oracle_description", "oracle_criteria"])

        behaviors_count = 0
        candidate_behaviors = data.get("candidate_behaviors", [])

        for b_data in candidate_behaviors:
            cls._sync_behavior(topic, b_data)
            behaviors_count += 1

        return topic, behaviors_count

    @classmethod
    def _validate_schema(cls, data: Dict[str, Any], file_path: Path):
        if not isinstance(data, dict):
            raise CatalogValidationError(f"Formato raiz inválido em {file_path}. Deve ser um mapeamento YAML.")

        for required in ["topic_code", "oracle", "candidate_behaviors"]:
            if required not in data:
                raise CatalogValidationError(f"Campo obrigatório ausente '{required}' em {file_path}")

        oracle = data["oracle"]
        if not isinstance(oracle, dict) or "acceptance_criteria" not in oracle:
            raise CatalogValidationError(f"Seção 'oracle' deve conter lista 'acceptance_criteria' em {file_path}")

        valid_severities = set(BugSeverity.values)
        for idx, b in enumerate(data.get("candidate_behaviors", [])):
            if "code" not in b or "title" not in b:
                raise CatalogValidationError(f"Comportamento #{idx} em {file_path} sem 'code' ou 'title'")
            sev = b.get("severity", "major")
            if sev not in valid_severities:
                raise CatalogValidationError(
                    f"Severidade '{sev}' no comportamento '{b['code']}' inválida. Válidas: {valid_severities}"
                )

    @classmethod
    def _sync_behavior(cls, topic: Topic, b_data: Dict[str, Any]) -> ScopedBehavior:
        trigger = b_data.get("trigger", {})
        deviation = b_data.get("deviation", {})
        hints = b_data.get("hints", {})

        behavior, _ = ScopedBehavior.objects.update_or_create(
            topic=topic,
            code=b_data["code"],
            defaults={
                "title": b_data["title"],
                "category": b_data.get("category", "boundary_validation"),
                "severity": b_data.get("severity", BugSeverity.MAJOR),
                "weight": b_data.get("weight", 10),
                "is_defect": b_data.get("is_defect", True),
                "trigger_element": trigger.get("element", ""),
                "trigger_action": trigger.get("action", "submit_form"),
                "trigger_value": str(trigger.get("input_value", "")),
                "expected_behavior": deviation.get("expected", ""),
                "actual_behavior": deviation.get("actual", ""),
                "hint_direct": hints.get("direct", ""),
                "hint_subtle": hints.get("subtle", ""),
                "description": deviation.get("actual", b_data["title"])
            }
        )
        return behavior
