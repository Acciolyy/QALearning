import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('Smoke Test: Carrega / sem erros de runtime no console, excecoes ou falhas de hidratacao', async () => {
  const browser = await chromium.launch({ headless: true });
  // Simula o ambiente real do usuario em pt-BR para expor mismatches de formatacao (ADR-0016)
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (msg.type() === 'warning' && /hydrat|did not match|mismatch/i.test(text)) {
      consoleErrors.push(`[Aviso de Hidratacao]: ${text}`);
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message || String(error));
  });

  let response;
  try {
    response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 10000 });
  } catch (err) {
    await browser.close();
    assert.fail(
      `\n[FALHA DE DEPENDÊNCIA DO SERVIDOR]\n` +
      `O smoke test requer o servidor Next.js em execução em modo de desenvolvimento (npm run dev) escutando em http://localhost:3000/.\n` +
      `Certifique-se de que o servidor está ativo antes de executar este teste de runtime.\n` +
      `Detalhes do erro de rede: ${err.message}\n`
    );
  }

  assert.ok(response && response.ok(), `Pagina inicial deve responder com HTTP 200 (status: ${response?.status()})`);

  // Aguarda estabilizacao do DOM e ciclo de hidratacao do React
  await page.waitForTimeout(1000);

  // Verifica se o overlay de desenvolvimento do Next.js registrou erros ou issues
  const overlayIssues = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return [];
    const shadow = portal.shadowRoot;
    const issues = [];
    const badge = shadow.querySelector('[data-next-badge]');
    if (badge && badge.getAttribute('data-error') === 'true') {
      issues.push('Next.js Dev Overlay reportou erro critico de runtime (data-error="true")');
    }
    const issueCount = shadow.querySelector('.dev-tools-indicator-issue-count, [data-has-issues="true"], [data-issues-open]');
    if (issueCount) {
      const txt = issueCount.textContent?.trim();
      if (txt && (txt.includes('Issue') || txt.includes('Erro') || txt.includes('1'))) {
        issues.push(`Next.js Dev Overlay exibindo badge ativo: "${txt}"`);
      }
    }
    return issues;
  });

  await browser.close();

  // 1. Falha se houver qualquer erro de console
  assert.equal(
    consoleErrors.length,
    0,
    `Erros de console detectados durante a carga da pagina:\n${consoleErrors.join('\n')}`
  );

  // 2. Falha se houver qualquer excecao nao capturada
  assert.equal(
    pageErrors.length,
    0,
    `Excecoes na pagina detectadas:\n${pageErrors.join('\n')}`
  );

  // 3. Falha se houver issue no overlay do Next
  assert.equal(
    overlayIssues.length,
    0,
    `Problemas no Dev Overlay do Next.js detectados:\n${overlayIssues.join('\n')}`
  );
});
