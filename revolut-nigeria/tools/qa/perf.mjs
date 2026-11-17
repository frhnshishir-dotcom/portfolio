// Frame pacing of the scripted journey, with optional CSS injected (for A/B tests).
//   node tools/qa/perf.mjs <url> [css]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, css = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url);
await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 40000 });
if (css) await page.addStyleTag({ content: css });
await page.waitForTimeout(500);
const stats = [];
for (const leg of ['out']) {
  await page.evaluate(() => {
    window.__f = [];
    const tick = (t) => { window.__f.push(t); if (window.__f.length < 1e5) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.evaluate((y) => window.scrollTo(0, y), leg === 'out' ? 0 : 0);
  if (leg === 'out') await page.getByRole('button', { name: 'Explore the Experience' }).click();
  else await page.getByRole('button', { name: 'Explore', exact: true }).click();
  await page.waitForTimeout(6000);
  const f = await page.evaluate(() => window.__f);
  const g = f.slice(1).map((t, i) => t - f[i]).sort((a, b) => a - b);
  stats.push(`${leg}: ${g.length} frames, median ${g[g.length >> 1].toFixed(1)} ms, p90 ${g[Math.floor(g.length * 0.9)].toFixed(1)}, p95 ${g[Math.floor(g.length * 0.95)].toFixed(1)}, max ${g[g.length - 1].toFixed(1)}`);
}
console.log(stats.join('\n'));
await browser.close();
