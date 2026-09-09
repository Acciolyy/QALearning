import hashlib
import json
import random
from typing import List, Optional, Set, Dict, Any
from apps.curriculum.models import Topic
from .models import ScopedBehavior

class ScopedSeedService:
    """
    Serviço determinístico de sorteio de comportamentos escopados por tópico.
    Garante que:
    1. Apenas comportamentos estritamente pertencentes ao tópico solicitado possam ser ativados.
    2. A mesma semente (seed) produza exatamente os mesmos comportamentos ativados.
    3. O histórico seja auditável e reproduzível para ensino de Bug Reports profissionais.
    """

    @staticmethod
    def hash_seed(seed_input: str) -> int:
        """Converte qualquer string de semente (ex: '#481029' ou 'uuid') em um inteiro consistente."""
        clean = seed_input.replace('#', '').strip()
        if clean.isdigit():
            return int(clean)
        return int(hashlib.md5(clean.encode('utf-8')).hexdigest()[:8], 16)

    @classmethod
    def get_active_behaviors_for_session(
        cls,
        topic: Topic,
        session_seed: str,
        sample_size: int = 2
    ) -> List[ScopedBehavior]:
        """
        Retorna o subconjunto de comportamentos ativos para a sessão determinística.
        """
        seed_val = cls.hash_seed(session_seed)
        rng = random.Random(seed_val)

        # Busca EXCLUSIVAMENTE comportamentos deste tópico (fronteira inviolável)
        candidate_pool = list(ScopedBehavior.objects.filter(topic=topic, is_defect=True).order_by('code'))

        if not candidate_pool:
            return []

        k = min(sample_size, len(candidate_pool))
        # Shuffle determinístico a partir da semente da sessão
        shuffled = list(candidate_pool)
        rng.shuffle(shuffled)
        return shuffled[:k]


class BugState:
    """
    Helper de estado de injeção determinística de comportamentos para mini-sites.
    Disponibilizado no contexto das views dos mini-sites para consultar se um desvio
    está ativo ou se o fluxo deve se comportar de forma nominal (oráculo).
    """

    def __init__(self, topic: Topic, session_seed: str, sample_size: int = 2):
        self.topic = topic
        self.session_seed = session_seed or "default_seed"
        self._active_behaviors = ScopedSeedService.get_active_behaviors_for_session(
            topic=self.topic,
            session_seed=self.session_seed,
            sample_size=sample_size
        )
        self._active_codes_set: Set[str] = {b.code for b in self._active_behaviors}
        self._behavior_map: Dict[str, ScopedBehavior] = {b.code: b for b in self._active_behaviors}

    @property
    def active_behaviors(self) -> List[ScopedBehavior]:
        return self._active_behaviors

    @property
    def active_codes(self) -> Set[str]:
        return self._active_codes_set

    def is_active(self, code: str) -> bool:
        """Verifica se determinado código de bug está ativo nesta sessão."""
        return code in self._active_codes_set

    def get_behavior(self, code: str) -> Optional[ScopedBehavior]:
        """Retorna a instância do comportamento se ativo, ou None."""
        return self._behavior_map.get(code)

    def to_dict(self) -> Dict[str, Any]:
        """Serializa os comportamentos ativos para o payload inicial do mini-site/bridge."""
        return {
            "topic_code": self.topic.code,
            "topic_title": self.topic.title,
            "session_seed": self.session_seed,
            "active_behaviors": [
                {
                    "code": b.code,
                    "title": b.title,
                    "category": b.category,
                    "severity": b.severity,
                    "trigger_element": b.trigger_element,
                    "trigger_action": b.trigger_action,
                    "trigger_value": b.trigger_value,
                }
                for b in self._active_behaviors
            ]
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict())
