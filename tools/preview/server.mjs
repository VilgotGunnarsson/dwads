// Developer-only offline preview of the theme with MOCK data.
// Renders the real theme files with liquidjs and stubs the Shopify objects,
// filters and AJAX endpoints that the theme uses. All products below are
// fictional test fixtures for layout testing – they are never uploaded.
//
// Usage: node server.mjs [port]   →  http://localhost:4173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid, Tag, Drop } from 'liquidjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(here, '../..');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const read = (p) => fs.readFileSync(path.join(THEME, p), 'utf8');
const stripJsonComments = (s) => s.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');

/* ----------------------------- Locale ----------------------------- */
const locale = JSON.parse(read('locales/sv.default.json'));
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function translate(key, vars = {}) {
  let node = key.split('.').reduce((o, k) => (o ? o[k] : undefined), locale);
  if (node === undefined) return `translation missing: sv.${key}`;
  if (typeof node === 'object') node = vars.count === 1 ? node.one : node.other;
  return node.replace(/{{\s*(\w+)\s*}}/g, (_, k) => (k in vars ? esc(vars[k]) : ''));
}

/* ----------------------------- Settings ----------------------------- */
const schema = JSON.parse(read('config/settings_schema.json'));
const settings = {};
for (const group of schema) for (const s of group.settings || []) if (s.id) settings[s.id] = s.default ?? null;
const font = (family, weight, fallback) => ({ family, weight, style: 'normal', fallback_families: fallback });
settings.type_heading_font = font("'Fraunces'", 400, 'Georgia, serif');
settings.type_body_font = font("'Instrument Sans'", 400, 'system-ui, sans-serif');
Object.assign(settings, {
  company_name: 'Exempelbolaget AB (testdata)',
  company_org_number: '556000-0000',
  company_address: 'Exempelgatan 1\n123 45 Exempelstad',
  company_email: 'hej@example.com',
});

