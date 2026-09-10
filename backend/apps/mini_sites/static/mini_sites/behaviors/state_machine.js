/**
 * Comportamento Modular: Máquina de Estados, Concorrência e Cálculo
 * Trilhas: 00 (Fundamentos), 01 (Testes Manuais), 04 (Funcionalidade), 05 (Regressão) e 07 (Caixa Preta)
 * Documentado em ADR-0013
 */
(function() {
  'use strict';

  function isBugActive(code) {
    return window.__ACTIVE_BUG_CODES__ && window.__ACTIVE_BUG_CODES__.includes(code);
  }

  function getFirstActiveBug(codes) {
    if (!window.__ACTIVE_BUG_CODES__) return null;
    for (let i = 0; i < codes.length; i++) {
      if (window.__ACTIVE_BUG_CODES__.includes(codes[i])) return codes[i];
    }
    return null;
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
    let couponApplyCount = 0;
    let hasDiscount = false;
    let discountAmount = 0;

    function showBanner(type, message) {
      if (!banner) return;
      banner.className = `feedback-banner ${type}`;
      banner.textContent = message;
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 1. Cupom e Regras de Faturamento / Regressão de Cálculo
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', function() {
        const rawCode = couponInput.value.trim();
        const code = rawCode.toUpperCase();
        couponApplyCount++;

        // FNC-CPN-002: Cupom minúsculo rejeitado
        if (rawCode === 'vault10' && isBugActive('FNC-CPN-002')) {
          showBanner('error', 'Cupom inválido. O sistema exige código em maiúsculas.');
          if (window.QABridge) {
            window.QABridge.reportBug('FNC-CPN-002', {
              element: 'input#coupon-code',
              action: 'apply_lowercase_coupon',
              inputValue: rawCode,
              actualBehavior: 'Cupom em minúsculas (vault10) foi rejeitado por falta de normalização.'
            });
          }
          return;
        }

        // REG-SES-001: Cupom legado gera NaN
        if (code === 'LEGACY' && isBugActive('REG-SES-001')) {
          const totalVal = document.getElementById('total-val');
          if (totalVal) totalVal.textContent = 'R$ NaN';
          showBanner('error', 'Erro interno de cálculo ao processar cupom legado.');
          if (window.QABridge) {
            window.QABridge.reportBug('REG-SES-001', {
              element: 'input#coupon-code',
              action: 'apply_legacy_coupon',
              inputValue: code,
              actualBehavior: 'Cupom legado corrompeu o totalizador exibindo NaN.'
            });
          }
          return;
        }

        if (code === 'VAULT10') {
          hasDiscount = true;
          const calcShippingBugs = ['REG-CALC-001', 'ONB-CAL-001', 'FNC-E2E-001', 'REG-GLO-002', 'BLK-TAB-002'];
          const activeCalcBug = getFirstActiveBug(calcShippingBugs);

          // FNC-CPN-001: Acúmulo repetido de cupom
          if (couponApplyCount > 1 && isBugActive('FNC-CPN-001')) {
            discountAmount += 24.90;
            if (window.QABridge) {
              window.QABridge.reportBug('FNC-CPN-001', {
                element: 'input#coupon-code',
                action: 'repeat_apply_coupon',
                inputValue: code,
                actualBehavior: 'Cada clique no botão aplicar acumulou 10% adicional ao desconto.'
              });
            }
          } else if (activeCalcBug) {
            discountAmount = 28.40; // 10% sobre R$ 284 (produtos + frete) -> Inconsistência
            if (window.QABridge) {
              window.QABridge.reportBug(activeCalcBug, {
                element: 'input#coupon-code',
                action: 'apply_coupon',
                inputValue: code,
                actualBehavior: 'Cupom aplicou 10% sobre frete indevidamente (-R$ 28,40).'
              });
            }
          } else {
            discountAmount = 24.90; // 10% exclusivamente sobre R$ 249
          }

          // BLK-TAB-001: Cupom + Pix aplica desconto duplicado
          if (paymentSelect && paymentSelect.value === 'pix' && isBugActive('BLK-TAB-001')) {
            discountAmount = 49.80; // Dobro
            if (window.QABridge) {
              window.QABridge.reportBug('BLK-TAB-001', {
                element: 'input#coupon-code',
                action: 'apply_coupon_pix_combo',
                actualBehavior: 'Combinação de Cupom com Pix aplicou desconto dobrado ilegal de R$ 49,80.'
              });
            }
          }

          const discountRow = document.getElementById('discount-row');
          const discountVal = document.getElementById('discount-val');
          const totalVal = document.getElementById('total-val');
          if (discountRow) discountRow.style.display = 'flex';
          if (discountVal) discountVal.textContent = `- R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
          if (totalVal) {
            const total = Math.max(0, 284 - discountAmount).toFixed(2).replace('.', ',');
            totalVal.textContent = `R$ ${total}`;
          }
          showBanner('success', `Cupom ${code} aplicado com sucesso!`);
        } else {
          showBanner('error', 'Cupom inválido. Utilize VAULT10 para testar.');
        }
      });
    }

    // 2. Transições Inválidas e Cancelamento (ST-TRN-002, ONB-ST-001, REG-HIS-002, BLK-TRN-001)
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
          const resurrectBugs = ['ST-TRN-002', 'ONB-ST-001', 'REG-HIS-002', 'BLK-TRN-001'];
          const activeResBug = getFirstActiveBug(resurrectBugs);
          if (activeResBug) {
            orderState = 'PAGO';
            statusDisplay.className = 'status-pill status-paid';
            statusDisplay.textContent = 'STATUS: PAGO (RESURRECT)';
            showBanner('success', 'Pedido cancelado foi aprovado automaticamente ao alterar meio de pagamento!');
            if (window.QABridge) {
              window.QABridge.reportBug(activeResBug, {
                element: 'select#payment-method',
                action: 'change',
                actualBehavior: 'Pedido cancelado transitou para aprovado sem novo checkout.'
              });
            }
          }
        }
      });
    }

    // 3. Concorrência e Duplo Envio (CONC-DBL-001, ONB-CNC-001, FNC-IDM-001, BLK-ERR-001)
    if (form && submitBtn) {
      form.addEventListener('submit', function(e) {
        submitCount++;
        const dblBugs = ['CONC-DBL-001', 'ONB-CNC-001', 'FNC-IDM-001', 'BLK-ERR-001'];
        const activeDblBug = getFirstActiveBug(dblBugs);

        if (submitCount > 1 && activeDblBug) {
          if (window.QABridge) {
            window.QABridge.reportBug(activeDblBug, {
              element: 'button#submit-order',
              action: 'double_click',
              actualBehavior: 'Formulário permitiu múltiplos cliques no botão de finalizar gerando duplicidade.'
            });
          }
          showBanner('error', `Aviso de Concorrência: Pedido enviado ${submitCount} vezes simultaneamente!`);
          return;
        }

        // REG-CHK-001: Botão trava em processando
        if (isBugActive('REG-CHK-001')) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Processando pedido...';
          showBanner('error', 'Aguardando resposta do servidor...');
          if (window.QABridge) {
            window.QABridge.reportBug('REG-CHK-001', {
              element: 'button#submit-order',
              action: 'submit_hang',
              actualBehavior: 'Botão de finalizar trava indefinidamente em estado de carregamento.'
            });
          }
          return;
        }

        if (!activeDblBug) {
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

            // FNC-FAT-002: ID de pedido fixo
            const orderNum = isBugActive('FNC-FAT-002') ? '#VC-000000' : `#VC-${Math.floor(100000 + Math.random()*900000)}`;
            if (isBugActive('FNC-FAT-002') && window.QABridge) {
              window.QABridge.reportBug('FNC-FAT-002', {
                element: 'button#submit-order',
                action: 'static_order_id',
                actualBehavior: 'Confirmação de pedido emitiu número de pedido estático #VC-000000.'
              });
            }
            showBanner('success', `Pedido finalizado com sucesso! Pedido ${orderNum}`);
          }, 800);
        }
      });
    }

    // 4. Retorno de Histórico (REG-FLX-001, REG-HIS-001, BLK-ERR-002)
    if (historyBackBtn) {
      historyBackBtn.addEventListener('click', function() {
        if (orderState === 'PAGO') {
          const hisBugs = ['REG-FLX-001', 'REG-HIS-001', 'BLK-ERR-002'];
          const activeHisBug = getFirstActiveBug(hisBugs);
          if (activeHisBug) {
            showBanner('error', 'Atenção: Carrinho foi restaurado com o mesmo ID após conclusão.');
            if (window.QABridge) {
              window.QABridge.reportBug(activeHisBug, {
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
