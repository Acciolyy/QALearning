/**
 * Comportamento Modular: Máquina de Estados, Concorrência e Cálculo
 * Trilhas: 00 (Fundamentos), 01 (Testes Manuais), 04 (Funcionalidade) e 05 (Regressão)
 * Documentado em ADR-0013
 */
(function() {
  'use strict';

  function isBugActive(code) {
    return window.__ACTIVE_BUG_CODES__ && window.__ACTIVE_BUG_CODES__.includes(code);
  }

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkout-form');
    const banner = document.getElementById('feedback-banner');
    const submitBtn = document.getElementById('submit-order');
    const statusDisplay = document.getElementById('order-status-display');
    const cancelBtn = document.getElementById('simulate-cancel-btn');
    const paymentSelect = document.getElementById('payment-method');
    const couponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-code');
    const historyBackBtn = document.getElementById('history-back-sim');

    let orderState = 'PENDENTE';
    let submitCount = 0;
    let hasDiscount = false;
    let discountAmount = 0;

    function showBanner(type, message) {
      if (!banner) return;
      banner.className = `feedback-banner ${type}`;
      banner.textContent = message;
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 1. Cupom e Regressão de Cálculo de Valores (REG-CALC-001 / ONB-CAL-001)
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', function() {
        const code = couponInput.value.trim().toUpperCase();
        if (code === 'VAULT10') {
          hasDiscount = true;
          if (isBugActive('REG-CALC-001') || isBugActive('ONB-CAL-001')) {
            const bugCode = isBugActive('ONB-CAL-001') ? 'ONB-CAL-001' : 'REG-CALC-001';
            discountAmount = 28.40; // 10% sobre R$ 284 (produtos + frete) -> Inconsistência
            if (window.QABridge) {
              window.QABridge.reportBug(bugCode, {
                element: 'input#coupon-code',
                action: 'apply_coupon',
                inputValue: code,
                actualBehavior: 'Cupom aplicou 10% sobre frete indevidamente (-R$ 28,40).'
              });
            }
          } else {
            discountAmount = 24.90; // 10% exclusivamente sobre R$ 249
          }

          const discountRow = document.getElementById('discount-row');
          const discountVal = document.getElementById('discount-val');
          const totalVal = document.getElementById('total-val');
          if (discountRow) discountRow.style.display = 'flex';
          if (discountVal) discountVal.textContent = `- R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
          if (totalVal) {
            const total = (284 - discountAmount).toFixed(2).replace('.', ',');
            totalVal.textContent = `R$ ${total}`;
          }
          showBanner('success', `Cupom ${code} aplicado com sucesso!`);
        } else {
          showBanner('error', 'Cupom inválido. Utilize VAULT10 para testar.');
        }
      });
    }

    // 2. Transições Inválidas e Cancelamento (ST-TRN-002 / ONB-ST-001)
    if (cancelBtn && statusDisplay) {
      cancelBtn.addEventListener('click', function() {
        orderState = 'CANCELADO';
        statusDisplay.className = 'status-pill status-cancelled';
        statusDisplay.textContent = 'STATUS: CANCELADO';
        showBanner('error', 'Pedido transitou para CANCELADO por expiração no gateway.');
      });
    }

    if (paymentSelect && statusDisplay) {
      paymentSelect.addEventListener('change', function() {
        if (orderState === 'CANCELADO') {
          if (isBugActive('ST-TRN-002') || isBugActive('ONB-ST-001')) {
            const bugCode = isBugActive('ONB-ST-001') ? 'ONB-ST-001' : 'ST-TRN-002';
            orderState = 'PAGO';
            statusDisplay.className = 'status-pill status-paid';
            statusDisplay.textContent = 'STATUS: PAGO (RESURRECT)';
            showBanner('success', 'Pedido cancelado foi aprovado automaticamente ao alterar meio de pagamento!');
            if (window.QABridge) {
              window.QABridge.reportBug(bugCode, {
                element: 'select#payment-method',
                action: 'change',
                actualBehavior: 'Pedido cancelado transitou para aprovado sem novo checkout.'
              });
            }
          }
        }
      });
    }

    // 3. Concorrência e Duplo Envio (CONC-DBL-001 / ONB-CNC-001)
    if (form && submitBtn) {
      form.addEventListener('submit', function(e) {
        submitCount++;

        if (submitCount > 1 && (isBugActive('CONC-DBL-001') || isBugActive('ONB-CNC-001'))) {
          const bugCode = isBugActive('ONB-CNC-001') ? 'ONB-CNC-001' : 'CONC-DBL-001';
          if (window.QABridge) {
            window.QABridge.reportBug(bugCode, {
              element: 'button#submit-order',
              action: 'double_click',
              actualBehavior: 'Formulário permitiu múltiplos cliques no botão de finalizar gerando duplicidade.'
            });
          }
          showBanner('error', `Aviso de Concorrência: Pedido enviado ${submitCount} vezes simultaneamente!`);
          return;
        }

        if (!isBugActive('CONC-DBL-001') && !isBugActive('ONB-CNC-001')) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Processando...';
          setTimeout(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Finalizar Pedido';
            orderState = 'PAGO';
            if (statusDisplay) {
              statusDisplay.className = 'status-pill status-paid';
              statusDisplay.textContent = 'STATUS: PAGO';
            }
            showBanner('success', 'Pedido finalizado com sucesso!');
          }, 800);
        }
      });
    }

    // 4. Retorno de Histórico (REG-FLX-001)
    if (historyBackBtn) {
      historyBackBtn.addEventListener('click', function() {
        if (orderState === 'PAGO') {
          if (isBugActive('REG-FLX-001')) {
            showBanner('error', 'Atenção: Carrinho foi restaurado com o mesmo ID após conclusão.');
            if (window.QABridge) {
              window.QABridge.reportBug('REG-FLX-001', {
                element: 'window',
                action: 'history_back',
                actualBehavior: 'Botão Voltar permitiu submeter novamente com mesmo token de carrinho.'
              });
            }
          } else {
            showBanner('error', 'Sessão concluída. Não é possível reabrir pedido finalizado.');
          }
        } else {
          showBanner('error', 'Simulação de retorno válida apenas após finalizar um pedido.');
        }
      });
    }
  });
})();
