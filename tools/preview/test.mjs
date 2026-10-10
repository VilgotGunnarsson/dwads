// Browser checks against the offline preview server (node server.mjs).
// Verifies rendering, interactions, layout overflow, console errors, basic
// accessibility (axe-core) and truthfulness rules, and saves screenshots.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const SHOTS = path.join(here, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const PAGES = [
  ['home', '/'],
  ['product', '/products/magnetisk-l%C3%A5dsp%C3%A4rr'],
  ['product-demo', '/products/sk%C3%A5psp%C3%A4rr-med-tryckknapp'],
  ['product-soldout', '/products/d%C3%B6rrstopp-med-kl%C3%A4mskydd'],
  ['collection', '/collections/barnsakerhet'],
  ['collection-empty', '/collections/eluttag'],
  ['collections', '/collections'],
  ['search', '/search?q=h%C3%B6rn'],
  ['search-empty', '/search?q=xyz'],
  ['cart-empty', '/cart'],
  ['guide', '/pages/sakerhetsguide'],
  ['faq', '/pages/vanliga-fragor'],
  ['contact', '/pages/contact'],
  ['collection-category', '/collections/las-och-sparrar'],
  ['about', '/pages/om-oss'],
  ['404', '/finns-inte'],
  ['password', '/password'],
];

const VIEWPORTS = { mobile: { width: 375, height: 812 }, desktop: { width: 1440, height: 900 } };
const FORBIDDEN = [/bästsäljare/i, /bestseller/i, /fri frakt/i, /gratis frakt/i, /★/, /recension/i, /betyg/i, /swish/i, /klarna/i, /certifierad/i, /godkänd enligt/i, /translation missing/i, /Liquid error/i];

const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });

async function newPage(viewport) {
  const context = await browser.newContext({ viewport, locale: 'sv-SE', reducedMotion: 'reduce' });
  // Block external font requests so tests are deterministic offline.
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  return { context, page, errors };
}

await fetch(`${BASE}/__reset`);

/* ---------- Render, overflow, console, content rules, screenshots ---------- */
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const [name, url] of PAGES) {
    const { context, page, errors } = await newPage(viewport);
    await page.goto(BASE + url, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${vpName}/${name}: no horizontal overflow`, overflow <= 0, overflow > 0 ? `${overflow}px` : '');
    check(`${vpName}/${name}: no console errors`, errors.length === 0, errors.join(' | '));
    if (vpName === 'desktop') {
      const text = await page.evaluate(() => document.body.innerText);
      const hits = FORBIDDEN.filter((re) => re.test(text)).map(String);
      check(`${name}: no forbidden/unverified claims in visible text`, hits.length === 0, hits.join(', '));
      const h1 = await page.locator('h1').count();
      check(`${name}: exactly one h1`, h1 === 1, `found ${h1}`);
      const lang = await page.getAttribute('html', 'lang');
      check(`${name}: html lang is sv`, lang === 'sv');
    }
    await page.screenshot({ path: path.join(SHOTS, `${vpName}-${name}.png`), fullPage: true });
    await context.close();
  }
}

/* ---------- Accessibility (axe-core, WCAG 2.1 A/AA) ---------- */
for (const [name, url] of PAGES.filter(([n]) => ['home', 'product', 'collection', 'cart-empty', 'guide', 'contact', 'search'].includes(n))) {
  const { context, page } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + url);
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target?.join(' ')}`);
  });
  check(`axe ${name}: no WCAG A/AA violations`, violations.length === 0, violations.join(' | '));
  await context.close();
}

/* ---------- Product: variant switching ---------- */
{
  const { context, page, errors } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + PAGES[1][1]);
  const before = await page.locator('[data-product-price] .price__current').innerText();
  await page.locator('label', { hasText: 'Grå' }).click();
  const after = await page.locator('[data-product-price] .price__current').innerText();
  check('variant change updates price', before !== after, `${before} → ${after}`);
  check('variant change updates URL', page.url().includes('variant='));
  await page.locator('label', { hasText: 'Svart' }).click();
  const disabled = await page.locator('[data-add-to-cart]').isDisabled();
  const btnText = await page.locator('[data-add-to-cart-text]').innerText();
  check('sold-out variant disables add to cart', disabled && /slut/i.test(btnText), btnText);
  const verified = await page.locator('.spec-list').count();
  check('verified specs render when specs_verified = true', verified === 1);
  const warning = await page.locator('.product-warning').count();
  check('product warning renders', warning === 1);
  check('product page console clean after interaction', errors.length === 0, errors.join(' | '));
  await context.close();
}

