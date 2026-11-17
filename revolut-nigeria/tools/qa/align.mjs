// Alignment check: paints the portal's body plane solid magenta over the
// photographed card and saves before/after screenshots plus the stage matrix,
// for tools/qa/align.py to compare against the card's render matte.
//   node tools/qa/align.mjs <url> <outdir> <w>x<h> [<w>x<h> ...]
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [url, out, ...sizes] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const report = {};
for (const size of sizes) {
  const [width, height] = size.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url);
  await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 40000 });
  await page.addStyleTag({
    content: `[data-hero],[data-nav],[data-shade],[data-plane]:not([data-plane="body"]){visibility:hidden!important}
              [data-plane="body"]{background:#ff00ff!important;box-shadow:none!important}
              [data-plane="body"] > *{display:none!important}`,
  });
  await page.waitForTimeout(300);
  const root = page.locator('section[data-motion]');
  await root.evaluate((el) => el.style.setProperty('--body', '0'));
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/${size}_a.png` });
  await root.evaluate((el) => el.style.setProperty('--body', '1'));
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/${size}_b.png` });
  report[size] = await page.evaluate(() => {
    const m = new DOMMatrix(getComputedStyle(document.querySelector('[data-stage]')).transform);
    return { scale: m.a, tx: m.e, ty: m.f };
  });
  await page.close();
}
await writeFile(`${out}/stage.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report));
