# Pre-launch checklist

The store is **not ready to sell** until every box in sections B and C is ticked. Section A
is done in this repository; items marked ☐ in A need real assets or content.

## A. Theme implementation (this repo)

- [x] Online Store 2.0 theme: JSON templates, sections, section groups, snippets, settings
- [x] Swedish storefront strings (`locales/sv.default.json`), Swedish default template content
- [x] Brand name, colours, fonts, radii configurable in Theme settings
- [x] Homepage, collection, product, cart drawer + cart page, search + predictive search,
      404, blog/article, password, FAQ, contact, about, safety guide + checklist templates
- [x] No fake reviews/ratings/urgency; demo products blocked from purchase; specs gated by `custom.specs_verified`
- [x] Payment icons only for enabled methods; delivery text only when configured
- [x] Theme Check: 0 offenses (recommended config); offline browser test suite: 176/176
- [x] Uploaded to Shopify as unpublished theme "Varsam (utkast)"
- [ ] Replace placeholder imagery: hero, "Så väljer vi", category tiles, about page (see BRAND.md)
- [ ] Upload logo/favicon/share image (optional – the text wordmark works without)
- [ ] Review all Swedish copy in the theme editor and adjust tone to your voice
- [ ] Test the published preview on a real phone (iOS Safari + Android Chrome)

## B. Shopify admin configuration

- [ ] Store name changed from "Min butik 2" (Settings → General)
- [ ] Currency SEK, Swedish money format, prices including VAT
- [ ] Market: Sweden; shipping zone + real rates
- [ ] Payment provider activated; test order placed and refunded
- [ ] Dropshipping supplier app connected; order routing and tracking tested end to end
- [x] Collections created, published and linked in the theme
- [ ] Collection images added
- [x] Pages created with the correct templates (guide, FAQ, contact, about)
- [ ] "Om oss" page text written (body intentionally left empty)
- [x] Main menu and footer menu
- [ ] Product metafield definitions created
- [ ] Real products created with verified data; `specs_verified` set only where checked
- [ ] All `demo` products deleted or converted
- [ ] Search & Discovery filters
- [ ] Policies filled in **in Swedish** (refund, privacy, terms, shipping, contact)
- [ ] Theme settings → Företagsuppgifter (name, org.nr, address, email)
- [ ] Theme settings → Leverans: delivery time only if confirmed
- [ ] Cookie banner enabled (Settings → Customer privacy)
- [ ] Email marketing app (if newsletter is used) + double opt-in
- [ ] Notification emails reviewed in Swedish (order confirmation must contain the required
      distance-selling information)
- [ ] Domain connected; storefront password removed; theme published

## C. Legal and business verification

- [ ] Company registered (Bolagsverket/Skatteverket), F-skatt and VAT registration
- [ ] Brand name checked: trademarks (PRV, EUIPO), company names, domains, social handles
- [ ] Policies reviewed by owner/adviser (see LEGAL-DRAFTS.md)
- [ ] For every product: CE/standards documentation where applicable, manufacturer + EU
      responsible person (GPSR), Swedish warnings and instructions, recall procedure
- [ ] Supplier terms: delivery times to Sweden, returns address, defects, IOSS/import VAT
- [ ] Marketing claims reviewed (no "100 % säker", no unverified certifications)
- [ ] Image rights confirmed in writing
- [ ] Bookkeeping and order data retention set up
