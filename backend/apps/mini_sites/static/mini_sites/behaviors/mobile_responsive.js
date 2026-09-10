/**
 * Comportamento Modular: Responsividade, Ergonomia Mobile e Viewports
 * Trilha: 14 (Testes Mobile & Responsividade)
 * Documentado em ADR-0013 / ADR-0015
 */
(function() {
  'use strict';
  if (!window.__registerQAInit) return;

  window.__registerQAInit(function(isBugActive, getFirstActiveBug) {
    const summaryCard = document.getElementById('order-summary');
    const applyCouponBtn = document.getElementById('apply-coupon');
    const cancelOrderBtn = document.getElementById('cancel-order');
    const ageInput = document.getElementById('user-age');
    const headerEl = document.querySelector('header');

    // 1. Overflow Horizontal em Viewport Compacto (Bug MOB-OVF-001)
    if (isBugActive('MOB-OVF-001') && summaryCard) {
      // For?a largura fixa de 430px que estoura em telas menores que 400px
      summaryCard.style.minWidth = '430px';
      summaryCard.style.width = '430px';

      // Reporta anomalia quando a viewport ? reduzida (<= 400px) e o usu?rio rola horizontalmente
      window.addEventListener('scroll', function() {
        if (window.innerWidth <= 400 && window.scrollX > 5) {
          if (window.QABridge) {
            window.QABridge.reportBug('MOB-OVF-001');
          }
        }
      });
      window.addEventListener('resize', function() {
        if (window.innerWidth <= 400) {
          if (window.QABridge) {
            window.QABridge.reportBug('MOB-OVF-001');
          }
        }
      });
      if (window.innerWidth <= 400 && window.QABridge) {
        window.QABridge.reportBug('MOB-OVF-001');
      }
    }

    // 2. Alvo de Toque Subdimensionado (WCAG 2.5.5 / Bug MOB-TGT-001)
    if (isBugActive('MOB-TGT-001') && applyCouponBtn) {
      applyCouponBtn.style.minHeight = '24px';
      applyCouponBtn.style.height = '24px';
      applyCouponBtn.style.padding = '2px 8px';
      applyCouponBtn.style.fontSize = '10px';
      applyCouponBtn.setAttribute('data-touch-target-violation', 'true');

      applyCouponBtn.addEventListener('click', function() {
        if (window.QABridge) {
          window.QABridge.reportBug('MOB-TGT-001');
        }
      });
    }

    // 3. Espa?amento Zero entre A??es Antag?nicas (Bug MOB-GAP-001)
    if (isBugActive('MOB-GAP-001') && cancelOrderBtn) {
      cancelOrderBtn.style.margin = '0px';
      cancelOrderBtn.style.marginTop = '0px';
      cancelOrderBtn.style.borderTop = 'none';

      cancelOrderBtn.addEventListener('click', function() {
        if (window.QABridge) {
          window.QABridge.reportBug('MOB-GAP-001');
        }
      });
    }

    // 4. Teclado Virtual Cobre Rodap? e Submiss?o (Bug MOB-KBD-001)
    if (isBugActive('MOB-KBD-001') && ageInput) {
      ageInput.addEventListener('focus', function() {
        // Simula teclado virtual ocupando metade inferior da viewport
        let kbdOverlay = document.getElementById('simulated-virtual-keyboard');
        if (!kbdOverlay) {
          kbdOverlay = document.createElement('div');
          kbdOverlay.id = 'simulated-virtual-keyboard';
          kbdOverlay.style.position = 'fixed';
          kbdOverlay.style.bottom = '0';
          kbdOverlay.style.left = '0';
          kbdOverlay.style.width = '100%';
          kbdOverlay.style.height = '260px';
          kbdOverlay.style.background = '#1E293B';
          kbdOverlay.style.borderTop = '2px solid #475569';
          kbdOverlay.style.zIndex = '9999';
          kbdOverlay.style.display = 'flex';
          kbdOverlay.style.alignItems = 'center';
          kbdOverlay.style.justifyContent = 'center';
          kbdOverlay.style.color = '#94A3B8';
          kbdOverlay.style.fontFamily = 'monospace';
          kbdOverlay.style.fontSize = '12px';
          kbdOverlay.innerHTML = '[ TECLADO VIRTUAL ATIVO // ?REA OCLUSA (260px) ]';
          document.body.appendChild(kbdOverlay);

          if (window.QABridge) {
            window.QABridge.reportBug('MOB-KBD-001');
          }
        }
      });

      ageInput.addEventListener('blur', function() {
        const kbdOverlay = document.getElementById('simulated-virtual-keyboard');
        if (kbdOverlay) {
          kbdOverlay.remove();
        }
      });
    }

    // 5. Menu Mobile Colaps?vel Trava Aberto (Bug MOB-AUT-001)
    if (isBugActive('MOB-AUT-001') && headerEl) {
      headerEl.addEventListener('click', function() {
        if (window.innerWidth <= 500 && window.QABridge) {
          window.QABridge.reportBug('MOB-AUT-001');
        }
      });
    }

    // 6. Imagem com Distor??o em Rota??o Paisagem (Bug MOB-IMG-001)
    window.addEventListener('resize', function() {
      if (isBugActive('MOB-IMG-001')) {
        const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth <= 800;
        if (isLandscape && window.QABridge) {
          window.QABridge.reportBug('MOB-IMG-001');
        }
      }
    });

    // 7. Inspetor de Touch Targets via postMessage
    window.addEventListener('message', function(ev) {
      if (ev.data && ev.data.type === 'TOGGLE_TOUCH_INSPECTOR') {
        const enabled = !!ev.data.enabled;
        const targets = document.querySelectorAll('button, input, select, a, [role="button"]');
        targets.forEach(function(el) {
          if (enabled) {
            const rect = el.getBoundingClientRect();
            const tooSmall = rect.width < 44 || rect.height < 44;
            el.setAttribute('data-qa-touch-highlight', 'true');
            el.style.outline = tooSmall ? '2px dashed #E04E48' : '2px dashed #38A370';
            el.title = Math.round(rect.width) + 'x' + Math.round(rect.height) + 'px (' + (tooSmall ? '< 44px VIOLA??O' : '>= 44px CONFORME') + ')';
            if (tooSmall && el.id === 'apply-coupon' && window.QABridge) {
              window.QABridge.reportBug('MOB-TGT-001');
            }
          } else {
            el.removeAttribute('data-qa-touch-highlight');
            el.style.outline = '';
            el.title = '';
          }
        });
      }
    });
  });
})();
