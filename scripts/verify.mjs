#!/usr/bin/env node
/**
 * Overlay behaviour harness.
 *
 * Drives the real page in Chromium and asserts the measured interaction spec for
 * the Photo tour and the Lightbox: what opens them, how the two layers stack,
 * arrow clamping, focus containment and restoration, and URL/history sync.
 *
 *   node scripts/verify.mjs            # run everything
 *   node scripts/verify.mjs --headed   # watch it happen
 *
 * Starts `npm run dev` on port 3000 itself unless something is already serving
 * there, in which case it reuses it and leaves it running.
 */
import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import { chromium } from 'playwright';

const PORT = 3000;
const BASE = `http://localhost:${PORT}`;
const TOTAL_PHOTOS = 43;
const HEADED = process.argv.includes('--headed');

/* ---------------------------------------------------------------- server */

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.setTimeout(700);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
  });
}

async function waitForServer(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = 'no response';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(20000) });
      if (res.ok) return;
      // A 4xx/5xx here is usually a compile error in the app, not a startup race.
      lastStatus = `HTTP ${res.status}`;
      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      await new Promise((r) => setTimeout(r, 700));
    }
  }
  throw new Error(`dev server never served ${BASE} (last: ${lastStatus})`);
}

async function startServer() {
  if (await portOpen(PORT)) {
    console.log(`* reusing the dev server already on ${BASE}\n`);
    return null;
  }
  console.log('* starting `npm run dev`...');
  const child = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  await waitForServer(180000);
  console.log(`* dev server ready on ${BASE}\n`);
  return child;
}

function stopServer(child) {
  if (!child) return;
  try {
    execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
  } catch {
    child.kill('SIGTERM');
  }
}

/* ------------------------------------------------------------- assertions */

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ ok: true, name });
    console.log(`PASS  ${name}`);
  } catch (error) {
    results.push({ ok: false, name });
    console.log(`FAIL  ${name} -- ${String(error.message).split('\n')[0]}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function equal(actual, expected, what) {
  assert(
    actual === expected,
    `${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  );
}

/* ------------------------------------------------------------ page driving */

async function overlays(page) {
  return page.evaluate(() => {
    const shown = (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const style = getComputedStyle(el);
      return style.opacity === '1' && style.visibility === 'visible';
    };
    return { tour: shown('photoTour'), lightbox: shown('lightbox') };
  });
}

/** Waits for both layers to settle into the given open/closed combination. */
async function settle(page, tour, lightbox) {
  await page.waitForFunction(
    ([wantTour, wantLightbox]) => {
      const shown = (id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const style = getComputedStyle(el);
        return style.opacity === '1' && style.visibility === 'visible';
      };
      return shown('photoTour') === wantTour && shown('lightbox') === wantLightbox;
    },
    [tour, lightbox],
    { timeout: 5000 },
  );
}

function activeInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    return {
      id: el?.id ?? '',
      tag: el?.tagName ?? '',
      label: el?.getAttribute?.('aria-label') ?? '',
      idx: el?.getAttribute?.('data-idx') ?? '',
      inTour: !!document.getElementById('photoTour')?.contains(el),
      inLightbox: !!document.getElementById('lightbox')?.contains(el),
    };
  });
}

const query = (page) => new URL(page.url()).search;

async function reset(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#showAllPhotos');
  // The markup is server-rendered, so the buttons exist before React has attached
  // to them. Clicking in that window is silently a no-op — wait for the fiber keys
  // React puts on hydrated DOM nodes before driving anything.
  await page.waitForFunction(
    () => {
      const el = document.querySelector('#heroGrid button');
      return !!el && Object.keys(el).some((k) => k.startsWith('__react'));
    },
    undefined,
    { timeout: 15000 },
  );
  await settle(page, false, false);
}

/* -------------------------------------------------------------------- run */

