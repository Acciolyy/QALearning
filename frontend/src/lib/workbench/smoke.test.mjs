import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('Smoke Test: Carrega / sem erros de runtime no console, excecoes ou falhas de hidratacao', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message || String(error));
  });

  const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  assert.ok(response && response.ok(), `Pagina inicial deve responder com HTTP 200 (status: ${response?.status()})`);

  // Aguarda estabilizacao do DOM e ciclo de hidratacao do React
  await page.waitForTimeout(1000);

  // Verifica se o overlay de desenvolvimento do Next.js registrou erros ou issues
  const overlayIssues = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return [];
    const shadow = portal.shadowRoot;
    const badge = shadow.querySelector('[data-next-badge]');
    if (badge && badge.getAttribute('data-error') === 'true') {
      return ['Next.js Dev Overlay reportou erro critico/issue de runtime'];
    }
    const issueCount = shadow.querySelector('.dev-tools-indicator-issue-count');
    if (issueCount && issueCount.getAttribute('data-has-issues') === 'true') {
      return [`Next.js Dev Overlay reportou issues ativas: ${issueCount.textContent}`];
    }
    return [];
  });

  await browser.close();

  // Falha estritamente se houver qualquer erro de console
  assert.equal(
    consoleErrors.length,
    0,
    `Erros de console detectados durante a carga da pagina:\n${consoleErrors.join('\n')}`
  );

  // Falha se houver qualquer excecao nao capturada / pageerror
  assert.equal(
    pageErrors.length,
    0,
    `Excecoes na pagina detectadas:\n${pageErrors.join('\n')}`
  );

  // Falha se houver issue no overlay do Next
  assert.equal(
    overlayIssues.length,
    0,
    `Problemas no Dev Overlay do Next.js detectados:\n${overlayIssues.join('\n')}`
  );
});
