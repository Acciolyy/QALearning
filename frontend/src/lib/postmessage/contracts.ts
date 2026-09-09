/**
 * Contratos de Mensageria e Telemetria via postMessage
 * Protocolo: QA_LEARNING_V1
 * Comunicação segura entre o Hub (Mesa de Investigação) e os mini-sites sandboxed.
 */

export const QA_PROTOCOL_V1 = 'QA_LEARNING_V1' as const;

export type QALearningEventType =
  | 'BUG_TRIGGERED'
  | 'STEP_PERFORMED'
  | 'MINI_SITE_READY'
  | 'RESET_REQUESTED'
  | 'RESET_FORM';

export interface BugTriggeredPayload {
  behaviorCode: string;
  element?: string;
  action?: string;
  inputValue?: string;
  message?: string;
  actualBehavior?: string;
  severity?: string;
  title?: string;
  timestamp: number;
}

export interface StepPerformedPayload {
  action: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface MiniSiteReadyPayload {
  url: string;
  topicCode: string;
  sessionSeed: string;
}

export interface QALearningMessage<T = unknown> {
  protocol: typeof QA_PROTOCOL_V1;
  topicCode: string;
  sessionSeed: string;
  eventType: QALearningEventType;
  payload: T;
  timestamp: number;
}

/**
 * Validador de tipo e integridade de mensagem recebida via postMessage.
 */
export function isQALearningMessage(data: unknown): data is QALearningMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.protocol === QA_PROTOCOL_V1 && typeof msg.eventType === 'string';
}

/**
 * Validação de origem permitida para prevenção de CSRF/XSS.
 * No ambiente de desenvolvimento aceita origens locais (localhost e 127.0.0.1 em qualquer porta).
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin === 'null') return true; // Sandboxed iframes without allow-same-origin can have origin 'null'
  try {
    const url = new URL(origin);
    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}
