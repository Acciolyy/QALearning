import { chromium } from 'playwright';
import path from 'node:path';

const outDir = '/home/accioly/workspace/QALearning/docs/design/referencias';

const pagesToCapture = [
  { url: 'http://localhost:3000/', name: 'hub_panoramico' },
  { url: 'http://localhost:3000/trilha/testes-manuais', name: 'mesa_investigacao' },
  { url: 'http://localhost:3000/trilha/qualquer-coisa', name: 'trilha_404' },
  { url: 'http://localhost:3000/trilha/testes-api', name: 'trilha_congelada' }
];

async function captureAll() {
  const browser = await chromium.launch({ headless: true });

  for (const item of pagesToCapture) {
    // 1. Dark Mode
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'pt-BR'
      });
      const page = await context.newPage();
      await page.goto(item.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'));
      await page.waitForTimeout(600);
      const outPathDark = path.join(outDir, `${item.name}_dark.png`);
      await page.screenshot({ path: outPathDark, fullPage: true });
      console.log(`Saved: ${outPathDark}`);
      await context.close();
    }

    // 2. Light Mode
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        locale: 'pt-BR'
      });
      const page = await context.newPage();
      await page.goto(item.url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'light'));
      await page.waitForTimeout(600);
      const outPathLight = path.join(outDir, `${item.name}_light.png`);
      await page.screenshot({ path: outPathLight, fullPage: true });
      console.log(`Saved: ${outPathLight}`);
      await context.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureAll().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