/* ----------------------------- Mock data ----------------------------- */
const palette = ['#E6DCCB', '#DCE2D3', '#EFE7DA', '#D9CFC0', '#E3E7DD', '#EADFD0'];
const mockImage = (i, label) => {
  const file = `img-${i}.svg`;
  const out = path.join(here, 'out');
  fs.mkdirSync(out, { recursive: true });
  const c = palette[i % palette.length];
  fs.writeFileSync(
    path.join(out, file),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="${c}"/><circle cx="560" cy="250" r="140" fill="#fff" opacity=".35"/><rect x="140" y="420" width="380" height="240" rx="18" fill="#4A5A43" opacity=".18"/><text x="40" y="770" font-family="sans-serif" font-size="28" fill="#615D55">${label} (mock)</text></svg>`
  );
  return { src: `/out/${file}`, alt: '', width: 800, height: 800, aspect_ratio: 1, id: 9000 + i };
};

class OptionValue extends Drop {
  constructor(name, selected, available = true) {
    super();
    Object.assign(this, { name, selected, available });
  }
  valueOf() {
    return this.name;
  }
  toString() {
    return this.name;
  }
}

let pid = 100;
function makeProduct({ title, type, price, tags = [], variants, media = 2, compare, metafields = {}, available = true }) {
  const id = ++pid;
  const handle = title.toLowerCase().replace(/[^a-z0-9åäö]+/g, '-');
  const images = Array.from({ length: media }, (_, i) => ({ ...mockImage(id + i, title), media_type: 'image', preview_image: null }));
  images.forEach((m) => (m.preview_image = m));
  const vs = (variants || [{ title: 'Default Title', options: ['Default Title'] }]).map((v, i) => ({
    id: id * 100 + i,
    title: v.title,
    options: v.options,
    price: v.price ?? price,
    compare_at_price: compare ?? null,
    available: v.available ?? available,
    featured_media: images[i % images.length] || null,
    quantity_rule: { min: 1, max: null, increment: 1 },
    unit_price_measurement: null,
  }));
  const optionNames = variants ? ['Färg'] : ['Title'];
  const product = {
    id,
    title,
    handle,
    url: `/products/${handle}`,
    type,
    tags,
    price: Math.min(...vs.map((v) => v.price)),
    price_min: Math.min(...vs.map((v) => v.price)),
    price_varies: new Set(vs.map((v) => v.price)).size > 1,
    compare_at_price: compare ?? null,
    available: vs.some((v) => v.available),
    description: `<p>${title} är en testprodukt i den lokala förhandsvisningen. Texten ersätts av verifierad produktinformation.</p>`,
    media: images,
    featured_media: images[0] || null,
    variants: vs,
    selected_or_first_available_variant: vs.find((v) => v.available) || vs[0],
    has_only_default_variant: !variants,
    metafields: { custom: metafields },
  };
  product.options_with_values = variants
    ? [
        {
          name: optionNames[0],
          selected_value: vs[0].options[0],
          values: vs.map((v, i) => new OptionValue(v.options[0], i === 0, v.available)),
        },
      ]
    : [];
  return product;
}

const products = [
  makeProduct({ title: 'Magnetisk lådspärr', type: 'Lås & spärrar', price: 24900, variants: [{ title: 'Vit', options: ['Vit'] }, { title: 'Grå', options: ['Grå'], price: 26900 }, { title: 'Svart', options: ['Svart'], available: false }],
    metafields: { specs_verified: { value: true }, materials: { value: 'ABS-plast (mock)' }, dimensions: { value: '6 × 4 × 2 cm (mock)' }, installation_method: { value: 'Självhäftande (mock)' }, package_contents: { value: '4 spärrar\n1 magnetnyckel (mock)' }, warnings: { value: 'Testvarning i förhandsvisningen. Följ alltid tillverkarens anvisningar.' } } }),
  makeProduct({ title: 'Hörnskydd i mjuk silikon', type: 'Kant- & hörnskydd', price: 14900, compare: 17900 }),
  makeProduct({ title: 'Kantlist för bord, 2 m', type: 'Kant- & hörnskydd', price: 19900, media: 1 }),
  makeProduct({ title: 'Dörrstopp med klämskydd', type: 'Dörrar & klämskydd', price: 12900, available: false }),
  makeProduct({ title: 'Uttagsskydd, 12-pack', type: 'Eluttag', price: 9900 }),
  makeProduct({ title: 'Skåpspärr med tryckknapp', type: 'Skåp & lådor', price: 16900, tags: ['demo'] }),
];
const bundle = makeProduct({ title: 'Startpaket Kök', type: 'Startpaket', price: 49900 });
bundle.metafields.custom.bundle_items = { value: [products[0], products[1], products[4]] };
products.push(bundle);
products[0].metafields.custom.complementary_products = { value: [products[1], products[4], bundle] };

const collection = {
  id: 1,
  title: 'Barnsäkerhet',
  handle: 'barnsakerhet',
  url: '/collections/barnsakerhet',
  description: '<p>Allt för ett tryggare hem – lås, hörnskydd, dörrskydd och uttagsskydd.</p>',
  products,
  products_count: products.length,
  all_products_count: products.length,
  image: null,
  featured_image: products[0].featured_media,
  filters: [
    { label: 'Tillgänglighet', type: 'list', values: [
      { label: 'I lager', value: '1', param_name: 'filter.v.availability', count: 6, active: false },
      { label: 'Slut i lager', value: '0', param_name: 'filter.v.availability', count: 1, active: false }], active_values: [] },
    { label: 'Pris', type: 'price_range', range_max: 49900, min_value: { param_name: 'filter.v.price.gte', value: null }, max_value: { param_name: 'filter.v.price.lte', value: null } },
  ],
  sort_options: [
    { name: 'Utvalda', value: 'manual' },
    { name: 'Pris, lågt till högt', value: 'price-ascending' },
    { name: 'Pris, högt till lågt', value: 'price-descending' },
  ],
  sort_by: 'manual',
  default_sort_by: 'manual',
};
const emptyCollection = { ...collection, title: 'Eluttag', handle: 'eluttag', url: '/collections/eluttag', products: [], products_count: 0, all_products_count: 0, filters: [], featured_image: null };
// Mirrors the real store's automated collections (handles must match the live store).
const categoryDefs = [
  ['Lås & spärrar', 'las-och-sparrar'],
  ['Kant- & hörnskydd', 'kant-och-hornskydd'],
  ['Skåp & lådor', 'skap-och-lador'],
  ['Dörrar & klämskydd', 'dorrar-och-klamskydd'],
  ['Startpaket', 'startpaket'],
];
const categoryCollections = categoryDefs.map(([title, handle]) => {
  const items = products.filter((p) => p.type === title);
  return { ...collection, title, handle, url: `/collections/${handle}`, products: items, products_count: items.length, all_products_count: items.length, featured_image: items[0]?.featured_media || null };
});
const collectionsList = [collection, emptyCollection, ...categoryCollections];

// Mirrors the live store's menus (main-menu, footer).
const linklists = {
  'main-menu': { links: [
    { title: 'Handla', url: '/collections/all', links: [
      { title: 'Lås & spärrar', url: '/collections/las-och-sparrar', links: [] },
      { title: 'Kant- & hörnskydd', url: '/collections/kant-och-hornskydd', links: [] },
      { title: 'Skåp & lådor', url: '/collections/skap-och-lador', links: [] },
      { title: 'Dörrar & klämskydd', url: '/collections/dorrar-och-klamskydd', links: [] },
      { title: 'Eluttag', url: '/collections/eluttag', links: [] },
      { title: 'Startpaket', url: '/collections/startpaket', links: [] }] },
    { title: 'Startpaket', url: '/collections/startpaket', links: [] },
    { title: 'Säkerhetsguide', url: '/pages/sakerhetsguide', links: [] },
    { title: 'Om oss', url: '/pages/om-oss', links: [] },
    { title: 'Kontakt', url: '/pages/contact', links: [] }] },
  footer: { links: [
    { title: 'Alla produkter', url: '/collections/all' },
    { title: 'Säkerhetsguide', url: '/pages/sakerhetsguide' },
    { title: 'Vanliga frågor', url: '/pages/vanliga-fragor' },
    { title: 'Kontakt', url: '/pages/contact' },
    { title: 'Sök', url: '/search' }] },
};

const policies = [
  { title: 'Integritetspolicy', url: '/policies/privacy-policy', body: 'x' },
  { title: 'Returpolicy', url: '/policies/refund-policy', body: 'x' },
  { title: 'Köpvillkor', url: '/policies/terms-of-service', body: 'x' },
];
const shop = {
  name: 'Min butik 2',
  description: '',
  customer_accounts_enabled: true,
  enabled_payment_types: ['visa', 'master'],
  policies,
  privacy_policy: policies[0],
  refund_policy: policies[1],
  password_message: 'Vi förbereder butiken.',
};
const routes = {
  root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update',
  search_url: '/search', predictive_search_url: '/search/suggest', product_recommendations_url: '/recommendations/products',
  all_products_collection_url: '/collections/all', collections_url: '/collections', account_url: '/account',
};

/* ----------------------------- Cart state ----------------------------- */
let cartLines = [];
function cartObject() {
  const items = cartLines.map((l, i) => {
    const product = products.find((p) => p.variants.some((v) => v.id === l.id));
    const variant = product.variants.find((v) => v.id === l.id);
    return {
      key: `${l.id}:${i}`, quantity: l.quantity, product, variant, url: `${product.url}?variant=${variant.id}`,
      image: variant.featured_media || product.featured_media, options_with_values: product.has_only_default_variant ? [] : [{ name: 'Färg', value: variant.title }],
      properties: {}, line_level_discount_allocations: [], final_price: variant.price, final_line_price: variant.price * l.quantity,
      original_line_price: variant.price * l.quantity, url_to_remove: `/cart/change?line=${i + 1}&quantity=0`,
    };
  });
  return {
    items,
    item_count: items.reduce((a, b) => a + b.quantity, 0),
    total_price: items.reduce((a, b) => a + b.final_line_price, 0),
    taxes_included: true,
    note: '',
    currency: { iso_code: 'SEK' },
    cart_level_discount_applications: [],
  };
}

/* ----------------------------- Liquid engine ----------------------------- */
const engine = new Liquid({
  root: [path.join(THEME, 'snippets'), path.join(THEME, 'sections')],
  extname: '.liquid',
  strictFilters: true,
  jsTruthy: false,
  ownPropertyOnly: false,
});

const fmtMoney = (cents) => {
  const n = (Number(cents) || 0) / 100;
  return `${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
};
const kw = (args) => Object.fromEntries(args.filter(Array.isArray));
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '').map(([k, v]) => `${k}="${esc(v)}"`).join(' ');

engine.registerFilter('t', function (key, ...args) {
  return translate(key, kw(args));
});
engine.registerFilter('money', fmtMoney);
engine.registerFilter('money_without_currency', (c) => fmtMoney(c).replace(' kr', ''));
engine.registerFilter('json', (v) => JSON.stringify(v ?? null, (k, val) => (val instanceof Drop ? String(val) : val)));
engine.registerFilter('asset_url', (n) => `/assets/${n}`);
engine.registerFilter('stylesheet_tag', (u) => `<link rel="stylesheet" href="${u}">`);
engine.registerFilter('font_face', (f) => {
  const fam = String(f.family).replace(/'/g, '');
  return `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:wght@400;500;700&display=swap');`;
});
engine.registerFilter('font_url', () => '');
engine.registerFilter('preload_tag', () => '');
engine.registerFilter('font_modify', (f, prop, val) => ({ ...f, weight: prop === 'weight' ? (val === 'bold' ? 700 : Number(val)) : f.weight }));
engine.registerFilter('color_darken', (c) => c);
engine.registerFilter('color_modify', (c, prop, val) => {
  const h = String(c).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${val})`;
});
engine.registerFilter('image_url', (img) => (img && img.src) || '');
engine.registerFilter('image_tag', (src, ...args) => {
  const o = kw(args);
  return `<img src="${src}" alt="${esc(o.alt ?? '')}" ${attrs({ class: o.class, loading: o.loading, width: o.width || 800, height: o.height || 800, fetchpriority: o.fetchpriority, sizes: o.sizes, style: o.style })}>`;
});
engine.registerFilter('placeholder_svg_tag', (name, cls) => `<svg class="${cls || ''}" viewBox="0 0 525 525" aria-hidden="true"><rect width="525" height="525" fill="none"/><path d="M180 330h165l-50-70-40 50-25-30z"/></svg>`);
engine.registerFilter('payment_type_svg_tag', (t, ...args) => `<svg class="${kw(args).class || ''}" viewBox="0 0 38 24" role="img" aria-label="${t}"><rect width="38" height="24" rx="3" fill="#fff" stroke="#ccc"/><text x="19" y="15" font-size="7" text-anchor="middle">${t}</text></svg>`);
engine.registerFilter('metafield_tag', (m) => `<span>${esc(m && m.value)}</span>`);
engine.registerFilter('structured_data', (o) => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: o.title }));
engine.registerFilter('time_tag', (d) => `<time>${d}</time>`);
engine.registerFilter('media_tag', () => '');
engine.registerFilter('payment_button', () => '');
engine.registerFilter('handleize', (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'));

// {% doc %}, {% schema %}, {% stylesheet %}, {% javascript %}: consume and output nothing.
for (const name of ['doc', 'schema', 'stylesheet', 'javascript']) {
  engine.registerTag(name, class extends Tag {
    constructor(token, remainTokens, liquid) {
      super(token, remainTokens, liquid);
      while (remainTokens.length) {
        const t = remainTokens.shift();
        if (t.name === `end${name}`) return;
      }
    }
    *render() {}
  });
}

// {% style %} → <style>
engine.registerTag('style', class extends Tag {
  constructor(token, remainTokens, liquid) {
    super(token, remainTokens, liquid);
    this.tpls = [];
    const stream = liquid.parser.parseStream(remainTokens);
    stream.on('tag:endstyle', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('tag style not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    emitter.write('<style>');
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    emitter.write('</style>');
  }
});

// {% form 'type', obj, key: val %}
engine.registerTag('form', class extends Tag {
  constructor(token, remainTokens, liquid) {
    super(token, remainTokens, liquid);
    this.args = token.args;
    this.tpls = [];
    const stream = liquid.parser.parseStream(remainTokens);
    stream.on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('tag form not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    const type = (this.args.match(/^'([^']+)'/) || [])[1];
    const opts = {};
    for (const m of this.args.matchAll(/([\w-]+):\s*('([^']*)'|[\w.]+)/g)) {
      opts[m[1]] = m[3] !== undefined ? m[3] : yield this.liquid.evalValue(m[2], ctx);
    }
    const action = { product: '/cart/add', contact: '/contact#contact_form', customer: '/contact#newsletter', storefront_password: '/password' }[type] || '/';
    emitter.write(`<form method="post" action="${action}" ${attrs({ id: opts.id, class: opts.class, novalidate: opts.novalidate, 'data-product-form': 'data-product-form' in opts ? '' : undefined })}${'data-product-form' in opts ? ' data-product-form' : ''}><input type="hidden" name="form_type" value="${type}">`);
    ctx.push({ form: { errors: null, posted_successfully: false, 'posted_successfully?': false } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
    emitter.write('</form>');
  }
});

// {% paginate x by n %} — mock arrays are small, so a single page is rendered.
engine.registerTag('paginate', class extends Tag {
  constructor(token, remainTokens, liquid) {
    super(token, remainTokens, liquid);
    this.tpls = [];
    const stream = liquid.parser.parseStream(remainTokens);
    stream.on('tag:endpaginate', () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error('tag paginate not closed'); });
    stream.start();
  }
  *render(ctx, emitter) {
    ctx.push({ paginate: { pages: 1, current_page: 1, parts: [] } });
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    ctx.pop();
  }
});

/* ----------------------------- Section rendering ----------------------------- */
function parseSection(type) {
  const src = read(`sections/${type}.liquid`);
  const m = src.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return { src, schema: m ? JSON.parse(m[1]) : {} };
}
function resolveSetting(def, value) {
  if (value === undefined) value = def.default ?? null;
  if (value === null || value === '') return value;
  switch (def.type) {
    case 'collection':
      return collectionsList.find((c) => c.handle === value) || null;
    case 'product':
      return products.find((p) => p.handle === value) || null;
    case 'link_list':
      return linklists[value] || null;
    case 'url':
      return String(value).replace(/^shopify:\/\/(pages|collections|products|blogs)\//, '/$1/').replace(/^shopify:\/\/collections$/, '/collections');
    default:
      return value;
  }
}
function buildSettings(defs = [], values = {}) {
  const out = {};
  for (const d of defs) if (d.id) out[d.id] = resolveSetting(d, values[d.id]);
  return out;
}
async function renderSection(id, data, index, extraScope = {}) {
  const { src, schema: sc } = parseSection(data.type);
  const blockOrder = data.block_order || Object.keys(data.blocks || {});
  const blocks = blockOrder.map((bid) => {
    const b = data.blocks[bid];
    const def = (sc.blocks || []).find((x) => x.type === b.type) || {};
    return { id: bid, type: b.type, settings: buildSettings(def.settings, b.settings), shopify_attributes: '' };
  });
  const section = { id, index, settings: buildSettings(sc.settings, data.settings), blocks };
  const html = await engine.parseAndRender(src, { section, ...extraScope });
  return `<div id="shopify-section-${id}" class="shopify-section ${sc.class || ''}">${html}</div>`;
}
async function renderGroup(name, scope) {
  const group = JSON.parse(stripJsonComments(read(`sections/${name}.json`)));
  let out = '';
  for (const [i, id] of group.order.entries()) out += await renderSection(`sections--${id}`, group.sections[id], i + 1, scope);
  return out;
}
engine.registerTag('sections', class extends Tag {
  constructor(token, remainTokens, liquid) {
    super(token, remainTokens, liquid);
    this.name = token.args.replace(/['"\s]/g, '');
  }
  *render(ctx, emitter) {
    emitter.write(yield renderGroup(this.name, ctx.getAll()));
  }
});
engine.registerTag('section', class extends Tag {
  constructor(token, remainTokens, liquid) {
    super(token, remainTokens, liquid);
    this.name = token.args.replace(/['"\s]/g, '');
  }
  *render(ctx, emitter) {
    emitter.write(yield renderSection(this.name, { type: this.name, settings: {} }, 1, ctx.getAll()));
  }
});

/* ----------------------------- Pages ----------------------------- */
function pageContext(url) {
  const u = new URL(url, 'http://localhost');
  const p = decodeURIComponent(u.pathname);
  const base = { template: { name: 'index', suffix: null }, request: { page_type: 'index', design_mode: u.searchParams.has('editor'), locale: { iso_code: 'sv' }, origin: `http://localhost:${PORT}`, path: p } };
  const set = (name, suffix, extra = {}) => ({ ...base, template: { name, suffix }, request: { ...base.request, page_type: name }, ...extra });
  if (p === '/') return { file: 'index', ctx: set('index', null, { page_title: 'Barnsäkerhet för hem med omtanke' }) };
  if (p.startsWith('/products/')) {
    const product = products.find((x) => x.url === p) || products[0];
    return { file: 'product', ctx: set('product', null, { product, collection, page_title: product.title }) };
  }
  if (p === '/collections/eluttag') return { file: 'collection', ctx: set('collection', null, { collection: emptyCollection, page_title: 'Eluttag' }) };
  if (p.startsWith('/collections/') && p !== '/collections') {
    const found = collectionsList.find((c) => c.url === p) || collection;
    return { file: 'collection', ctx: set('collection', null, { collection: found, page_title: found.title }) };
  }
  if (p === '/collections') return { file: 'list-collections', ctx: set('list-collections', null, { page_title: 'Alla kategorier' }) };
  if (p === '/cart') return { file: 'cart', ctx: set('cart', null, { page_title: 'Varukorg' }) };
  if (p === '/search') {
    const q = u.searchParams.get('q') || '';
    const results = products.filter((x) => q && x.title.toLowerCase().includes(q.toLowerCase())).map((x) => ({ ...x, object_type: 'product' }));
    const search = { performed: Boolean(q), terms: q, results, results_count: results.length, filters: [], sort_options: collection.sort_options };
    return { file: 'search', ctx: set('search', null, { search, page_title: 'Sök' }) };
  }
  const pages = {
    '/pages/sakerhetsguide': ['page', 'guide', 'Säkerhetsguide', '<p>Små barn upptäcker hemmet snabbt. Här är en allmän genomgång av vad många föräldrar ser över – rum för rum och i takt med barnet.</p>'],
    '/pages/vanliga-fragor': ['page', 'faq', 'Vanliga frågor', ''],
    '/pages/contact': ['page', 'contact', 'Kontakt', '<p>Har du frågor om en produkt, din beställning eller en retur? Skriv till oss så återkommer vi så snart vi kan.</p>'],
    '/pages/om-oss': ['page', 'about', 'Om oss', ''],
  };
  if (pages[p]) {
    const [name, suffix, title, content] = pages[p];
    return { file: `page.${suffix}`, ctx: set(name, suffix, { page: { title, content }, page_title: title }) };
  }
  if (p === '/password') return { file: 'password', ctx: set('password', null, { page_title: 'Lösenord' }) };
  return { file: '404', ctx: set('404', null, { page_title: 'Sidan finns inte' }), status: 404 };
}

function globalsFor(ctx) {
  return { settings, shop, routes, cart: cartObject(), linklists, collections: collectionsList, canonical_url: `http://localhost:${PORT}${ctx.request.path}`, content_for_header: '', current_page: 1, ...ctx };
}

async function renderPage(url) {
  const { file, ctx, status } = pageContext(url);
  engine.options.globals = globalsFor(ctx);
  const tpl = JSON.parse(read(`templates/${file}.json`));
  let content = '';
  for (const [i, id] of tpl.order.entries()) content += await renderSection(`template--${id}`, tpl.sections[id], i + 1);
  const layout = tpl.layout === 'password' ? 'layout/password.liquid' : 'layout/theme.liquid';
  const html = await engine.parseAndRender(read(layout), { content_for_layout: content });
  return { html, status: status || 200 };
}

async function renderSectionsById(ids, url = '/') {
  const { ctx } = pageContext(url);
  engine.options.globals = globalsFor(ctx);
  const out = {};
  for (const id of ids || []) {
    if (id === 'cart-drawer') out[id] = await renderSection('cart-drawer', { type: 'cart-drawer', settings: {} }, 1);
    else if (id.endsWith('__main') || id === 'template--main') out[id] = await renderSection(id, { type: 'main-cart', settings: {} }, 1);
  }
  return out;
}

/* ----------------------------- HTTP server ----------------------------- */
const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const readBody = (req) => new Promise((resolve) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => resolve(d)); });
const sendJSON = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname.startsWith('/assets/') || u.pathname.startsWith('/out/')) {
      const file = u.pathname.startsWith('/assets/') ? path.join(THEME, u.pathname) : path.join(here, u.pathname);
      if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      return res.end(fs.readFileSync(file));
    }
    if (req.method === 'POST' && u.pathname === '/cart/add.js') {
      const body = JSON.parse(await readBody(req));
      const item = body.items[0];
      const product = products.find((p) => p.variants.some((v) => v.id === item.id));
      const variant = product?.variants.find((v) => v.id === item.id);
      if (!variant || !variant.available) return sendJSON(res, 422, { status: 422, message: 'Cart Error', description: 'Produkten är slutsåld.' });
      const line = cartLines.find((l) => l.id === item.id);
      if (line) line.quantity += item.quantity; else cartLines.push({ id: item.id, quantity: item.quantity });
      return sendJSON(res, 200, { items: [item], sections: await renderSectionsById(body.sections, body.sections_url) });
    }
    if (req.method === 'POST' && u.pathname === '/cart/change.js') {
      const body = JSON.parse(await readBody(req));
      const idx = body.line - 1;
      if (cartLines[idx]) { if (body.quantity === 0) cartLines.splice(idx, 1); else cartLines[idx].quantity = body.quantity; }
      const c = cartObject();
      return sendJSON(res, 200, { item_count: c.item_count, total_price: c.total_price, sections: await renderSectionsById(body.sections, body.sections_url) });
    }
    if (req.method === 'POST' && u.pathname === '/cart/update.js') return sendJSON(res, 200, { item_count: cartObject().item_count });
    if (u.pathname === '/__reset') { cartLines = []; return sendJSON(res, 200, { ok: true }); }
    if (u.pathname === '/__seed') { cartLines = [{ id: products[0].variants[0].id, quantity: 2 }, { id: products[1].variants[0].id, quantity: 1 }]; return sendJSON(res, 200, { ok: true }); }
    if (u.pathname === '/search/suggest') {
      const q = (u.searchParams.get('q') || '').toLowerCase();
      const found = products.filter((p) => p.title.toLowerCase().includes(q));
      engine.options.globals = globalsFor(pageContext('/').ctx);
      const predictive_search = { performed: true, terms: u.searchParams.get('q'), resources: { products: found, collections: collectionsList.filter((c) => c.title.toLowerCase().includes(q)), pages: [], queries: [] } };
      const html = await renderSection('predictive-search', { type: 'predictive-search', settings: {} }, 1, { predictive_search });
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    }
    if (u.pathname === '/recommendations/products') {
      const product = products.find((p) => String(p.id) === u.searchParams.get('product_id')) || products[1];
      engine.options.globals = globalsFor(pageContext(product.url).ctx);
      const recs = products.filter((p) => p.id !== product.id).slice(0, 4);
      const html = await renderSection(u.searchParams.get('section_id'), { type: 'product-recommendations', settings: {} }, 1, { recommendations: { performed: true, products: recs, products_count: recs.length } });
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(html);
    }
    const { html, status } = await renderPage(req.url);
    res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(error.stack || error));
  }
});

server.listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
export { server, products };
