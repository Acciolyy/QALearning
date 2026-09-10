/**
 * Comportamento Modular: Validação de Formulários e Entradas
 * Trilhas: 00 (Fundamentos de QA) e 01 (Testes Manuais)
 * Documentado em ADR-0013
 */
(function() {
  'use strict';

  function isBugActive(code) {
    return window.__ACTIVE_BUG_CODES__ && window.__ACTIVE_BUG_CODES__.includes(code);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const nameInput = document.getElementById('user-name');
    const ageInput = document.getElementById('user-age');
    const emailInput = document.getElementById('user-email');
    const taxInput = document.getElementById('tax-id');
    const paymentSelect = document.getElementById('payment-method');

    // 1. Colagem e Máscara no Documento (MSK-CPF-001 / ONB-MSK-001)
    if (taxInput) {
      taxInput.addEventListener('paste', function(e) {
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (pasted.includes('.') || pasted.includes('-')) {
          if (isBugActive('MSK-CPF-001') || isBugActive('ONB-MSK-001')) {
            const bugCode = isBugActive('ONB-MSK-001') ? 'ONB-MSK-001' : 'MSK-CPF-001';
            e.preventDefault();
            const corrupted = pasted.replace(/\./g, '..').replace(/-/g, '--');
            taxInput.value = corrupted;
            if (window.QABridge) {
              window.QABridge.reportBug(bugCode, {
                element: 'input#tax-id',
                action: 'paste',
                inputValue: corrupted,
                actualBehavior: 'Máscara duplicou pontos ao colar string pontuada.'
              });
            }
          }
        }
      });
    }

    // 2. Perda de dados digitados ao trocar de foco (ONB-MAP-002)
    if (isBugActive('ONB-MAP-002') && nameInput && ageInput) {
      ageInput.addEventListener('focus', function() {
        if (nameInput.value.length > 0) {
          nameInput.value = '';
          if (window.QABridge) {
            window.QABridge.reportBug('ONB-MAP-002', {
              element: 'input#user-name',
              action: 'blur_data_loss',
              actualBehavior: 'Campo de nome perdeu o valor digitado ao alternar o foco para o campo de idade.'
            });
          }
        }
      });
    }

    // 3. Validações no Envio do Formulário
    form.addEventListener('submit', function(e) {
      const nameVal = nameInput ? nameInput.value : '';
      const ageVal = ageInput ? ageInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const paymentVal = paymentSelect ? paymentSelect.value : '';

      // Bug ONB-REQ-002: Envio com campos obrigatórios em branco avança
      if ((!nameVal || !emailVal) && isBugActive('ONB-REQ-002')) {
        if (window.QABridge) {
          window.QABridge.reportBug('ONB-REQ-002', {
            element: 'form#checkout-form',
            action: 'submit_blank_required',
            actualBehavior: 'Formulário submetido com campos obrigatórios em branco avançou sem validação.'
          });
        }
      }

      // Bug ONB-MAP-001: Submissão sem seleção de forma de pagamento avança
      if (!paymentVal && isBugActive('ONB-MAP-001')) {
        if (window.QABridge) {
          window.QABridge.reportBug('ONB-MAP-001', {
            element: 'select#payment-method',
            action: 'submit_missing_payment',
            actualBehavior: 'Formulário aceitou prosseguir sem nenhuma forma de pagamento selecionada.'
          });
        }
      }

      // Bug ONB-REQ-001 / SAN-WSP-004: Aceita nome composto apenas por espaços
      if (nameVal && nameVal.trim().length === 0) {
        if (isBugActive('ONB-REQ-001') || isBugActive('SAN-WSP-004')) {
          const bugCode = isBugActive('ONB-REQ-001') ? 'ONB-REQ-001' : 'SAN-WSP-004';
          if (window.QABridge) {
            window.QABridge.reportBug(bugCode, {
              element: 'input#user-name',
              action: 'submit_whitespace_name',
              inputValue: nameVal,
              actualBehavior: 'Campo Nome Completo aceitou sequência de espaços vazios.'
            });
          }
        }
      }

      // Bug ONB-TYP-001: Aceita caracteres alfanuméricos em campo estritamente numérico
      if (ageVal && isNaN(Number(ageVal))) {
        if (isBugActive('ONB-TYP-001')) {
          if (window.QABridge) {
            window.QABridge.reportBug('ONB-TYP-001', {
              element: 'input#user-age',
              action: 'submit_text_age',
              inputValue: ageVal,
              actualBehavior: 'Input numérico de idade aceitou caracteres de texto sem validação de tipo.'
            });
          }
        }
      }

      // Bug VAL-AGE-001 / ONB-AGE-001: Idade 17 anos aceita
      if (ageVal === '17' && (isBugActive('VAL-AGE-001') || isBugActive('ONB-AGE-001'))) {
        const bugCode = isBugActive('ONB-AGE-001') ? 'ONB-AGE-001' : 'VAL-AGE-001';
        if (window.QABridge) {
          window.QABridge.reportBug(bugCode, {
            element: 'input#user-age',
            action: 'submit_underage',
            inputValue: '17',
            actualBehavior: 'Idade 17 anos (menor de idade) aceita sem bloqueio.'
          });
        }
      }

      // Bug VAL-AGE-002 / ONB-AGE-002: Idade negativa aceita
      if (ageVal && (Number(ageVal) < 0 || ageVal.startsWith('-')) && (isBugActive('VAL-AGE-002') || isBugActive('ONB-AGE-002'))) {
        const bugCode = isBugActive('ONB-AGE-002') ? 'ONB-AGE-002' : 'VAL-AGE-002';
        if (window.QABridge) {
          window.QABridge.reportBug(bugCode, {
            element: 'input#user-age',
            action: 'submit_negative_age',
            inputValue: ageVal,
            actualBehavior: 'Input de idade aceitou valor negativo sem bloqueio.'
          });
        }
      }

      // Bug VAL-AGE-003 / ONB-AGE-003: Idade 121 anos aceita
      if (ageVal === '121' && (isBugActive('VAL-AGE-003') || isBugActive('ONB-AGE-003'))) {
        const bugCode = isBugActive('ONB-AGE-003') ? 'ONB-AGE-003' : 'VAL-AGE-003';
        if (window.QABridge) {
          window.QABridge.reportBug(bugCode, {
            element: 'input#user-age',
            action: 'submit_overage',
            inputValue: '121',
            actualBehavior: 'Input de idade aceitou 121 anos sem alerta de limite.'
          });
        }
      }
    });
  });
})();
