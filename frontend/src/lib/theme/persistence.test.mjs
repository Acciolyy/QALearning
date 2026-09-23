import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('Persistência de Tema: Mesa -> Hub -> Mesa -> F5 (refresh)', async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3000';

  try {
    // 1. Acessa Mesa de Investigação (/trilha/testes-manuais)
    await page.goto(`${baseUrl}/trilha/testes-manuais`, { waitUntil: 'networkidle' });

    // Alterna para tema claro na Mesa
    const themeBtnMesa = page.locator('button:has-text("MODO:")').first();
    await themeBtnMesa.click();
    await page.waitForTimeout(400);

    let modeMesa = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storageMesa = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    assert.equal(modeMesa, 'light', 'Mesa deve estar com data-mode="light" após alternar');
    assert.equal(storageMesa, 'light', 'localStorage deve gravar "light" após alternar');

    // 2. Navega para o Hub (/)
    const hubBtn = page.locator('button:has-text("MESA GERAL"), button:has-text("HUB PANORÂMICO")').first();
    await hubBtn.click();
    await page.waitForFunction(() => window.location.pathname === '/', { timeout: 5000 });
    await page.waitForTimeout(400);

    let modeHub = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storageHub = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    assert.equal(modeHub, 'light', 'Hub deve manter data-mode="light" após navegação client-side');
    assert.equal(storageHub, 'light', 'localStorage deve manter "light" no Hub');

    // 3. Navega de volta para a Mesa (/trilha/testes-manuais)
    const track01Btn = page.locator('article').filter({ hasText: 'TRILHA 01' }).locator('button').first();
    await track01Btn.click();
    await page.waitForFunction(() => window.location.pathname.includes('/trilha/testes-manuais'), { timeout: 5000 });
    await page.waitForTimeout(400);

    let modeMesaRetorno = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storageMesaRetorno = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    assert.equal(modeMesaRetorno, 'light', 'Mesa deve manter data-mode="light" ao navegar de volta');
    assert.equal(storageMesaRetorno, 'light', 'localStorage deve manter "light" no retorno à Mesa');

    // 4. Dá refresh (F5) na Mesa
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    let modeRefreshed = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
    let storageRefreshed = await page.evaluate(() => localStorage.getItem('qalearning-theme'));
    assert.equal(modeRefreshed, 'light', 'Mesa deve manter data-mode="light" após refresh (F5)');
    assert.equal(storageRefreshed, 'light', 'localStorage deve manter "light" após refresh (F5)');
  } finally {
    await browser.close();
  }
});