/* ---------- Product: demo and unverified safeguards ---------- */
{
  const { context, page } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + PAGES[2][1]);
  check('demo product shows demo notice', (await page.locator('.demo-notice').count()) === 1);
  check('demo product has no add-to-cart button', (await page.locator('[data-add-to-cart]').count()) === 0);
  check('demo product is noindex', (await page.locator('meta[name="robots"][content="noindex"]').count()) === 1);
  check('demo product has no Product JSON-LD', !(await page.content()).includes('"@type":"Product"'));
  await page.goto(BASE + '/products/h%C3%B6rnskydd-i-mjuk-silikon');
  check('unverified product hides spec table', (await page.locator('.spec-list').count()) === 0);
  check('compare-at price hidden by default (price law setting off)', (await page.locator('.price__compare').count()) === 0);
  await context.close();
}

/* ---------- Cart drawer: add, update quantity, remove ---------- */
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  await fetch(`${BASE}/__reset`);
  const { context, page, errors } = await newPage(viewport);
  await page.goto(BASE + PAGES[1][1]);
  await page.locator('[data-add-to-cart]').click();
  await page.waitForSelector('#CartDrawer[open]', { timeout: 4000 }).catch(() => {});
  const open = await page.locator('#CartDrawer[open]').count();
  check(`${vpName}: add to cart opens drawer`, open === 1);
  const lines = await page.locator('#CartDrawer .cart-line').count();
  check(`${vpName}: drawer shows the added line`, lines === 1);
  const badge = await page.locator('[data-cart-count] [aria-hidden]').first().innerText();
  check(`${vpName}: header count updates`, badge.trim() === '1', badge);
  const focusInside = await page.evaluate(() => document.getElementById('CartDrawer').contains(document.activeElement));
  check(`${vpName}: focus moves into drawer`, focusInside);
  await page.screenshot({ path: path.join(SHOTS, `${vpName}-cart-drawer.png`) });

  await page.locator('#CartDrawer [data-qty-plus]').click();
  await page.waitForFunction(() => /498/.test(document.querySelector('#CartDrawer .cart-summary__total')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(100);
  const qty = await page.locator('#CartDrawer .qty__input').inputValue();
  check(`${vpName}: quantity + updates line`, qty === '2', qty);
  const subtotal = await page.locator('#CartDrawer .cart-summary__total span').last().innerText();
  check(`${vpName}: subtotal reflects quantity`, /498,00/.test(subtotal), subtotal);
  const live = await page.locator('[data-live-region]').innerText();
  check(`${vpName}: cart update announced to screen readers`, /uppdaterats/i.test(live), live);

  await page.locator('#CartDrawer [data-line-remove]').click();
  await page.waitForSelector('#CartDrawer .cart-empty', { timeout: 4000 }).catch(() => {});
  check(`${vpName}: removing last line shows empty state`, (await page.locator('#CartDrawer .cart-empty').count()) === 1);

  await page.keyboard.press('Escape');
  check(`${vpName}: Escape closes drawer`, (await page.locator('#CartDrawer[open]').count()) === 0);
  check(`${vpName}: cart flow console clean`, errors.length === 0, errors.join(' | '));
  await context.close();
}

/* ---------- Sold-out add-to-cart error handling ---------- */
{
  await fetch(`${BASE}/__reset`);
  const { context, page } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + PAGES[1][1]);
  // Force a request for a sold-out variant to exercise the error path.
  await page.evaluate(() => {
    document.querySelector('[data-variant-id]').value = document.querySelector('[data-variants]').textContent.match(/"id":\s*(\d+)/g).pop().replace(/\D/g, '');
  });
  await page.locator('[data-add-to-cart]').click();
  await page.waitForSelector('[data-form-error]:not([hidden])', { timeout: 4000 }).catch(() => {});
  const msg = await page.locator('[data-form-error]').innerText().catch(() => '');
  check('failed add-to-cart shows an error message', msg.length > 0, msg);
  await context.close();
}

