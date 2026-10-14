# Product data model

The theme uses standard Shopify product fields first and a small set of **product metafields
(namespace `custom`)** for structured details. Create the definitions in
**Settings → Custom data → Products → Add definition** with exactly these namespace/keys.

> **Rule:** never fill a field with a value you have not verified with the supplier (ideally
> against a sample in hand). Empty fields are simply not shown – the theme never invents data.

## Metafield definitions

| Key (`custom.…`) | Type | Shown | Notes |
|---|---|---|---|
| `specs_verified` | True or false | — | **Gate.** Specifications, installation instructions and certifications are only displayed when this is *true*. Set it only after checking the data. |
| `materials` | Multi-line text | Specifikationer | e.g. "ABS-plast, silikon". |
| `dimensions` | Single-line text | Specifikationer | e.g. "6 × 4 × 2 cm". |
| `installation_method` | Single-line text | Specifikationer | e.g. "Självhäftande tejp" / "Skruv". |
| `compatible_surfaces` | Multi-line text | Specifikationer | Which doors/drawers/surfaces it fits – and not. |
| `certifications` | Multi-line text | Specifikationer | Only standards you hold documentation for (test report/DoC). |
| `installation_instructions` | Rich text | Monteringsanvisning | Your own Swedish instructions, verified on the product. |
| `package_contents` | Multi-line text | Förpackningen innehåller | Always shown when present. |
| `care_instructions` | Multi-line text | Skötsel | Always shown when present. |
| `warnings` | Multi-line text | "Viktigt att veta" box | **Always shown when present** (not gated). Use the manufacturer's warnings. |
| `delivery_estimate` | Single-line text | Delivery note | Overrides the store-wide delivery text, e.g. "Normalt 7–12 arbetsdagar". Only if confirmed. |
| `supplier_sku` | Single-line text | **Never shown** | Internal reference for ordering from the supplier. |
| `complementary_products` | Product (list) | "Passar bra med" | Hand-picked cross-sells. Takes priority over automatic recommendations. |
| `bundle_items` | Product (list) | Startpaket section | The products included in a bundle product. |

The theme does **not** use review/rating metafields and shows no ratings. If you later add a
real review app, display its widget only for genuine reviews.

## Product fields

- **Title / description:** Swedish. Describe what it is, what it is for and its limits. Avoid
  "100 % säker", "godkänd", "barnsäker garanti" or any claim you cannot document.
- **Product type:** used as the small label on cards and as a filter. Use the category names:
  `Lås & spärrar`, `Kant- & hörnskydd`, `Skåp & lådor`, `Dörrar & klämskydd`, `Eluttag`, `Startpaket`.
- **Tags:** `demo` marks a product as demonstration content (see below). Category tags such as
  `kategori-las-sparrar` can power smart collections.
- **Variants:** use options such as *Färg* or *Antal*. Variant images are switched automatically.
- **Price / compare-at price:** compare-at prices are hidden unless *Theme settings → Leverans,
  retur och priser → Visa jämförpris* is enabled. Swedish price law (prisinformationslagen)
  requires that a price-reduction reference is the **lowest price in the previous 30 days**.
- **Images:** see the image requirements in [BRAND.md](BRAND.md). Write alt text in Swedish.

## Products in the store (imported via DSers, 2026-10-14)

Eight AliExpress products were pushed to Shopify with DSers, then rewritten in Swedish. All are
**DRAFT** (not visible) until prices are approved and samples have been checked. The eight `demo`
drafts were deleted the same day.

| Handle | Title | Product type (collection) | Extra tag | Variants (option) |
|---|---|---|---|---|
| `magnetiskt-barnlas` | Magnetiskt barnlås för skåp och lådor | Lås & spärrar | `kategori-skap-lador` | Antal: 4 lås + 1 nyckel … 20 lås + 5 nycklar |
| `flexibel-skapsparr` | Flexibel spärr för skåp och lådor | Skåp & lådor | – | Antal: 10–60 st |
| `kylskapslas` | Kylskåpslås med tryckknapp | Lås & spärrar | – | Antal: 1, 3, 6 st |
| `sparr-for-dorrhandtag` | Spärr för dörrhandtag | Dörrar & klämskydd | `kategori-las-sparrar` | Färg: Vit · Skickas från: Kina |
| `klamskydd-dorr` | Klämskydd för dörr i mjuk skumplast | Dörrar & klämskydd | – | Antal: 3, 6 st |
| `uttagsskydd-vridlock` | Uttagsskydd med vridlock | Eluttag | – | Antal: 1, 5, 6 st · Skickas från: Kina |
| `kantlist-genomskinlig` | Genomskinlig kantlist, 3 m | Kant- & hörnskydd | – | Längd: 3 m |
| `hornskydd` | Hörnskydd för bord och möbler | Kant- & hörnskydd | – | Modell: 15 supplier values, still in English |

