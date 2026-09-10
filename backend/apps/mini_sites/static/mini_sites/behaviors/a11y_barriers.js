/**
 * Comportamento Modular: Barreiras de Acessibilidade WCAG 2.1 AA
 * Trilha: 12 (Testes de Acessibilidade WCAG)
 * Documentado em ADR-0013
 */
(function() {
  'use strict';

  function isBugActive(code) {
    return window.__ACTIVE_BUG_CODES__ && window.__ACTIVE_BUG_CODES__.includes(code);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const couponInput = document.getElementById('coupon-code');
    const taxInput = document.getElementById('tax-id');
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('submit-order');
    const paymentSelect = document.getElementById('payment-method');

    // 1. Foco Invisível Suprimido (WCAG 2.4.7) - Bug A11-FOC-001
    if (isBugActive('A11-FOC-001')) {
      const focusable = document.querySelectorAll('input, button, select, a');
      focusable.forEach(function(el) {
        el.style.outline = 'none';
        el.style.boxShadow = 'none';
        el.addEventListener('focus', function() {
          if (window.QABridge) {
            window.QABridge.reportBug('A11-FOC-001', {
              element: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
              action: 'focus',
              actualBehavior: 'Foco invisível: outline e indicador visual completamente suprimidos ao tabular.'
            });
          }
        });
      });
    }

    // 2. Armadilha de Teclado no Cupom (WCAG 2.1.2) - Bug A11-TRP-001
    if (couponInput && isBugActive('A11-TRP-001')) {
      couponInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
          couponInput.focus();
          if (window.QABridge) {
            window.QABridge.reportBug('A11-TRP-001', {
              element: 'input#coupon-code',
              action: 'tab_navigation',
              actualBehavior: 'Armadilha de foco: Tecla Tab não avança para o botão aplicar cupom.'
            });
          }
        }
      });
    }

    // 3. Ordem de Tabulação Desordenada (WCAG 2.4.3) - Bug A11-ORD-001
    if (isBugActive('A11-ORD-001')) {
      const nameInput = document.getElementById('user-name');
      const emailInput = document.getElementById('user-email');
      if (nameInput && emailInput) {
        emailInput.setAttribute('tabindex', '1');
        nameInput.setAttribute('tabindex', '2');
        emailInput.addEventListener('focus', function() {
          if (window.QABridge) {
            window.QABridge.reportBug('A11-ORD-001', {
              element: 'input#user-email',
              action: 'focus_order',
              actualBehavior: 'Ordem de foco incoerente: Email recebeu foco antes do Nome Completo.'
            });
          }
        });
      }
    }

    // 4. Foco Perdido ao Limpar ou Alternar (WCAG 2.4.3) - Bug A11-TRP-002
    const clearBtn = document.getElementById('history-back-sim');
    if (clearBtn && isBugActive('A11-TRP-002')) {
      clearBtn.addEventListener('click', function() {
        document.body.focus();
        if (window.QABridge) {
          window.QABridge.reportBug('A11-TRP-002', {
            element: 'body',
            action: 'focus_lost',
            actualBehavior: 'Foco perdido para o body após acionamento de controle de histórico.'
          });
        }
      });
    }

    // 5. Baixo Contraste em Dicas e Textos Secundários (WCAG 1.4.3) - Bug A11-CTR-001
    if (isBugActive('A11-CTR-001')) {
      const mutedTexts = document.querySelectorAll('label, .field-hint, .order-item div:last-child');
      mutedTexts.forEach(function(el) {
        el.style.color = '#555E68'; // Razão ~2.3:1 contra fundo #151C22 (falha grave WCAG AA)
      });
      if (window.QABridge) {
        window.QABridge.reportBug('A11-CTR-001', {
          element: 'label',
          action: 'contrast_audit',
          actualBehavior: 'Contraste de texto secundário medido em 2.3:1 (mínimo exigido 4.5:1).'
        });
      }
    }

    // 6. Contraste Insuficiente no Botão Secundário (WCAG 1.4.3) - Bug A11-CTR-002
    if (isBugActive('A11-CTR-002')) {
      const secondaryBtns = document.querySelectorAll('.btn-secondary');
      secondaryBtns.forEach(function(btn) {
        btn.style.backgroundColor = '#1F2937';
        btn.style.color = '#4B5563'; // Relação 1.8:1
        btn.addEventListener('mouseenter', function() {
          if (window.QABridge) {
            window.QABridge.reportBug('A11-CTR-002', {
              element: 'button.btn-secondary',
              action: 'contrast_hover',
              actualBehavior: 'Botão secundário com contraste insuficiente de 1.8:1.'
            });
          }
        });
      });
    }

    // 7. Ausência de aria-invalid e Mensagens Sem Vinculação (WCAG 3.3.1) - Bug A11-ARI-001
    if (form && isBugActive('A11-ARI-001')) {
      form.addEventListener('submit', function() {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(function(input) {
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
        });
        if (window.QABridge) {
          window.QABridge.reportBug('A11-ARI-001', {
            element: 'form#checkout-form',
            action: 'submit_error',
            actualBehavior: 'Mensagens de erro exibidas visualmente sem aria-invalid ou aria-describedby.'
          });
        }
      });
    }

    // 8. Rótulo Não Associado no Campo Documento (WCAG 4.1.2) - Bug A11-LBL-001
    if (taxInput && isBugActive('A11-LBL-001')) {
      const taxLabel = document.querySelector('label[for="tax-id"]');
      if (taxLabel) {
        taxLabel.removeAttribute('for');
      }
      taxInput.removeAttribute('id');
      taxInput.addEventListener('focus', function() {
        if (window.QABridge) {
          window.QABridge.reportBug('A11-LBL-001', {
            element: 'input[name="tax_id"]',
            action: 'accessible_name_check',
            actualBehavior: 'Campo de documento sem accessible name (label desvinculado sem atributo for).'
          });
        }
      });
    }

    // 9. Seletor de Pagamento Bloqueado para Teclado (WCAG 2.1.1) - Bug A11-PAY-001
    if (paymentSelect && isBugActive('A11-PAY-001')) {
      paymentSelect.setAttribute('tabindex', '-1');
      paymentSelect.addEventListener('keydown', function(e) {
        e.preventDefault();
        if (window.QABridge) {
          window.QABridge.reportBug('A11-PAY-001', {
            element: 'select#payment-method',
            action: 'keyboard_operability',
            actualBehavior: 'Seletor de forma de pagamento inacessível via teclado (tabindex=-1).'
          });
        }
      });
    }

    // 10. Status de Pedido Sem Região aria-live (WCAG 4.1.3) - Bug A11-ARI-002
    const banner = document.getElementById('feedback-banner');
    if (banner && isBugActive('A11-ARI-002')) {
      banner.removeAttribute('role');
      banner.removeAttribute('aria-live');
      if (window.QABridge) {
        window.QABridge.reportBug('A11-ARI-002', {
          element: '#feedback-banner',
          action: 'status_announcement',
          actualBehavior: 'Mensagens de alerta e confirmação não são anunciadas a leitores de tela (falta aria-live).'
        });
      }
    }

    // 11. Ausência de Marcos Semânticos na Página (WCAG 1.3.1) - Bug A11-HOM-001
    if (isBugActive('A11-HOM-001')) {
      if (window.QABridge) {
        window.QABridge.reportBug('A11-HOM-001', {
          element: 'div.container',
          action: 'landmark_audit',
          actualBehavior: 'Página estruturada exclusivamente com divs genéricas, sem marcos semânticos nav, main, aside.'
        });
      }
    }

    // 12. Elementos Clicáveis Sem Semântica de Botão (WCAG 4.1.2) - Bug A11-HOM-002
    if (isBugActive('A11-HOM-002')) {
      if (submitBtn) {
        submitBtn.addEventListener('click', function() {
          if (window.QABridge) {
            window.QABridge.reportBug('A11-HOM-002', {
              element: 'button#submit-order',
              action: 'button_semantics',
              actualBehavior: 'Botão de submissão não expõe estado acessível de loading/disabled para tecnologia assistiva.'
            });
          }
        });
      }
    }
  });
})();
