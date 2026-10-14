# Store setup guide (Shopify admin)

Everything below is configured in **Shopify admin**, not in theme code. The theme reads these
settings and shows nothing it cannot verify. Work through it top to bottom; the
[launch checklist](LAUNCH-CHECKLIST.md) tracks completion.

## 1. Theme

The theme has been uploaded as **"Lugnhem (utkast)"** – an *unpublished* theme. The live theme
(Horizon) is unchanged.

1. **Online Store → Themes → Lugnhem (utkast) → Customize** to preview and edit.
2. **Theme settings** (paintbrush icon): brand name, colours, fonts, delivery/returns text,
   company details, social links.
3. Publish only when the launch checklist is complete (**… → Publish**).

To upload a new version from this repository yourself: zip the theme folders
(`assets config layout locales sections snippets templates`) and use
**Themes → Add theme → Upload zip file**, or connect the repo with the
[Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github)
(the repo root is a valid theme; `docs/` and `tools/` are ignored by Shopify).
Developers can also run `shopify theme dev --store 4y12ic-wj.myshopify.com` locally.

## 2. Store basics

- **Settings → General:** change *Store name* from "Min butik 2" to the brand name; set the
  store's legal business name and address; **Store currency: SEK**; check the money format
  (Swedish standard: `{{amount_with_comma_separator}} kr`).
- **Settings → Languages:** Swedish as the default language (already the case). Checkout and
  system emails follow this language.
- **Settings → Markets:** Sweden as the primary market. Add other markets only when shipping,
  returns and legal texts cover them.
- **Settings → Taxes and duties:** Swedish VAT (moms). Consumer prices in Sweden must include
  VAT – enable *"Include sales tax in product price"*. The theme then shows "Inklusive moms".
  If the supplier ships from outside the EU, review **IOSS**/import VAT with your accountant.

## 3. Collections (Products → Collections) — ✅ done 2026-10-10

Created and published to the Online Store as **automated collections**. A product joins a
collection when its *product type* matches **or** it has the matching `kategori-…` tag – so a
product can appear in two categories by adding a second tag (e.g. a magnetic lock tagged
`kategori-skap-lador` also shows under Skåp & lådor).

| Title | Handle | Product type **or** tag |
|---|---|---|
| Lås & spärrar | `las-och-sparrar` | Lås & spärrar / `kategori-las-sparrar` |
| Kant- & hörnskydd | `kant-och-hornskydd` | Kant- & hörnskydd / `kategori-kant-hornskydd` |
| Skåp & lådor | `skap-och-lador` | Skåp & lådor / `kategori-skap-lador` |
| Dörrar & klämskydd | `dorrar-och-klamskydd` | Dörrar & klämskydd / `kategori-dorrar` |
| Eluttag | `eluttag` | Eluttag / `kategori-eluttag` |
| Startpaket | `startpaket` | Startpaket / `kategori-startpaket` |

Each has a Swedish description and SEO title/description. Still to do: add a collection image
to each (it is used on the category tiles and collection pages).

Already linked in the Lugnhem theme: the homepage category tiles, the room-by-room guide and the
safety-guide checklist. Still to do in the theme editor once real products are active:
- **Startsida → Utvalda produkter:** pick a collection (the section stays hidden until it has products).
- **Startsida → Startpaket:** pick the bundle product (hidden until chosen).

## 4. Pages (Online Store → Pages) — ✅ done 2026-10-10

Created (or updated) and published, each with a Swedish SEO title and description:

| Page | URL | Template | Content |
|---|---|---|---|
| Säkerhetsguide | `/pages/sakerhetsguide` | `page.guide` | Intro in the page body; rooms, stages and checklist come from the template. |
| Vanliga frågor | `/pages/vanliga-fragor` | `page.faq` | Intro in the body; questions are edited in the theme editor. |
| Kontakt | `/pages/contact` | `page.contact` | Existing page, intro updated; form and company details are automatic. |
| Om oss | `/pages/om-oss` | `page.about` | **Body left empty for you** – write your own story. Do not invent history, founders or credentials. |

The `guide`, `faq` and `about` templates exist only in the Lugnhem theme; in another theme these
pages fall back to the default page layout.

Already linked: hero secondary button and "Hela säkerhetsguiden" → Säkerhetsguide; announcement
bar, FAQ and product "Passar den hemma hos mig?" → Kontakt.

