import { BugEvidence } from '../../types/curriculum';

/**
 * ADR-0009: Filtra estritamente o dossi? da bancada pelo c?digo do t?pico ativo.
 * Rejeita categoricamente evid?ncias de outros t?picos e evid?ncias sem topicCode expl?cito.
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
