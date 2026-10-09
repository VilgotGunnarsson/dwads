# Offline preview & test harness (developer only)

Renders the real theme files with [liquidjs](https://liquidjs.com/) and **mocked** Shopify data,
so layout, interactions and accessibility can be checked without store access. It is not
uploaded to Shopify (`tools/` is in `.shopifyignore`).

> All products, prices and company details in `server.mjs` are **fictional test fixtures**
> labelled "(mock)/(testdata)". They exist only on localhost.

```bash
cd tools/preview
npm install
node server.mjs            # http://localhost:4173
node test.mjs              # in a second terminal – Playwright + axe-core checks
```

`test.mjs` needs Playwright with a Chromium build available (`npx playwright install chromium`
on a fresh machine). Screenshots are written to `tools/preview/screenshots/` (git-ignored).

### What the mock covers

Layouts, sections, snippets and locale strings; cart add/change via a mock `/cart/*.js` API
with the Section Rendering API response shape; predictive search; recommendations; filters
markup; checklist storage; demo-product safeguards; forbidden-claim scan of visible text.

### What it does not cover

Real Shopify behaviour: checkout, payments, customer accounts, real filter/search results,
`structured_data` output, image CDN sizing, form posting, theme-editor live updates, metafield
`metafield_tag` HTML, localisation of money formats beyond SEK. Always confirm on the actual
unpublished theme preview before publishing.
