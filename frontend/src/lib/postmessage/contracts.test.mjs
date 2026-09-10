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


// ADR-0009: Implementa??o can?nica do filtro de escopo do Workbench
function filterWorkbenchEvidences(evidences, activeTopicCode) {
  if (!activeTopicCode || !Array.isArray(evidences)) return [];
  return evidences.filter(
    ev => Boolean(ev.topicCode) && ev.topicCode === activeTopicCode
  );
}

test('ADR-0009: Dossi? do Workbench filtra estritamente pelo t?pico ativo', () => {
  const sessionLedger = [
    { code: 'VAL-AGE-001', topicCode: 'QA-MAN-012', title: 'Idade 17 anos aceita sem bloqueio' },
    { code: 'SAN-WSP-004', topicCode: 'QA-MAN-011', title: 'Campo Nome aceita espa?os vazios' },
    { code: 'WHT-BRN-001', topicCode: 'QA-WHT-011', title: 'Cupom expirado n?o bloqueado no if' },
    { code: 'ORPHAN-001', title: 'Evid?ncia sem topicCode' }
  ];

  // Ao abrir o Workbench da Trilha 06 (QA-WHT-011), anomalias de outras trilhas (VAL-AGE-001, SAN-WSP-004)
  // e anomalias ?rf?s s?o sumariamente exclu?das
  const whiteBoxDossier = filterWorkbenchEvidences(sessionLedger, 'QA-WHT-011');
  assert.equal(whiteBoxDossier.length, 1);
  assert.equal(whiteBoxDossier[0].code, 'WHT-BRN-001');
  assert.equal(whiteBoxDossier[0].topicCode, 'QA-WHT-011');

  // Nenhuma evid?ncia de QA-MAN-011 ou QA-MAN-012 pode constar no dossi? de QA-WHT-011
  assert.equal(whiteBoxDossier.some(e => e.code === 'VAL-AGE-001'), false);
  assert.equal(whiteBoxDossier.some(e => e.code === 'SAN-WSP-004'), false);
  assert.equal(whiteBoxDossier.some(e => e.code === 'ORPHAN-001'), false);

  // Se o t?pico n?o tiver nenhuma evid?ncia coletada para ele, o dossi? deve retornar vazio (0 itens)
  const emptyDossier = filterWorkbenchEvidences(sessionLedger, 'QA-WHT-032');
  assert.equal(emptyDossier.length, 0);
  assert.deepEqual(emptyDossier, []);
});

test('ADR-0009: Dossi? rejeita categoricamente evid?ncias sem topicCode ou com topicCode nulo', () => {
  const unScopedEvidences = [
    { code: 'BUG-001', topicCode: null },
    { code: 'BUG-002', topicCode: undefined },
    { code: 'BUG-003' }
  ];
  const result = filterWorkbenchEvidences(unScopedEvidences, 'QA-WHT-011');
  assert.equal(result.length, 0);
});