What was set on every product:
- Swedish title, handle, description (what it does, mounting, "Bra att veta"), SEO title and
  description, vendor `Lugnhem`, tag `aliexpress` (for filtering in admin).
- `custom.warnings` – Swedish safety warnings (magnets, small parts, adhesive, supervision).
  **Compare them with the manufacturer's warnings on the packaging when the samples arrive.**
- `custom.complementary_products` – hand-picked cross-sells ("Passar bra med").
- Compare-at prices removed (DSers had set compare-at = price).
- Option names and values translated. Variant IDs were kept (renamed in place), so the DSers
  mapping should be unaffected – check one product under DSers → *Mapping* to be sure.

Deliberately **not** set: specification metafields (`materials`, `dimensions`, …) and
`specs_verified`. The supplier data contradicts itself (e.g. the edge strip is described as both
silicone and PVC, "300 mm" and "300 cm"), so nothing is shown until checked on a sample.
Claims from the supplier listings such as "3M", "food grade", "100 % safe" and "Universal 99 %
fit" were not used.

Open points:
- **Prices** are still DSers' purchase price (= cost). Set the approved prices before activating.
- **Hörnskydd** variant names ("Heart-window", "Upgraded-round", …) need someone who can see the
  images to name them in Swedish; most variants have under 30 in stock.
- **Uttagsskydd** is described by the supplier as a *"French spring model"*. French (type E) and
  Swedish (type F) sockets differ – test a sample in a Swedish socket before selling.
- Several variants have very low supplier stock (magnetic 8+2: 2, strap 20 st: 6, foam guard:
  10–16). DSers syncs stock, and Shopify shows "Slutsåld" automatically when it reaches 0.
- Delivery to Sweden quoted in DSers: AliExpress Selection Standard, about US$1.99 per item,
  7–16 days (one product up to 20 days). Add a delivery text only once confirmed.

### Demo safeguards (kept in the theme)

Anything tagged `demo` still gets a "Demoprodukt" badge, no add-to-cart button, `noindex` and no
Product structured data – useful if you ever add placeholder products again.

## Bundles / starter kits

- A bundle is a normal product (e.g. "Startpaket Kök") with `custom.bundle_items` listing the
  included products. The Startpaket section shows what is included and – only if it is really
  cheaper – "Köpt var för sig: X kr · Y kr lägre i paket", calculated from current prices.
- **Inventory is not synchronised.** Selling the bundle does not reduce stock of the included
  products. For dropshipping this usually means the supplier must ship the kit as one SKU, or
  you use Shopify's free **Shopify Bundles** app (which creates real component-based bundles
  with inventory) – then keep `custom.bundle_items` in sync for display.

## Information to request from the supplier (per product)

- Exact product name/model and supplier SKU
- Materials (incl. adhesive), dimensions and weight
- Installation method and tools needed; tested surfaces (wood, laminate, glass, tile…)
- Package contents
- **Age guidance / intended use and the manufacturer's warnings** (in Swedish if possible)
- **Safety documentation:** CE marking where applicable, EU Declaration of Conformity, test reports
  (e.g. for child-resistant products), REACH/RoHS statements, battery/magnet information if relevant
- Name and EU address of the manufacturer / EU responsible person (GPSR, Regulation (EU) 2023/988)
- Country of shipment, customs/VAT handling (IOSS), carrier, tracking, realistic delivery time to Sweden
- Return address in the EU, defect/complaint handling, and who pays return shipping
- Product photos you are licensed to use (written permission)
- Stock levels / inventory feed and how cancellations are handled
- Wholesale price, shipping cost and minimum order quantities
