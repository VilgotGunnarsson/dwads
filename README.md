# Varsam – Shopify theme (working name)

A focused, Swedish-language Online Store 2.0 theme for a Sweden-first baby-proofing store,
built for **demand validation**: a small curated catalogue, honest product presentation and
native Shopify functionality only (no paid apps, no frameworks).

> **Not production-ready.** Supplier, product data, policies, payments and shipping still need
> to be configured and verified. See [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md).

| | |
|---|---|
| Store | `4y12ic-wj.myshopify.com` (password-protected) |
| Live theme | Horizon (unchanged) |
| This theme | Uploaded as **unpublished** "Varsam (utkast)" – preview in Online Store → Themes |
| Working brand | **Varsam** – alternatives and rationale in [docs/BRAND.md](docs/BRAND.md) |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) – step-by-step Shopify admin configuration
- [docs/PRODUCT-DATA.md](docs/PRODUCT-DATA.md) – metafields, demo products, bundles, supplier info list
- [docs/SOURCING-ALIEXPRESS.md](docs/SOURCING-ALIEXPRESS.md) – first-pass AliExpress shortlist per category (unverified)
- [docs/BRAND.md](docs/BRAND.md) – names, wordmark, colour/type tokens, image requirements
- [docs/LEGAL-DRAFTS.md](docs/LEGAL-DRAFTS.md) – Swedish policy drafts (**not legal advice**)
- [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) – theme vs. admin vs. legal/business
- [tools/preview/README.md](tools/preview/README.md) – offline render + browser test harness

## Architecture

```
layout/      theme.liquid, password.liquid
config/      settings_schema.json (Swedish editor labels), settings_data.json
locales/     sv.default.json – every storefront string
sections/    header-group.json / footer-group.json (section groups)
             announcement-bar, header, footer, cart-drawer, predictive-search
             hero, trust-points, category-list, featured-products, bundle-highlight,
             room-guide, safety-checklist, faq, newsletter, rich-text, image-with-text
             main-product, product-recommendations, main-collection, main-list-collections,
             main-search, main-cart, main-page, main-contact, main-404, main-blog,
             main-article, main-password
snippets/    css-variables (design tokens), meta-tags (SEO/OG/JSON-LD), wordmark, icon,
             product-card, price, product-details (gated metafields), delivery-note,
             cart-lines, facets, breadcrumbs, pagination, newsletter-form, footer-extras,
             demo-notice
templates/   index, product, collection, list-collections, search, cart, page,
             page.guide, page.faq, page.contact, page.about, 404, blog, article, password
assets/      base.css (≈9 KB gzipped), theme.js (≈6 KB gzipped, deferred, no dependencies)
```

Key behaviours:

- **Truthfulness guards.** No ratings, reviews, "bestseller" labels, countdowns or scarcity.
  Specs/installation/certifications render only when `custom.specs_verified` is true. Products
  tagged `demo` get a badge, no add-to-cart, `noindex` and no Product JSON-LD. Delivery text
  falls back to "visas i kassan". Payment icons come from `shop.enabled_payment_types`.
  Compare-at prices are off by default (prisinformationslagen 30-day rule).
- **Cart.** Native `/cart/add.js` and `/cart/change.js` with the Section Rendering API; native
  `<dialog>` drawer (focus handling, Esc, backdrop click); live-region announcements; a full
  no-JS cart page fallback.
- **Accessibility.** Skip link, one `h1` per page, labelled controls, visible focus, reduced
  motion, keyboard-operable menus/filters/search (arrow keys in suggestions).
- **SEO.** Swedish titles/descriptions, canonical, Open Graph/Twitter, Organization + WebSite
  JSON-LD on the homepage, BreadcrumbList on product/collection, Shopify's `structured_data`
  for Product/Article. `noindex` on search, tag-filtered and demo pages.
- **Performance.** One CSS + one deferred JS file; responsive `srcset` images, lazy-loading
  except the first hero/product image (`fetchpriority="high"`); fonts from Shopify's CDN with
  `font-display: swap` and preload.

## Validation performed

| Check | Command | Result |
|---|---|---|
| Theme Check (recommended) | `shopify theme check --path .` | **0 offenses** (68 files) |
| Theme Check (all checks) | `shopify theme check -C theme-check:all` | 1 note: `AssetSizeJavaScript` measures uncompressed `theme.js` (24.7 KB); it is 6.2 KB gzipped and deferred |
| JS syntax | `node --check assets/theme.js` | OK |
| JSON | settings, locale and all templates parsed | OK |
| Shopify upload | `themeCreate` from zip | Processed without errors (Shopify validates Liquid/schema on upload) |
| Offline render + browser tests | `tools/preview`: `node server.mjs` + `node test.mjs` | **169/169 passed** – 16 pages × mobile 375 px / desktop 1440 px: no horizontal overflow, no console errors, one `h1`, `lang="sv"`, forbidden-claims scan; axe-core WCAG 2.1 A/AA on 7 pages: 0 violations; variant switching, sold-out state, add to cart → drawer, quantity update, removal → empty state, Esc/focus return, cart page, predictive search + keyboard, menu drawer, checklist persistence, demo safeguards, recommendations |

### Not tested (and why)

- **The real storefront preview** – this development environment's network policy blocks
  `*.myshopify.com`, and the store is password-protected. Liquid was therefore exercised with
  mocked Shopify objects; Shopify-specific output (checkout, `structured_data`, image CDN,
  real filters/search, form posting, theme-editor live updates) must be checked in
  **Online Store → Themes → Varsam (utkast) → Preview** before publishing.
- **Checkout, payments, shipping rates, taxes, emails** – not configured yet (admin-only).
- **Real devices / screen readers** – automated checks only; do a manual pass with VoiceOver/TalkBack.

## Working on the theme

```bash
shopify theme check --path .                                # lint
shopify theme dev --store 4y12ic-wj.myshopify.com           # local dev against the store (needs login)
shopify theme push --unpublished --store 4y12ic-wj.myshopify.com   # upload as a new unpublished theme
```

Or zip `assets config layout locales sections snippets templates` and upload via
**Online Store → Themes → Add theme → Upload zip file**. Never publish over the live theme
without completing the launch checklist.
