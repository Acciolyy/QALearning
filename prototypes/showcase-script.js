    (function () {
      const root = document.documentElement;
      const themeLabel = document.getElementById('active-theme-label');

      const themeNames = {
        'option-a': 'TEMA ATUAL: OPÇÃO A (DOSSIÊ INVESTIGATIVO / LAB TELEMETRY)',
        'option-b': 'TEMA ATUAL: OPÇÃO B (ESTAÇÃO SUÍÇA / TECHNICAL PRECISION)',
        'option-c': 'TEMA ATUAL: OPÇÃO C (BUREAU DE INSPEÇÃO / FIELD MANUAL)'
      };

      // Inicialização via URL Search Params (ex: ?theme=option-b&mode=dark)
      const urlParams = new URLSearchParams(window.location.search);
      const initialTheme = urlParams.get('theme') || 'option-a';
      const initialMode = urlParams.get('mode') || 'light';

      setTheme(initialTheme);
      setMode(initialMode);

      function setTheme(theme) {
        document.querySelectorAll('[data-set-theme]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-set-theme') === theme);
        });
        root.setAttribute('data-theme', theme);
        if (themeLabel) themeLabel.textContent = themeNames[theme] || theme;
        updateHexValues();
      }

      function setMode(mode) {
        document.querySelectorAll('[data-set-mode]').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-set-mode') === mode);
        });
        root.setAttribute('data-mode', mode);
        updateHexValues();
      }

      // Event Listeners de Botões
      document.querySelectorAll('[data-set-theme]').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.getAttribute('data-set-theme')));
      });

      document.querySelectorAll('[data-set-mode]').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.getAttribute('data-set-mode')));
      });

      function updateHexValues() {
        const computed = getComputedStyle(root);
        const tokens = [
          '--bg-app',
          '--bg-surface',
          '--accent-primary',
          '--status-pass',
          '--status-investigating',
          '--status-bug'
        ];
        tokens.forEach(token => {
          const el = document.getElementById('hex-' + token.replace('--', ''));
          if (el) {
            el.textContent = computed.getPropertyValue(token).trim();
          }
        });
      }
      setTimeout(updateHexValues, 100);

      const crushBtn = document.getElementById('btn-crush-demo');
      const crushBanner = document.getElementById('crush-feedback-banner');
      if (crushBtn && crushBanner) {
        crushBtn.addEventListener('click', () => {
          crushBtn.textContent = '✓ Bug Mapeado e Gravado';
          crushBtn.style.backgroundColor = 'var(--status-bug)';
          crushBtn.style.color = '#FFFFFF';
          crushBanner.style.display = 'block';
          setTimeout(() => {
            crushBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 50);
        });
      }
    })();
