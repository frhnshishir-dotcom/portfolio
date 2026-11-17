// Throttles the network and samples the preloader counter: it must climb
// through intermediate values (real byte progress), not jump from 0 to 100.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: (6 * 1024 * 1024) / 8, uploadThroughput: 1e6 });
const t0 = Date.now();
await page.goto(url);
const samples = [];
for (let i = 0; i < 80; i++) {
  const v = await page.evaluate(() => document.querySelector('[data-pre-count]')?.textContent ?? 'gone');
  samples.push(`${((Date.now() - t0) / 1000).toFixed(1)}s:${v}`);
  if (v === 'gone') break;
  await page.waitForTimeout(250);
}
const requests = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /\.webp/.test(r.name)).map((r) => `${r.name.split('/').pop()} ${(r.transferSize / 1024) | 0} KB`));
console.log(samples.join('  '));
console.log('image requests:', requests.join(', '));
await browser.close();
