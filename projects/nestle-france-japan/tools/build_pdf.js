// Build the phone-friendly PDF of the deck: one 16:9 page per slide, from docs/screenshots,
// with the two ad posters on slide 11 (and their fallback lines) as tappable YouTube links.
//   node tools/build_pdf.js          (needs Playwright with Chromium)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'NESTLE-FRANCE-JAPAN_slides.pdf');
const N = 13;
// Link areas in stage pixels (1920×1080), keyed by slide number.
const LINKS = {
  11: [
    { url: 'https://www.youtube.com/watch?v=HCBP72vABBk', box: [120, 258, 810, 500] },  // France poster + fallback line
    { url: 'https://www.youtube.com/watch?v=hvyWq_mOpIo', box: [990, 258, 810, 500] }   // Japan poster + fallback line
  ]
};

const pages = [];
for (let i = 1; i <= N; i++) {
  const img = fs.readFileSync(path.join(ROOT, 'docs', 'screenshots', `slide-${i}.jpg`)).toString('base64');
  const links = (LINKS[i] || []).map(({ url, box: [x, y, w, h] }) =>
    `<a href="${url}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></a>`).join('');
  pages.push(`<section><img src="data:image/jpeg;base64,${img}" alt="Slide ${i}">${links}</section>`);
}
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Nestlé: France × Japan</title><style>
@page { size: 1920px 1080px; margin: 0; }
html, body { margin: 0; background: #071321; }
section { position: relative; width: 1920px; height: 1080px; page-break-after: always; overflow: hidden; }
section:last-child { page-break-after: auto; }
img { display: block; width: 1920px; height: 1080px; }
a { position: absolute; display: block; }
</style></head><body>${pages.join('')}</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.pdf({ path: OUT, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB');
})();