/* ---------- Cart page with items ---------- */
{
  await fetch(`${BASE}/__seed`);
  const { context, page, errors } = await newPage(VIEWPORTS.mobile);
  await page.goto(BASE + '/cart');
  check('cart page lists seeded lines', (await page.locator('.cart-line').count()) === 2);
  check('checkout button present', (await page.locator('button[name="checkout"]').count()) === 1);
  await page.screenshot({ path: path.join(SHOTS, 'mobile-cart-page.png'), fullPage: true });
  await page.locator('[data-line-remove]').first().click();
  await page.waitForFunction(() => document.querySelectorAll('.cart-line').length === 1, null, { timeout: 4000 }).catch(() => {});
  check('cart page removal re-renders', (await page.locator('.cart-line').count()) === 1);
  check('cart page console clean', errors.length === 0, errors.join(' | '));
  await context.close();
  await fetch(`${BASE}/__reset`);
}

/* ---------- Menu drawer & predictive search ---------- */
{
  const { context, page, errors } = await newPage(VIEWPORTS.mobile);
  await page.goto(BASE + '/');
  await page.locator('.site-header__menu-toggle').click();
  check('mobile menu opens', (await page.locator('#MenuDrawer[open]').count()) === 1);
  await page.screenshot({ path: path.join(SHOTS, 'mobile-menu.png') });
  await page.keyboard.press('Escape');
  check('mobile menu closes with Escape', (await page.locator('#MenuDrawer[open]').count()) === 0);
  const focusBack = await page.evaluate(() => document.activeElement?.classList.contains('site-header__menu-toggle'));
  check('focus returns to menu button', focusBack);

  await page.locator('[data-drawer-open="SearchModal"]').click();
  await page.locator('#SearchModalInput').fill('hörn');
  await page.waitForSelector('.predictive-search__product', { timeout: 4000 }).catch(() => {});
  check('predictive search shows product suggestions', (await page.locator('.predictive-search__product').count()) > 0);
  check('search combobox marked expanded', (await page.getAttribute('#SearchModalInput', 'aria-expanded')) === 'true');
  await page.keyboard.press('ArrowDown');
  check('arrow key selects a suggestion', (await page.locator('[role="option"][aria-selected="true"]').count()) === 1);
  await page.screenshot({ path: path.join(SHOTS, 'mobile-search.png') });
  check('menu/search console clean', errors.length === 0, errors.join(' | '));
  await context.close();
}

/* ---------- Checklist persistence & keyboard focus ---------- */
{
  const { context, page } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + '/pages/sakerhetsguide');
  const boxes = page.locator('[data-checklist-item]');
  await boxes.nth(0).check();
  await boxes.nth(3).check();
  const progress = await page.locator('[data-checklist-progress]').innerText();
  check('checklist shows progress', /2 av \d+/.test(progress), progress);
  await page.reload();
  check('checklist persists in this browser', await boxes.nth(0).isChecked());

  await page.goto(BASE + '/');
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => document.activeElement?.classList.contains('skip-link'));
  check('first Tab reaches skip link', skip);
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('focused element has visible outline', outline !== 'none', outline);
  await context.close();
}

/* ---------- Recommendations ---------- */
{
  const { context, page } = await newPage(VIEWPORTS.desktop);
  await page.goto(BASE + '/products/h%C3%B6rnskydd-i-mjuk-silikon');
  await page.locator('[data-recommendations]').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-recommendations] .card', { timeout: 4000 }).catch(() => {});
  check('recommendations load lazily', (await page.locator('[data-recommendations] .card').count()) > 0);
  await page.goto(BASE + PAGES[1][1]);
  check('merchant-chosen complementary products render server-side', (await page.locator('.section-recommendations .card').count()) === 3);
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync(path.join(here, 'screenshots', 'results.json'), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
