// Visual QA: drives the page in headless Chromium and saves screenshots.
//   node tools/qa/shoot.mjs <url> <outdir> [width] [height] [progress list]
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [url = 'http://localhost:5173/', out = 'tools/out/qa', w = '1440', h = '900', list = '0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
const t0 = Date.now();
await page.goto(url);
await page.screenshot({ path: `${out}/00_preloader.png` });
await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 30000 });
console.log('intro finished after', Date.now() - t0, 'ms');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/01_hero.png` });

const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
console.log('scrollable', max);
for (const p of list.split(',').map(Number)) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * p));
  await page.waitForTimeout(2400);
  const name = `p${String(Math.round(p * 100)).padStart(3, '0')}`;
  await page.screenshot({ path: `${out}/${name}.png` });
}
console.log(logs.join('\n') || 'no console output');
await browser.close();
