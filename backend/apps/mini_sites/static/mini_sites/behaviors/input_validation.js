/**
 * Comportamento Modular: Validação de Formulários e Entradas
 * Trilhas: 00 (Fundamentos), 01 (Testes Manuais), 04 (Funcionalidade), 05 (Regressão) e 07 (Caixa Preta)
 * Documentado em ADR-0013
 */
(function() {
  'use strict';
  if (!window.__registerQAInit) return;

  window.__registerQAInit(function(isBugActive, getFirstActiveBug) {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const nameInput = document.getElementById('user-name');
    const ageInput = document.getElementById('user-age');
    const emailInput = document.getElementById('user-email');
    const taxInput = document.getElementById('tax-id');
    const paymentSelect = document.getElementById('payment-method');

    // 1. Colagem e Máscara no Documento (MSK-CPF-001, ONB-MSK-001, REG-MSK-002, BLK-AUT-002)
    if (taxInput) {
      taxInput.addEventListener('paste', function(e) {
        const pasteBugs = ['MSK-CPF-001', 'ONB-MSK-001', 'REG-MSK-002', 'BLK-AUT-002'];
        const activeBug = getFirstActiveBug(pasteBugs);
        if (activeBug) {
          const pasted = (e.clipboardData || window.clipboardData).getData('text');
          if (pasted.includes('.') || pasted.includes('-')) {
            e.preventDefault();
            const corrupted = pasted.replace(/\./g, '..').replace(/-/g, '--');
            taxInput.value = corrupted;
            if (window.QABridge) {
              window.QABridge.reportBug(activeBug, {
                element: 'input#tax-id',
                action: 'paste',
                inputValue: corrupted,
                actualBehavior: 'Máscara duplicou pontos ao colar string pontuada.'
              });
            }
          }
        }
      });

      // Backspace apaga dois caracteres (REG-MSK-001)
      taxInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && isBugActive('REG-MSK-001')) {
          if (taxInput.value.length >= 2) {
            e.preventDefault();
            taxInput.value = taxInput.value.slice(0, -2);
            if (window.QABridge) {
              window.QABridge.reportBug('REG-MSK-001', {
                element: 'input#tax-id',
                action: 'backspace',
                actualBehavior: 'Backspace apagou dois caracteres simultaneamente por listener duplicado.'
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
      const taxVal = taxInput ? taxInput.value.trim() : '';

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

      // Bug Nome apenas espaços (ONB-REQ-001, SAN-WSP-004, BLK-EQV-001)
      const spaceBugs = ['ONB-REQ-001', 'SAN-WSP-004', 'BLK-EQV-001'];
      const activeSpaceBug = getFirstActiveBug(spaceBugs);
      if (activeSpaceBug && nameVal && nameVal.trim().length === 0) {
        if (window.QABridge) {
          window.QABridge.reportBug(activeSpaceBug, {
            element: 'input#user-name',
            action: 'submit_whitespace_name',
            inputValue: nameVal,
            actualBehavior: 'Campo Nome Completo aceitou sequência de espaços vazios.'
          });
        }
      }

      // Bug Nome acentuado rejeitado (BLK-EQV-002)
      if (isBugActive('BLK-EQV-002') && nameVal && /[áéíóúâêîôûãõç]/i.test(nameVal)) {
        if (window.QABridge) {
          window.QABridge.reportBug('BLK-EQV-002', {
            element: 'input#user-name',
            action: 'submit_accented_name',
            inputValue: nameVal,
            actualBehavior: 'Nome com caracteres acentuados foi rejeitado por regex incompleta.'
          });
        }
      }

      // Bug ONB-TYP-001: Aceita texto em idade
      if (ageVal && isNaN(Number(ageVal)) && isBugActive('ONB-TYP-001')) {
        if (window.QABridge) {
          window.QABridge.reportBug('ONB-TYP-001', {
            element: 'input#user-age',
            action: 'submit_text_age',
            inputValue: ageVal,
            actualBehavior: 'Input numérico de idade aceitou caracteres de texto sem validação de tipo.'
          });
        }
      }

      // Bug Idade 17 (VAL-AGE-001, ONB-AGE-001, BLK-BVA-001)
      const age17Bugs = ['VAL-AGE-001', 'ONB-AGE-001', 'BLK-BVA-001'];
      const active17Bug = getFirstActiveBug(age17Bugs);
      if (active17Bug && ageVal === '17') {
        if (window.QABridge) {
          window.QABridge.reportBug(active17Bug, {
            element: 'input#user-age',
            action: 'submit_underage',
            inputValue: '17',
            actualBehavior: 'Idade 17 anos (menor de idade) aceita sem bloqueio.'
          });
        }
      }

      // Bug Idade negativa (VAL-AGE-002, ONB-AGE-002, BLK-AUT-001)
      const negBugs = ['VAL-AGE-002', 'ONB-AGE-002', 'BLK-AUT-001'];
      const activeNegBug = getFirstActiveBug(negBugs);
      if (activeNegBug && ageVal && (Number(ageVal) < 0 || ageVal.startsWith('-'))) {
        if (window.QABridge) {
          window.QABridge.reportBug(activeNegBug, {
            element: 'input#user-age',
            action: 'submit_negative_age',
            inputValue: ageVal,
            actualBehavior: 'Input de idade aceitou valor negativo sem bloqueio.'
          });
        }
      }

      // Bug Idade 121 (VAL-AGE-003, ONB-AGE-003, BLK-BVA-002)
      const age121Bugs = ['VAL-AGE-003', 'ONB-AGE-003', 'BLK-BVA-002'];
      const active121Bug = getFirstActiveBug(age121Bugs);
      if (active121Bug && ageVal === '121') {
        if (window.QABridge) {
          window.QABridge.reportBug(active121Bug, {
            element: 'input#user-age',
            action: 'submit_overage',
            inputValue: '121',
            actualBehavior: 'Input de idade aceitou 121 anos sem alerta de limite.'
          });
        }
      }

      // Bug CPF com dígitos idênticos aceito (FNC-FAT-001)
      if (isBugActive('FNC-FAT-001') && taxVal && /^(\d)\1+$/.test(taxVal.replace(/\D/g, ''))) {
        if (window.QABridge) {
          window.QABridge.reportBug('FNC-FAT-001', {
            element: 'input#tax-id',
            action: 'submit_repeated_digits_cpf',
            inputValue: taxVal,
            actualBehavior: 'Documento com dígitos repetidos (ex: 111.111.111-11) aceito sem validação de dígito verificador.'
          });
        }
      }
    });
  });
})();
