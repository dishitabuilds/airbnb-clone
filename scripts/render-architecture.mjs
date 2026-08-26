/**
 * Renders docs/architecture.html to PNG and PDF for the submission bundle.
 * Run: node scripts/render-architecture.mjs
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = 'file:///' + path.join(HERE, '..', 'docs', 'architecture.html').replace(/\\/g, '/');
const out = path.join(HERE, '..', 'docs');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1760, height: 1240 },
  deviceScaleFactor: 2,
});
await page.goto(src, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

await page.screenshot({ path: path.join(out, 'architecture.png') });
await page.pdf({
  path: path.join(out, 'architecture.pdf'),
  width: '1760px',
  height: '1240px',
  printBackground: true,
  pageRanges: '1',
});

await browser.close();
console.log('wrote docs/architecture.png and docs/architecture.pdf');
