// Screenshot the turned card (≈62 % through the journey) with and without layer promotion.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, out] = process.argv.slice(2);
const browser = await chromium.launch();
for (const [name, css] of [['plain', ''], ['promoted', '[data-plane],[data-stage]{will-change:transform}']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(url);
  await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 40000 });
  if (css) await page.addStyleTag({ content: css });
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const p of [0.15, 0.3, 0.45, 0.62]) {
    await page.evaluate((y) => scrollTo(0, y), Math.round(max * p));
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/sharp_${name}.png` });
  await page.close();
}
await browser.close();
