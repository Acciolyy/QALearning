import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

async function auditPageRuntime(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      // Ignora respostas HTTP 404 esperadas de rede ao testar rotas com identificadores inexistentes
      if (/the server responded with a status of 404/i.test(text)) {
        return;
      }
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
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 });
  } catch (err) {
    await browser.close();
    assert.fail(
      `\n[FALHA DE DEPENDÊNCIA DO SERVIDOR]\n` +
      `O smoke test requer o servidor Next.js em execução em modo de desenvolvimento (npm run dev) escutando em http://localhost:3000/.\n` +
      `Certifique-se de que o servidor está ativo antes de executar este teste de runtime.\n` +
      `Detalhes do erro de rede: ${err.message}\n`
    );
  }

  // Aguarda estabilizacao do DOM e ciclo de hidratacao do React
  await page.waitForTimeout(1000);

  const overlayIssues = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return [];
    const shadow = portal.shadowRoot;
    const issues = [];
    const badge = shadow.querySelector('[data-next-badge]');
    if (badge && badge.getAttribute('data-error') === 'true') {
      issues.push('Next.js Dev Overlay reportou erro critico de runtime (data-error="true")');
    }
    const issueContainer = shadow.querySelector('[data-has-issues="true"]');
    if (issueContainer) {
      issues.push('Next.js Dev Overlay com atributo data-has-issues="true" ativo');
    }
    return issues;
  });

  const content = await page.content();
  await browser.close();

  return {
    response,
    consoleErrors,
    pageErrors,
    overlayIssues,
    content
  };
}

test('Smoke Test: Hub Panorâmico (/) carrega sem erros de runtime, exceções ou falhas de hidratação', async () => {
  const res = await auditPageRuntime('http://localhost:3000/');
  assert.ok(res.response && res.response.ok(), `Página inicial deve responder com HTTP 200 (status: ${res.response?.status()})`);
  assert.equal(res.consoleErrors.length, 0, `Erros de console no Hub:\n${res.consoleErrors.join('\n')}`);
  assert.equal(res.pageErrors.length, 0, `Exceções no Hub:\n${res.pageErrors.join('\n')}`);
  assert.equal(res.overlayIssues.length, 0, `Problemas no Dev Overlay no Hub:\n${res.overlayIssues.join('\n')}`);
  assert.ok(res.content.includes('Visão Panorâmica de Trilhas'), 'Título principal do Hub deve estar presente');
  assert.ok(res.content.includes('Catálogo de Trilhas Forenses (15 Frentes)'), 'Seção de 15 trilhas deve estar presente');
});

test('Smoke Test: Mesa de Investigação (/trilha/testes-manuais) carrega sem erros de runtime ou hidratação', async () => {
  const res = await auditPageRuntime('http://localhost:3000/trilha/testes-manuais');
  assert.ok(res.response && res.response.ok(), `Mesa deve responder com HTTP 200 (status: ${res.response?.status()})`);
  assert.equal(res.consoleErrors.length, 0, `Erros de console na Mesa:\n${res.consoleErrors.join('\n')}`);
  assert.equal(res.pageErrors.length, 0, `Exceções na Mesa:\n${res.pageErrors.join('\n')}`);
  assert.equal(res.overlayIssues.length, 0, `Problemas no Dev Overlay na Mesa:\n${res.overlayIssues.join('\n')}`);
  assert.ok(res.content.includes('DOSSIÊ §'), 'Dossiê do caso deve estar presente na Mesa');
});

test('Smoke Test: Rota de slug inexistente (/trilha/qualquer-coisa) exibe tela § 404 própria sem crash', async () => {
  const res = await auditPageRuntime('http://localhost:3000/trilha/qualquer-coisa');
  assert.equal(res.consoleErrors.length, 0, `Erros de console na rota 404:\n${res.consoleErrors.join('\n')}`);
  assert.equal(res.pageErrors.length, 0, `Exceções na rota 404:\n${res.pageErrors.join('\n')}`);
  assert.equal(res.overlayIssues.length, 0, `Problemas no Dev Overlay na rota 404:\n${res.overlayIssues.join('\n')}`);
  assert.ok(res.content.includes('§ 404 // REGISTRO DE TRILHA NÃO LOCALIZADO'), 'Tela de 404 própria do Bureau deve ser renderizada');
  assert.ok(res.content.includes('Retornar à Visão Panorâmica do Hub'), 'Botão de retorno ao Hub deve estar presente');
});

test('Smoke Test: Rota de trilha congelada (/trilha/testes-api) exibe interdição técnica ADR-0013 sem crash', async () => {
  const res = await auditPageRuntime('http://localhost:3000/trilha/testes-api');
  assert.equal(res.consoleErrors.length, 0, `Erros de console na trilha congelada:\n${res.consoleErrors.join('\n')}`);
  assert.equal(res.pageErrors.length, 0, `Exceções na trilha congelada:\n${res.pageErrors.join('\n')}`);
  assert.equal(res.overlayIssues.length, 0, `Problemas no Dev Overlay na trilha congelada:\n${res.overlayIssues.join('\n')}`);
  assert.ok(res.content.includes('INTERDIÇÃO TÉCNICA // AUDITORIA DE REDE DEDICADA (ADR-0013)'), 'Tela de interdição técnica deve ser renderizada');
  assert.ok(res.content.includes('Acesso Bloqueado'), 'Acesso deve ser declarado bloqueado');
  assert.ok(res.content.includes('Retornar ao Hub Panorâmico'), 'Botão de retorno ao Hub deve estar presente');
});
