import { BugEvidence } from '../../types/curriculum';

/**
 * ADR-0009: Filtra estritamente o dossiê da bancada pelo código do tópico ativo.
 * Rejeita categoricamente evidências de outros tópicos e evidências sem topicCode explícito.
 */
export function filterWorkbenchEvidences(
  evidences: BugEvidence[],
  activeTopicCode: string
): BugEvidence[] {
  if (!activeTopicCode || !Array.isArray(evidences)) return [];
  return evidences.filter(
    ev => Boolean(ev.topicCode) && ev.topicCode === activeTopicCode
  );
}
