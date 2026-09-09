import hashlib
import random
from typing import List
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
        """Converte qualquer string de semente (ex: '#481029' ou 'uuid') em um inteiro de 32 bits."""
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
        candidate_pool = list(ScopedBehavior.objects.filter(topic=topic, is_defect=True))

        if not candidate_pool:
            return []

        # Determina o número de comportamentos a sortear
        k = min(sample_size, len(candidate_pool))

        # Sorteio com pesos determinísticos
        # Usamos shuffle determinístico do pool
        rng.shuffle(candidate_pool)
        return candidate_pool[:k]
