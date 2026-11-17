// Behaviour checks: reverse scroll, nav theme, buttons, cursor, reduced motion, frame pacing.
//   node tools/qa/behaviour.mjs <url> <outdir>
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, out] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);

// ---------- full motion
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url);
  await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 40000 });
  const theme = () => page.getAttribute('[data-nav]', 'data-theme');
  check('nav starts on the photograph', (await theme()) === 'onPhoto');

  // frame pacing while the primary button drives the whole journey
  await page.evaluate(() => {
    window.__frames = [];
    const tick = (t) => { window.__frames.push(t); if (window.__frames.length < 100000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.mouse.move(1200, 860);
  await page.getByRole('button', { name: 'Explore the Experience' }).click();
  await page.waitForTimeout(5200);
  const frames = await page.evaluate(() => window.__frames);
  const gaps = frames.slice(1).map((t, i) => t - frames[i]).sort((a, b) => a - b);
  const p95 = gaps[Math.floor(gaps.length * 0.95)];
  const median = gaps[Math.floor(gaps.length / 2)];
  check('journey frame pacing (headless, software GL)', p95 < 50, `median ${median.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms over ${gaps.length} frames`);
  check('primary button reaches the second screen', (await theme()) === 'onPaper');
  await page.screenshot({ path: `${out}/after_button.png` });

  // cursor over a pill
  const pill = page.getByRole('link', { name: 'Discover Revolut' }).last();
  const box = await pill.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(800);
  const active = await page.evaluate(() => document.querySelector('[data-ring]')?.parentElement?.hasAttribute('data-active'));
  check('cursor opens up over interactive elements', active === true);
  await page.screenshot({ path: `${out}/hover.png`, clip: { x: box.x - 60, y: box.y - 60, width: box.width + 120, height: box.height + 120 } });

  // reverse: scroll back up
  await page.mouse.wheel(0, -4000);
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2600);
  check('scrolling back returns the nav to the photograph', (await theme()) === 'onPhoto');
  const heroVisible = await page.evaluate(() => {
    const line = document.querySelector('[data-hero-line]');
    const r = line.getBoundingClientRect();
    const mask = line.parentElement.getBoundingClientRect();
    return Math.abs(r.top - mask.top) < 2 && getComputedStyle(document.querySelector('[data-reveal]')).visibility === 'hidden';
  });
  check('scrolling back restores the first screen', heroVisible);
  await page.screenshot({ path: `${out}/reversed.png` });

  // nav: Experience link, then Explore back home
  await page.getByRole('button', { name: 'Experience', exact: true }).click();
  await page.waitForTimeout(4600);
  check('nav "Experience" travels to the second screen', (await theme()) === 'onPaper');
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  await page.waitForTimeout(4600);
  check('"Explore" travels back to Lagos', (await theme()) === 'onPhoto' && (await page.evaluate(() => scrollY)) === 0);
  check('no runtime errors (full motion)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---------- reduced motion
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForSelector('[data-preloader]', { state: 'detached', timeout: 40000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/reduced_hero.png` });
  const pinned = await page.evaluate(() => !!document.querySelector('.pin-spacer'));
  check('reduced motion: nothing is pinned', !pinned);
  const cursor = await page.evaluate(() => document.documentElement.classList.contains('has-cursor'));
  check('reduced motion: system cursor kept', !cursor);
  await page.getByRole('button', { name: 'Explore the Experience' }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/reduced_reveal.png` });
  const top = await page.evaluate(() => document.querySelector('[data-reveal][data-flow]').getBoundingClientRect().top);
  check('reduced motion: second screen is the next section', Math.abs(top) < 2, `top ${top.toFixed(1)}`);
  check('reduced motion: nav follows the section', (await page.getAttribute('[data-nav]', 'data-theme')) === 'onPaper');
  check('no runtime errors (reduced)', errors.length === 0, errors.join(' | '));
  await context.close();
}
await browser.close();
console.log(results.join('\n'));
