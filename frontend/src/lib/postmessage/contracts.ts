/**
 * Contratos de Mensageria e Telemetria via postMessage
 * Protocolo: QA_LEARNING_V1
 * Comunicação segura entre o Hub (Mesa de Investigação) e os mini-sites sandboxed.
 *
 * Modelo de Segurança Cross-Origin:
 * Os mini-sites são servidos a partir de uma origem estritamente separada (ex: http://127.0.0.1:8000)
 * em relação ao Hub Next.js (http://localhost:3000).
 * O validador isAllowedOrigin rejeita origens não autorizadas, 'null', ou portas de mesma origem.
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
 * Validação de origem permitida para prevenção de CSRF, XSS e evasão de sandbox.
 * Rejeita explicitamente 'null', origens de mesma porta do Hub (ex: 3000), e aceita
 * exclusivamente a origem designada dos mini-sites (ex: porta 8000 em 127.0.0.1/localhost).
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin || origin === 'null') return false;

  const configuredOrigin = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN;
  if (configuredOrigin && origin === configuredOrigin) {
    return true;
  }

  try {
    const url = new URL(origin);
    // Deve ser porta 8000 (servidor dedicado dos mini-sites / Django)
    const isPort8000 = url.port === '8000';
    const isLocalHostOrIp =
      url.hostname === '127.0.0.1' ||
      url.hostname === 'localhost' ||
      url.hostname.endsWith('.localhost');

    return isPort8000 && isLocalHostOrIp;
  } catch {
    return false;
  }
}
