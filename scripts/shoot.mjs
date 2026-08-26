/**
 * Screenshots the running clone for visual comparison against .reference/shots.
 * Usage: node scripts/shoot.mjs [outDir]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.argv[2] || 'qa-output';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const height = await page.evaluate(() => document.documentElement.scrollHeight);
console.log('page height:', height, '(reference 6255)');
const font = await page.evaluate(() =>
  [...document.fonts].map((f) => `${f.family} ${f.status}`).join(' | '));
console.log('fonts:', font);

await page.screenshot({ path: `${OUT}/01-listing-top.png` });
await page.screenshot({ path: `${OUT}/00-listing-full.png`, fullPage: true });

// scroll stops
for (const y of [700, 1500, 2400, 3200, 4200, 5200, 6000]) {
  await page.evaluate((v) => scrollTo(0, v), y);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/scroll-${y}.png` });
}
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(400);

// photo tour
await page.getByRole('button', { name: /show all photos/i }).first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/02-phototour-top.png` });
await page.evaluate(() => {
  const s = document.querySelector('[aria-label="Photo tour"] [class*=scroll], [aria-label="Photo tour"]');
  if (s) s.scrollTop = 900;
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/03-phototour-scrolled.png` });

// lightbox
await page.evaluate(() => {
  const d = document.querySelector('[aria-label="Photo tour"]');
  const b = d && d.querySelector('section button');
  if (b) b.click();
});
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/04-lightbox.png` });
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/05-lightbox-next.png` });

console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none');
await browser.close();
