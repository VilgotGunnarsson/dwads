# Brand – working name and identity

> **Status:** working name only. Nothing here has been checked for trademark conflicts,
> company-name conflicts (Bolagsverket) or domain availability. Do that before launch –
> see [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Name proposals

| Name | Meaning / rationale | Watch-outs |
|---|---|---|
| **Varsam** *(selected working name)* | Swedish adjective: *careful, gentle, considerate*. Signals calm care rather than fear. Short, easy to say, works as a wordmark, and fits the "quiet confidence" art direction. | Common Swedish word → may be hard to register as a trademark on its own; other businesses may already use it. Check PRV/EUIPO and Bolagsverket. |
| **Lugnhem** | *lugn* (calm) + *hem* (home): the parent's peace of mind. Reads as a native compound and is more distinctive than a single dictionary word. | Slightly longer; check whether similar names exist in the home/interior sector. |
| **Värn** | *protection / safeguard*. Short, Nordic and memorable. | Can feel stern for a baby brand; generic word with likely registration difficulties; the "ä" complicates domains (consider `varn` + IDN). |

## Where the name lives (change it in one place)

- **Theme editor → Theme settings → Varumärke → Varumärkesnamn** (`settings.brand_name`).
  Used by the wordmark, page titles, Open Graph tags, Organization JSON-LD, password page and footer copyright.
- **Shopify admin → Settings → General → Store name.** Currently *"Min butik 2"*. This is what
  Shopify Checkout, order emails and the browser tab on checkout show. **Change it before launch.**
- Template copy deliberately avoids repeating the brand name, so no JSON template needs editing
  when the name changes. Verify with `grep -rn "Varsam" templates sections snippets` (should return nothing).
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
