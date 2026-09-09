import test from 'node:test';
import assert from 'node:assert/strict';

// Helper de validação direta replicando contracts.ts
function isAllowedOrigin(origin) {
  if (!origin || origin === 'null') return false;

  const configuredOrigin = process.env.NEXT_PUBLIC_MINI_SITES_ORIGIN;
  if (configuredOrigin && origin === configuredOrigin) {
    return true;
  }

  try {
    const url = new URL(origin);
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

function isQALearningMessage(data) {
  if (!data || typeof data !== 'object') return false;
  return data.protocol === 'QA_LEARNING_V1' && typeof data.eventType === 'string';
}

test('isAllowedOrigin: aceita porta 8000 em localhost e 127.0.0.1', () => {
  assert.equal(isAllowedOrigin('http://127.0.0.1:8000'), true);
  assert.equal(isAllowedOrigin('http://localhost:8000'), true);
  assert.equal(isAllowedOrigin('http://minisites.localhost:8000'), true);
});

test('isAllowedOrigin: rejeita mesma porta do Hub (3000) e origens perigosas', () => {
  // Rejeita mesma porta do Hub para impedir self-loop/same-origin breakout
  assert.equal(isAllowedOrigin('http://localhost:3000'), false);
  assert.equal(isAllowedOrigin('http://127.0.0.1:3000'), false);

  // Rejeita origem opaque 'null'
  assert.equal(isAllowedOrigin('null'), false);
  assert.equal(isAllowedOrigin(''), false);
  assert.equal(isAllowedOrigin(undefined), false);

  // Rejeita domínios externos não autorizados
  assert.equal(isAllowedOrigin('http://attacker.com:8000'), false);
  assert.equal(isAllowedOrigin('https://phishing.com'), false);
});

test('isQALearningMessage: valida protocolo QA_LEARNING_V1', () => {
  assert.equal(isQALearningMessage({
    protocol: 'QA_LEARNING_V1',
    eventType: 'BUG_TRIGGERED',
    payload: { behaviorCode: 'VAL-AGE-001' }
  }), true);

  // Mensagens arbitrárias de terceiros são rejeitadas
  assert.equal(isQALearningMessage({ type: 'webpackOk' }), false);
  assert.equal(isQALearningMessage({ protocol: 'OTHER_PROTOCOL', eventType: 'TEST' }), false);
  assert.equal(isQALearningMessage(null), false);
  assert.equal(isQALearningMessage('string-message'), false);
});