async function main() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: !HEADED });
  const context = await browser.newContext({ viewport: { width: 1512, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  try {
    await reset(page);

    /* 1 -- what opens the tour ------------------------------------------- */

    await check('1a. A hero image opens the photo tour', async () => {
      await page.click('#heroGrid button');
      await settle(page, true, false);
      const state = await overlays(page);
      assert(state.tour && !state.lightbox, 'tour should be the only open layer');
      equal(await page.getAttribute('#photoTour', 'aria-modal'), 'true', 'tour aria-modal');
      equal(await page.getAttribute('#photoTour', 'role'), 'dialog', 'tour role');
      equal(await page.getAttribute('#photoTour', 'aria-label'), 'Photo tour', 'tour aria-label');
    });

    await check('1b. "Show all photos" opens the photo tour', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      const state = await overlays(page);
      assert(state.tour && !state.lightbox, 'tour should be the only open layer');
    });

    /* 2 -- a tour photo opens the lightbox at the right index -------------- */

    await check('2. A tour photo opens the lightbox at the right index', async () => {
      const indices = await page.$$eval('#tourRooms [data-idx]', (els) =>
        els.map((el) => el.getAttribute('data-idx')),
      );
      equal(indices.length, TOTAL_PHOTOS, 'photo buttons in the tour');
      equal(
        indices.join(','),
        Array.from({ length: TOTAL_PHOTOS }, (_, i) => String(i)).join(','),
        'photo buttons carry 0..42 in flat tour order',
      );

      await page.click('#tourRooms [data-idx="5"]');
      await settle(page, true, true);
      equal((await page.textContent('#lbCounter'))?.trim(), '6 of 43', 'counter');
      equal((await page.textContent('#lbTitle'))?.trim(), 'Living room 2', 'title');
      equal(await page.getAttribute('#lightbox', 'aria-label'), 'Photo viewer', 'lightbox label');

      const shown = await page.getAttribute('#lbStage img', 'src');
      const clicked = await page.getAttribute('#tourRooms [data-idx="5"] img', 'src');
      equal(shown, clicked, 'the lightbox shows the photo that was clicked');
    });

    /* 3 -- arrows move and clamp ------------------------------------------ */

    await check('3a. ArrowRight/ArrowLeft step through photos', async () => {
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(
        () => document.getElementById('lbCounter')?.textContent?.trim() === '7 of 43',
      );
      await page.keyboard.press('ArrowLeft');
      await page.waitForFunction(
        () => document.getElementById('lbCounter')?.textContent?.trim() === '6 of 43',
      );
    });

    await check('3b. ArrowLeft clamps at the first photo', async () => {
      await page.goto(`${BASE}/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1000`, {
        waitUntil: 'domcontentloaded',
      });
      await settle(page, true, true);
      equal((await page.textContent('#lbCounter'))?.trim(), '1 of 43', 'counter');
      equal(await page.getAttribute('#lbPrev', 'disabled'), '', 'Previous is disabled');
      const dim = await page.evaluate(
        () => getComputedStyle(document.getElementById('lbPrev')).opacity,
      );
      equal(dim, '0.28', 'disabled Previous opacity');

      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(150);
      equal((await page.textContent('#lbCounter'))?.trim(), '1 of 43', 'counter after clamp');
    });

    await check('3c. ArrowRight clamps at the last photo', async () => {
      await page.goto(`${BASE}/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=${1000 + 42}`, {
        waitUntil: 'domcontentloaded',
      });
      await settle(page, true, true);
      equal((await page.textContent('#lbCounter'))?.trim(), '43 of 43', 'counter');
      equal(await page.getAttribute('#lbNext', 'disabled'), '', 'Next is disabled');

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
      equal((await page.textContent('#lbCounter'))?.trim(), '43 of 43', 'counter after clamp');
    });

    /* 4 -- the grid button returns to the tour ----------------------------- */

    await check('4. The lightbox grid button returns to the tour', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      await page.click('#tourRooms [data-idx="2"]');
      await settle(page, true, true);

      await page.click('#lbGrid');
      await settle(page, true, false);
      const state = await overlays(page);
      assert(state.tour && !state.lightbox, 'the tour must survive the lightbox closing');
    });

    /* 5 -- Escape unwinds one layer per press ------------------------------ */

    await check('5. Escape unwinds exactly one layer per press', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      await page.click('#tourRooms [data-idx="7"]');
      await settle(page, true, true);

      await page.keyboard.press('Escape');
      await settle(page, true, false);
      let state = await overlays(page);
      assert(state.tour && !state.lightbox, 'first Escape should close only the lightbox');

      await page.keyboard.press('Escape');
      await settle(page, false, false);
      state = await overlays(page);
      assert(!state.tour && !state.lightbox, 'second Escape should close the tour');
      equal(query(page), '', 'URL is clean once both layers are closed');
    });

    /* 6 -- focus containment ----------------------------------------------- */

    await check('6a. Tab stays inside the open tour', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      for (let i = 0; i < 25; i += 1) {
        await page.keyboard.press('Tab');
        const active = await activeInfo(page);
        assert(
          active.inTour,
          `Tab #${i + 1} escaped the tour (landed on ${active.tag}#${active.id})`,
        );
      }
    });

    await check('6b. Tab stays inside the open lightbox', async () => {
      await page.click('#tourRooms [data-idx="10"]');
      await settle(page, true, true);
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Tab');
        const active = await activeInfo(page);
        assert(
          active.inLightbox,
          `Tab #${i + 1} escaped the lightbox (landed on ${active.tag}#${active.id})`,
        );
      }
    });

    await check('6c. The closed overlays are out of the tab order', async () => {
      await reset(page);
      const state = await page.evaluate(() =>
        ['photoTour', 'lightbox'].map((id) => {
          const el = document.getElementById(id);
          if (!el) return `${id}: missing`;
          const hidden =
            getComputedStyle(el).visibility === 'hidden' || el.hasAttribute('inert');
          return hidden ? `${id}: hidden` : `${id}: REACHABLE`;
        }),
      );
      assert(
        state.every((entry) => entry.endsWith('hidden')),
        state.join(' / '),
      );
    });

    /* 7 -- focus restoration ------------------------------------------------ */

    await check('7a. Closing the tour refocuses "Show all photos"', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      await page.keyboard.press('Escape');
      await settle(page, false, false);
      equal((await activeInfo(page)).id, 'showAllPhotos', 'focused element');
    });

    await check('7b. Closing the lightbox refocuses the tour photo', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      await page.click('#tourRooms [data-idx="12"]');
      await settle(page, true, true);
      await page.keyboard.press('Escape');
      await settle(page, true, false);
      const active = await activeInfo(page);
      equal(active.idx, '12', 'focused photo index');
      assert(active.inTour, 'focus should return into the tour');
    });

    await check('7c. Opening the tour moves focus into it', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      const active = await activeInfo(page);
      assert(active.inTour, `focus stayed outside the tour (${active.tag}#${active.id})`);
    });

    /* 8 -- URL and history --------------------------------------------------- */

    await check('8a. The URL reflects the open layers', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      equal(query(page), '?modal=PHOTO_TOUR_SCROLLABLE', 'tour URL');

      await page.click('#tourRooms [data-idx="3"]');
      await settle(page, true, true);
      equal(
        query(page),
        '?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1003',
        'lightbox URL (1000 + index)',
      );
    });

    await check('8b. Browser Back closes one layer at a time', async () => {
      await page.evaluate(() => history.back());
      await settle(page, true, false);
      equal(query(page), '?modal=PHOTO_TOUR_SCROLLABLE', 'URL after one Back');

      await page.evaluate(() => history.back());
      await settle(page, false, false);
      equal(query(page), '', 'URL after two Backs');
    });

    await check('8c. A deep link opens straight to a photo', async () => {
      await page.goto(`${BASE}/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1020`, {
        waitUntil: 'domcontentloaded',
      });
      await settle(page, true, true);
      equal((await page.textContent('#lbCounter'))?.trim(), '21 of 43', 'counter');
    });

    /* 9 -- extras ------------------------------------------------------------ */

    await check('9a. A category button scrolls its section into view', async () => {
      await reset(page);
      await page.click('#showAllPhotos');
      await settle(page, true, false);
      equal(
        await page.evaluate(() => document.getElementById('tourScroll').scrollTop),
        0,
        'tour starts at the top',
      );

      await page.click('#tourNav button:nth-child(6)'); // "Gym"
      await page.waitForFunction(
        () => {
          const scroller = document.getElementById('tourScroll');
          const target = document.getElementById('tour-room-5');
          if (!scroller || !target) return false;
          const delta =
            target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
          return Math.abs(delta) < 4;
        },
        undefined,
        { timeout: 5000 },
      );
    });

    await check('9b. The lightbox announces the photo politely', async () => {
      await page.goto(`${BASE}/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1003`, {
        waitUntil: 'domcontentloaded',
      });
      await settle(page, true, true);
      const live = await page.evaluate(() => {
        const region = document.querySelector('#lightbox [aria-live="polite"]');
        return {
          text: region?.textContent?.trim() ?? '',
          polite: region?.getAttribute('aria-live') ?? '',
        };
      });
      equal(live.polite, 'polite', 'aria-live');
      equal(live.text, 'Photo 4 of 43, Living room 2', 'announcement');
    });

    await check('9c. The tour is inert while the lightbox is above it', async () => {
      const inert = await page.evaluate(
        () => document.getElementById('photoTour')?.hasAttribute('inert') ?? null,
      );
      equal(inert, true, 'tour inert with the lightbox open');
    });

    await check('9d. Body scroll is locked while an overlay is open', async () => {
      const locked = await page.evaluate(() => ({
        overlay: getComputedStyle(document.body).overflow,
        flag: document.body.dataset.scrollLocked ?? '',
      }));
      equal(locked.flag, 'true', 'body scroll-lock flag');
      equal(locked.overlay, 'hidden', 'body overflow');

      await page.keyboard.press('Escape');
      await settle(page, true, false);
      await page.keyboard.press('Escape');
      await settle(page, false, false);
      const released = await page.evaluate(() => document.body.dataset.scrollLocked ?? '');
      equal(released, '', 'scroll lock released once everything is closed');
    });

    await check('9e. No uncaught page errors', async () => {
      assert(pageErrors.length === 0, pageErrors.join(' | '));
    });
  } finally {
    await browser.close();
    stopServer(server);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} passed` +
      (failed.length ? `, ${failed.length} failed` : ''),
  );
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
