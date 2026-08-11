# Evora Home — design system

The storefront for a furniture and home-decor shop in El Khroub, Constantine (25100).
This document is the contract. If a component disagrees with it, the component is wrong.

## The brief in one line

Make an Algerian furniture shop's real catalogue look like a showroom, on a mid-range
Android phone, over mobile data, in French.

## Colour

Tokens live in `client/src/index.css` under `@theme`. Components use the Tailwind
utility (`bg-olive`, `text-gold`, `border-greige`). Raw hex values in components are
a defect.

| Token | Hex | Use |
|---|---|---|
| `olive` | `#3E4638` | Navbar, footer, full-bleed section bands, primary buttons |
| `forest` | `#2A3026` | Deepest surfaces, overlays, hover state on olive |
| `gold` | `#C0A062` | Hairlines, borders, active underlines, the logo mark |
| `sand` | `#DCC79A` | Gold at low emphasis. Body text on olive surfaces |
| `cream` | `#F6F2EA` | Page background. Never pure white |
| `greige` | `#D8D1C5` | Card borders, image frames, input borders, dividers |
| `ink` | `#1F2320` | Body text. Never pure black |
| `ink-muted` | `#6B7065` | Secondary text on cream (4.68:1) |
| `gold-deep` | `#7E6228` | Gold-reading text on cream (5.13:1) |

### Rules

- **Gold is a hairline colour.** 1px borders, thin underlines, small icons, the mark.
  The moment gold fills a large area the site stops reading as premium and starts
  reading as a cheap "luxury" template.
- **There is no gold gradient anywhere on this site.** No gradients at all, in fact.
- **The page base is cream.** Every product photo the client has is beige, greige or
  cream boucle fabric. Those products visually disappear on `#FFFFFF`.
- **Olive carries the brand** and appears in large blocks: navbar, footer, one or two
  section bands, image overlays.
- **One palette, locked.** No section introduces a colour outside this table.

### Contrast, and the one place the brief had to bend

Raw `gold` on `cream` measures **2.23:1**. That fails the 4.5:1 body floor and also
fails the 3:1 large-text floor, so gold cannot be used for any text on cream,
including the price. The brief asks for gold price emphasis; the resolution is
`gold-deep` (**5.13:1**), which still reads as the brand's gold. Raw `gold` stays on
hairlines, rules and the mark, where contrast rules do not apply.

On olive: `cream` text is 8.80:1, `sand` is 5.93:1, raw `gold` is 3.95:1 and is
therefore large-text only.

## Type

Two faces, both self-hosted as variable woff2 from `/public/fonts`. No Google Fonts
CDN link: the audience is on mobile data and a third-party font request is a
render-blocking round trip we control nothing about.

**Cinzel** — headings, section titles, the navbar wordmark. Uppercase, tracking
`0.08em`. A near-exact match for the engraved serif on the client's logo card.
**Never body copy. Never below 16px.** It has short descenders and turns to a smear.

**Jost** — everything else: navigation, buttons, product names, prices, body copy,
forms. Light and Regular weights, `0.02em` to `0.15em` tracking on labels and nav
items, matching the logo's tagline treatment.

Inter, Poppins, Roboto and Open Sans are not used anywhere in this project.

## The signature device

The tree mark from the logo, as `client/src/Components/Brand/EvoraTree.jsx`.

It appears in **exactly four places**:

1. the loading state
2. the section divider between major page sections
3. the empty-state illustration
4. an oversized low-opacity watermark behind the footer

One device used four times reads as art direction. The same device used fifteen times
reads as a template. Adding a fifth use is a defect.

The component ships two variants. `full` (154 strokes, three levels of branching) is
legible at 64px and up. `compact` (69 strokes) is used below that, where the full
canopy collapses into a blob. `variant="auto"` picks by size.

## Shape and material

- Corner radius is **4px or 8px**. Nothing else. No `rounded-2xl`, no pills.
- Shadows are **near-absent**. Separation comes from greige hairline borders.
- **Every product image sits in a fixed 4:5 crop**, `object-fit: cover`, 1px greige
  border. The client's photography is inconsistent (showroom tile floors, mixed white
  balance, phone shots). The uniform frame is what makes mismatched photos look
  deliberate.
- Cards sit on cream with generous padding. Never image-flush-to-card-edge.
- Large photography appears **only** in the hero and category headers, and only with
  an olive overlay at 20-35% plus a bottom gradient, so any photo works there.

## Motion

Framer Motion is the animation layer. Lenis provides smooth scroll. anime.js is used
for exactly one thing: the hero mark drawing itself in via SVG `stroke-dashoffset`,
once, on first load.

- Page transitions: clean fade, under 400ms.
- Product grids: staggered entrance on scroll into view, 40-60ms between items,
  **once only**. Never re-trigger on scroll.
- Product cards: slight image scale (1.03 max) and a gold hairline appearing at the
  card's base. No lift, no shadow, no rotation, no tilt.
- Image gallery: crossfade, not slide.
- Cart: count badge animates on add, drawer slides.
- Curves come from the `--ease-*` tokens. Built-in CSS easings are too weak.
- UI durations stay under 300ms. `ease-out` on entrances, never `ease-in`.
- Every animation is wrapped in `prefers-reduced-motion` handling and degrades to
  no-animation cleanly.
- **No decorative animation in the admin.**

Motion should read as expensive furniture-showroom calm, not as a startup landing
page. If an animation draws attention to itself rather than to the product, remove it.

## Language

French is the primary and default language. Copy is written in natural French, not
machine-translated French. The tagline is the client's real one:
**"L'élégance prend forme chez vous."** It is not replaced with an invented
alternative.

Prices format as `139 000.00 DA` through the single `formatPrice` helper in
`client/src/lib/format.js`. There is no second place that formats currency.

Strings are centralised so a locale layer can be added later. There is no i18n
machinery in this pass and no Arabic/RTL version yet.

## Banned

This list exists because the failure mode for this project is "looks AI-generated".

- No purple or blue gradients. No gradient text. No mesh backgrounds. No gradients.
- No glassmorphism, no backdrop-blur cards, no neon glow.
- No row of three identical icon-cards with an icon, a bold heading and two lines of
  filler ("Livraison rapide / Qualité garantie / Support 24/7").
- No emoji anywhere in the UI.
- No `rounded-2xl shadow-lg` on every surface.
- No fake testimonials, no invented statistics, no fake "trusted by" logos, no
  countdown timers.
- No Unsplash or placeholder stock photography in the final build.
- No generic hero copy invented to replace the real tagline.
- No em-dash anywhere visible to the user. Use a regular hyphen.
- No section-number eyebrows, no scroll cues, no decorative status dots.
- Eyebrows (small uppercase tracked labels above a heading) are rationed to at most
  one per three sections.
- Every section must justify its existence. Anything that exists only to fill
  vertical space is cut.

## Responsive floor

The majority of this audience is on mid-range Android phones. **360px is the design
width, not an edge case.** Long French product names, six-digit prices and empty
states all have to hold there. No text below 14px. No tap target below 44px.