## 5. Navigation (Online Store → Navigation) — ✅ done 2026-10-10

Menus are shared by all themes, so the live (password-protected) Horizon theme shows them too.

- **Main menu (`main-menu`):** Handla (with the six collections as sub-items) · Startpaket ·
  Säkerhetsguide · Om oss · Kontakt.
- **Footer menu (`footer`):** Alla produkter · Säkerhetsguide · Vanliga frågor · Kontakt.
  Policies are linked automatically in the footer.

## 6. Metafields — ✅ done 2026-10-10

All 14 product metafield definitions below were created (namespace `custom`, pinned so they
show on every product page in admin).

Create the product metafield definitions listed in [PRODUCT-DATA.md](PRODUCT-DATA.md)
(**Settings → Custom data → Products**). Remember: specifications only show when
`custom.specs_verified` is *true*.

## 7. Filters (Search & Discovery app – free)

Install **Shopify Search & Discovery**, then **Filters → Add**: Availability, Price, Product
type, and e.g. metafield *Installation method*. The collection and search pages pick them up
automatically. The same app powers **complementary recommendations** on product pages.

## 8. Shipping and delivery (Settings → Shipping and delivery)

- Create a shipping profile for Sweden with the **real** rates you will charge. Shopify Checkout
  shows them to the customer; the theme only says "Leveranstid och fraktkostnad visas i kassan".
- Delivery time: **Theme settings → Leverans, retur och priser → Leveranstid** is set to
  "Normalt 7–20 dagar" (AliExpress Selection Standard quotes in DSers, 2026-10-14). Change it
  there store-wide, or per product with `custom.delivery_estimate`, if real deliveries differ.
- Do not advertise free shipping or delivery windows in the announcement bar or trust points
  unless they are configured and reliable.

## 9. Payments (Settings → Payments)

Activate Shopify Payments (or another provider) and any methods you want (cards, Klarna,
Swish via an app, etc.). The footer automatically shows icons for **enabled** methods only
(`shop.enabled_payment_types`); nothing is hard-coded. Test with a test order before launch.

## 10. Dropshipping / fulfilment

The theme does not assume any supplier or app. Before taking orders:
- Choose and install the supplier's app (or a dropshipping app) and connect products to supplier SKUs.
- Configure order routing, inventory sync, tracking numbers and shipping confirmation emails.
- Decide how cancellations, out-of-stock items and returns are handled with the supplier.
- See the supplier information list in [PRODUCT-DATA.md](PRODUCT-DATA.md).

## 11. Policies (Settings → Policies)

Fill in Refund/returns, Privacy, Terms of service, Shipping and Contact information. Draft
Swedish texts are in [LEGAL-DRAFTS.md](LEGAL-DRAFTS.md) – **drafts only, have them reviewed**.
The existing auto-generated privacy policy is in English; replace it with a Swedish version.
The footer lists every policy that has content; the product page links to the refund policy.

## 12. Customer privacy and cookies (Settings → Customer privacy)

Enable Shopify's **cookie banner** for Sweden/EU. When it is active, a "Cookieinställningar"
link appears in the footer automatically. The theme itself sets no tracking cookies and sends
no analytics; it only emits DOM events (`theme:cart:added`, `theme:cta:click`, …) that an
analytics integration can listen to **after** consent is handled.

## 13. Newsletter / email marketing

The signup forms use Shopify's native customer form: addresses are saved as customers with
email-marketing consent (**Customers**, tag `newsletter`). To actually send emails install
**Shopify Email** (or another app) and, recommended, enable **double opt-in** in Shopify's
email-marketing settings (the admin location changes between versions – search "double opt-in"
in the admin search bar or Shopify Help). Do not promise discounts or a schedule you don't keep.

## 14. Contact form

Messages are emailed to the store's *sender email* (Settings → Notifications / General). Fill in
**Theme settings → Företagsuppgifter**: company name, org number, address and customer-service
email are required to be easily accessible under the Swedish e-commerce act (e-handelslagen).

## 15. Going live

1. Complete the [launch checklist](LAUNCH-CHECKLIST.md).
2. Remove or convert all `demo` products (done 2026-10-14), then set the real products to *Active*.
3. Publish the theme.
4. **Online Store → Preferences:** remove the storefront password (requires an active plan).
5. Connect your domain (Settings → Domains) and submit the sitemap
   (`https://<domain>/sitemap.xml`) in Google Search Console.
