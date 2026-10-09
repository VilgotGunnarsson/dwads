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

## Demo products currently in the store

Eight **DRAFT** products were created for structure only. All are tagged `demo` and
`demo-ej-till-salu`, have vendor "DEMO – ej till salu", price 0,00 kr, tracked inventory at 0
with overselling denied, and descriptions starting with "DEMO – EJ TILL SALU".

| Handle | Product type |
|---|---|
| `demo-magnetisk-ladsparr` | Lås & spärrar |
| `demo-kylskapslas` | Lås & spärrar |
| `demo-skapsparr-tryckknapp` | Skåp & lådor |
| `demo-hornskydd` | Kant- & hörnskydd |
| `demo-kantlist` | Kant- & hörnskydd |
| `demo-dorrstopp-klamskydd` | Dörrar & klämskydd |
| `demo-uttagsskydd` | Eluttag |
| `demo-startpaket-kok` | Startpaket |

Safeguards in the theme for anything tagged `demo`:
- "Demoprodukt" badge on cards and product page.
- No add-to-cart button (a notice is shown instead), including in the bundle section.
- `noindex` meta tag and no Product structured data.

**To turn a demo into a real product:** replace title, description, images, price and
metafields with verified data → remove both `demo` tags → set inventory/fulfilment for the
supplier → set status *Active* and publish to the Online Store. Or simply delete the demos.

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
