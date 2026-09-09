/**
 * QALearning - Mini-Site QA Bridge (Protocol V1)
 * Estabelece o canal de telemetria e injeção de eventos entre o mini-site
 * sandboxed e a Mesa de Investigação (Hub Next.js).
 */
(function(window) {
  'use strict';

  const PROTOCOL_VERSION = 'QA_LEARNING_V1';

  // Extração de metadados da sessão a partir de tags <meta>
  function getMetaContent(name) {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el ? el.getAttribute('content') : '';
  }

  const topicCode = getMetaContent('qa-topic-code') || 'QA-GENERAL';
  const sessionSeed = getMetaContent('qa-session-seed') || '000000';

  // Disparo seguro de postMessage para a janela pai
  function postToHub(eventType, payload) {
    if (window.parent && window.parent !== window) {
      const message = {
        protocol: PROTOCOL_VERSION,
        topicCode: topicCode,
        sessionSeed: sessionSeed,
        eventType: eventType,
        payload: payload || {},
        timestamp: Date.now()
      };
      window.parent.postMessage(message, '*');
    }
  }

  // Objeto público do Bridge
  const QABridge = {
    protocol: PROTOCOL_VERSION,
    topicCode: topicCode,
    sessionSeed: sessionSeed,

    /**
     * Reporta ao Hub que um desvio/bug ativo foi acionado pelo usuário
     */
    reportBug: function(behaviorCode, details) {
      console.warn(`[QA Bridge] BUG DISPARADO: ${behaviorCode}`, details);
      postToHub('BUG_TRIGGERED', {
        behaviorCode: behaviorCode,
        element: (details && details.element) || '',
        action: (details && details.action) || 'interaction',
        inputValue: (details && details.inputValue) || '',
        message: (details && details.message) || '',
        actualBehavior: (details && details.actualBehavior) || '',
        timestamp: Date.now()
      });

      // Feedback visual tátil e temporário no iframe
      QABridge.showTelemetryPing(`BUG DETECTADO: #${behaviorCode}`);
    },

    /**
     * Reporta uma ação exploratória regular (passo de teste)
     */
    notifyStep: function(actionName, details) {
      postToHub('STEP_PERFORMED', {
        action: actionName,
        details: details || {},
        timestamp: Date.now()
      });
    },

    /**
     * Exibe um breve toast discreto de telemetria no topo do mini-site
     */
    showTelemetryPing: function(text) {
      let toast = document.getElementById('qa-bridge-telemetry-pill');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'qa-bridge-telemetry-pill';
        toast.style.cssText = [
          'position: fixed',
          'top: 10px',
          'right: 12px',
          'background-color: #8C2F2F',
          'color: #FFFFFF',
          'font-family: monospace',
          'font-size: 11px',
          'font-weight: bold',
          'padding: 4px 10px',
          'border-radius: 4px',
          'box-shadow: 0 2px 6px rgba(0,0,0,0.3)',
          'z-index: 99999',
          'pointer-events: none',
          'transition: opacity 0.3s ease',
          'opacity: 0'
        ].join(';');
        document.body.appendChild(toast);
      }
      toast.textContent = text;
      toast.style.opacity = '1';
      setTimeout(() => {
        if (toast) toast.style.opacity = '0';
      }, 2500);
    },

    /**
     * Notifica o Hub que o mini-site concluiu a carga e está pronto
     */
    init: function() {
      postToHub('MINI_SITE_READY', {
        url: window.location.href,
        topicCode: topicCode,
        sessionSeed: sessionSeed
      });

      // Escuta comandos vindos do Hub (ex: PING, RESET_FORM)
      window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data || data.protocol !== PROTOCOL_VERSION) return;

        if (data.eventType === 'RESET_FORM') {
          const form = document.querySelector('form');
          if (form) form.reset();
        }
      });
    }
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', QABridge.init);
  } else {
    QABridge.init();
  }

  window.QABridge = QABridge;
})(window);
