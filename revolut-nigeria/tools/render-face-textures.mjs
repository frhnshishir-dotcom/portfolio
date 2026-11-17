// Rasterises the card-face artwork (the same React component the page uses for
// its light layers) into textures for the Blender render.
//
//   npm run dev            (in another terminal)
//   node tools/render-face-textures.mjs [http://localhost:5173]
//
// Output: tools/out/face_<layer>.png at 4x card units (2160 x 3424), transparent.
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Playwright is resolved the CommonJS way so a global install works too.
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.argv[2] ?? 'http://localhost:5173';
const out = resolve(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 540, height: 856 },
  deviceScaleFactor: 4,
});
for (const layer of ['rim', 'logo', 'chip', 'details', 'all']) {
  await page.goto(`${base}/?texture=${layer}`);
  await page.waitForSelector('#texture-sheet');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.screenshot({
    path: resolve(out, `face_${layer}.png`),
    clip: { x: 0, y: 0, width: 540, height: 856 },
    omitBackground: true,
  });
  console.log('wrote', `face_${layer}.png`);
}
await browser.close();
