# Brand – Lugnhem

> **Status:** brand name chosen by the owner on 2026-10-10. `lugnhem.se` and `lugnhem.com` were
> available when checked that day (not registered by us – register them promptly). No trademark,
> company-name (Bolagsverket) or social-handle check has been done yet – see
> [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Name

**Lugnhem** – *lugn* (calm) + *hem* (home): the parent's peace of mind, not fear. No å/ä/ö, so
the domain is spelled exactly as the name is said, and it is easy to say on the phone. A web
search on 2026-10-10 found no company called Lugnhem (not a registry check).

### Names considered

| Name | Outcome |
|---|---|
| **Lugnhem** | ✅ Chosen. lugnhem.se + .com available at check time. |
| Varsam | ❌ Dropped: varsam.se taken; a "Varsam AB" appears in a Västerås business listing; `varsam-sverige.se` rejected (hyphen, traffic leaking to varsam.se, confusion risk). |
| Varsamhem | Runner-up; varsamhem.se was available, but customers could still type varsam.se. |
| Tryggvrå, Stillhem, Hemvrå, Lugnvrå, Mjukhörn | .se available at check time; not chosen. |
| Hemlugn, Ombonat | .se taken. |
| Värn | Too stern; generic word. |

## Where the name lives (change it in one place)

- **Theme editor → Theme settings → Varumärke → Varumärkesnamn** (`settings.brand_name`).
  Used by the wordmark, page titles, Open Graph tags, Organization JSON-LD, password page and footer copyright.
- **Shopify admin → Settings → General → Store name.** Currently *"Min butik 2"*. This is what
  Shopify Checkout, order emails and the browser tab on checkout show. **Change it before launch.**
- Template copy deliberately avoids repeating the brand name, so no JSON template needs editing
  when the name changes. Verify with `grep -rn "Lugnhem" templates sections snippets` (should return nothing).
- The theme's internal name (`config/settings_schema.json` → `theme_info`) is developer-facing only.

## Wordmark

- Text wordmark set in the heading font (Fraunces), with an optional line symbol: two nested
  rounded corners – a quiet reference to corner protection and to "shelter". Toggle it under
  *Varumärke → Visa symbol bredvid ordmärket*.
- Uploading a logo under *Varumärke → Logotyp* replaces the text wordmark everywhere.
- The symbol is drawn inline in `snippets/wordmark.liquid` (and reused as the category fallback tile).
  It is original to this theme, but has not been checked against existing marks.

## Visual system (theme settings → Färger / Typografi / Layout)

| Token | Default | Use |
|---|---|---|
| Bakgrund (kräm) | `#F5F0E8` | Page background |
| Yta (benvit) | `#FBF8F3` | Cards, drawers, inputs |
| Beige | `#EAE1D3` | Image backgrounds, footer |
| Salvia (ljus) | `#DCE2D3` | Feature sections |
| Text | `#2A2926` | Body text (12.8:1 on cream) |
| Sekundär text | `#615D55` | Supporting text (5.8:1 on cream, 5.0:1 on sage – AA) |
| Primär knapp | `#4A5A43` deep sage | CTAs (7.0:1 with off-white text) |
| Accent | `#9C5233` terracotta | Warnings, sale price – sparingly (5.0:1 on cream) |
| Mörk bakgrund | `#2F342C` | Newsletter, announcement bar (10.8:1 with its text colour) |

- **Headings:** Fraunces (Shopify font library, `fraunces_n4`) – soft editorial serif.
- **Body:** Instrument Sans (`instrument_sans_n4`) – neutral, highly legible; full å/ä/ö support.
- Signature shapes: arch ("valv") image crops, hairline dividers, numbered editorial lists.
- No ratings, review stars, "bästsäljare" labels, countdowns or urgency badges anywhere in the theme.

## Imagery requirements

Use your own photography or properly licensed stock. Do **not** use supplier photos of other
brands' products as your own, and never present a generated or staged image as a photo of the
exact product being sold.

| Placement | Recommended size | Notes |
|---|---|---|
| Hero | ≥ 1600 × 2000 px (4:5) | Calm interior, child-safe context, natural light. Set alt text in Filer. |
| Category tiles | ≥ 1200 × 1200 px | One per category. Without an image a typographic brand tile is shown. |
| Product images | ≥ 1600 × 1600 px, square | Neutral background first, installed-in-home second. |
| "Så väljer vi" / Om oss | ≥ 1400 × 1750 px | Lifestyle. |
| Social share | 1200 × 630 px | Theme settings → Varumärke. |
| Favicon | 32 × 32 px | Theme settings → Varumärke. |
