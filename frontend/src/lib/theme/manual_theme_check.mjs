import { chromium } from 'playwright';

async function runManualThemeCheck() {
  console.log('================================================================');
  console.log('TESTE MANUAL EXPLÍCITO: PERSISTÊNCIA DO TEMA (CLARO / ESCURO)');
  console.log('Fluxo: Alternar p/ claro na Mesa -> Hub -> Mesa -> Refresh (F5)');
  console.log('================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';

  try {
    // 1. Alternar para tema claro na Mesa
    console.log('\n[PASSO 1] Acessando Mesa de Investigação (/trilha/testes-manuais)...');
    await page.goto(`${baseUrl}/trilha/testes-manuais`, { waitUntil: 'networkidle' });

    let initMode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let initStorage = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    console.log(`Estado inicial na Mesa: data-mode="${initMode}", localStorage="${initStorage}"`);

    console.log('-> Clicando no botão para alternar para tema claro...');
    const themeBtn = page.locator('button:has-text("MODO:")').first();
    await themeBtn.click();
    await page.waitForTimeout(400);

    let mode1 = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storage1 = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    let btnText1 = await themeBtn.innerText();
    console.log('--- RESULTADO PASSO 1 (Mesa com Tema Claro Ativado) ---');
    console.log(`  * URL: ${page.url()}`);
    console.log(`  * document.documentElement.getAttribute("data-mode"): "${mode1}"`);
    console.log(`  * localStorage.getItem("qalearning-theme"): "${storage1}"`);
    console.log(`  * Rótulo do botão: "${btnText1}"`);
    if (mode1 !== 'light' || storage1 !== 'light') {
      throw new Error(`Falha no Passo 1: esperado "light", obtido mode="${mode1}", storage="${storage1}"`);
    }

    // 2. Navegar para o Hub
    console.log('\n[PASSO 2] Navegando para a Visão Panorâmica do Hub (/)...');
    const hubBtn = page.locator('button:has-text("MESA GERAL"), button:has-text("HUB PANORÂMICO")').first();
    await hubBtn.click();
    await page.waitForFunction(() => window.location.pathname === '/', { timeout: 5000 });
    await page.waitForTimeout(400);

    let mode2 = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storage2 = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    let btnText2 = await page.locator('button:has-text("MODO:")').first().innerText();
    console.log('--- RESULTADO PASSO 2 (Hub após Navegação Client-Side) ---');
    console.log(`  * URL: ${page.url()}`);
    console.log(`  * document.documentElement.getAttribute("data-mode"): "${mode2}"`);
    console.log(`  * localStorage.getItem("qalearning-theme"): "${storage2}"`);
    console.log(`  * Rótulo do botão: "${btnText2}"`);
    if (mode2 !== 'light' || storage2 !== 'light') {
      throw new Error(`Falha no Passo 2: tema resetou para dark no Hub! mode="${mode2}", storage="${storage2}"`);
    }

    // 3. Navegar de volta para a Mesa (/trilha/testes-manuais)
    console.log('\n[PASSO 3] Navegando de volta para a Mesa (/trilha/testes-manuais)...');
    const track01Btn = page.locator('article').filter({ hasText: 'TRILHA 01' }).locator('button').first();
    await track01Btn.click();
    await page.waitForFunction(() => window.location.pathname.includes('/trilha/testes-manuais'), { timeout: 5000 });
    await page.waitForTimeout(400);

    let mode3 = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storage3 = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    let btnText3 = await page.locator('button:has-text("MODO:")').first().innerText();
    console.log('--- RESULTADO PASSO 3 (Mesa após Retorno Client-Side) ---');
    console.log(`  * URL: ${page.url()}`);
    console.log(`  * document.documentElement.getAttribute("data-mode"): "${mode3}"`);
    console.log(`  * localStorage.getItem("qalearning-theme"): "${storage3}"`);
    console.log(`  * Rótulo do botão: "${btnText3}"`);
    if (mode3 !== 'light' || storage3 !== 'light') {
      throw new Error(`Falha no Passo 3: tema resetou ao voltar para a Mesa! mode="${mode3}", storage="${storage3}"`);
    }

    // 4. Dar refresh (F5) na página
    console.log('\n[PASSO 4] Executando refresh de página (F5 / page.reload())...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    let mode4 = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storage4 = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    let btnText4 = await page.locator('button:has-text("MODO:")').first().innerText();
    console.log('--- RESULTADO PASSO 4 (Mesa após Refresh F5) ---');
    console.log(`  * URL: ${page.url()}`);
    console.log(`  * document.documentElement.getAttribute("data-mode"): "${mode4}"`);
    console.log(`  * localStorage.getItem("qalearning-theme"): "${storage4}"`);
    console.log(`  * Rótulo do botão: "${btnText4}"`);
    if (mode4 !== 'light' || storage4 !== 'light') {
      throw new Error(`Falha no Passo 4: tema resetou após F5! mode="${mode4}", storage="${storage4}"`);
    }

    console.log('\n================================================================');
    console.log('CONCLUSÃO DO TESTE MANUAL: O TEMA CLARO PERMANECEU EM TODOS OS PONTOS!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

runManualThemeCheck().catch(err => {
  console.error('ERRO:', err);
  process.exit(1);
});
