# Design notes (Board G: Swiss Echo)

## Typography and font licensing

### Font decision and bundled licences

The implementation uses **Familjen Grotesk 700** for display, **Instrument Sans 400–700** for body copy, and **Instrument Serif italic 400** for accents. The three existing WOFF2 files remain self-hosted through `next/font/local`; builds need no font-service request. CSS uses the generated variables with system/Georgia fallbacks and never redeclares those variables in `:root`.

Full SIL Open Font License 1.1 notices, copied from the upstream repositories on 2026-11-02:

| Family | Bundled notice | Upstream |
| --- | --- | --- |
| Familjen Grotesk | [OFL](../public/fonts/licenses/FamiljenGrotesk-OFL.txt) | [Familjen-Sthlm](https://github.com/Familjen-Sthlm/Familjen-Grotesk/blob/master/OFL.txt) |
| Instrument Sans | [OFL](../public/fonts/licenses/InstrumentSans-OFL.txt) | [Instrument](https://github.com/Instrument/instrument-sans/blob/master/OFL.txt) |
| Instrument Serif | [OFL](../public/fonts/licenses/InstrumentSerif-OFL.txt) | [Instrument](https://github.com/Instrument/instrument-serif/blob/main/OFL.txt) |

The Chromium e2e check inspects platform fonts for the hero heading and requires Familjen Grotesk with `isCustomFont:true`, rather than merely trusting the CSS family declaration.

## Palette & design tokens (Board G)

A warm neutral monochrome palette where real photography provides natural colour. No blue, teal, purple, or cool-tinted grays are used anywhere on the site, including focus rings, borders, and input placeholders.

- `--bg: #F3F1ED` (warm light paper background)
- `--surface: #FFFFFF` (clean card surface)
- `--ink: #141311` (primary text and solid pill elements)
- `--muted: #5C5852` (secondary body text, contrast ratio 4.79:1 on `--bg`, exceeding WCAG AA 4.5:1)
- `--hair: rgba(20, 19, 17, 0.14)` (subtle structural divider hairlines)
- `--accent: #B4411B` (ember accent used sparingly: focus indicators, mock mode banner, error accents)
- `--echo-1: #BDB9B1`, `--echo-2: #C9C5BD`, `--echo-3: #D3CFC8`, `--echo-4: #DCD9D2` (echo shadows and loading placeholder)
- Dark footer: background `--ink` (`#141311`), text `rgba(243, 241, 237, 0.65)` (contrast ratio 8.6:1 against `--ink`).

## Deviations from reference spec & design rationale

Foundation correction (2026-11-02): the Statement uses the captured jump-facts sentence "Same aircraft, altitude and instructors in every package". The previous camera-choice subline was not in the knowledge data and was removed. Header links show from 768px; compact tablet spacing retains the pill and prevents horizontal overflow. The Step 5 circle has an explicit narrow-layout width as well as its square aspect ratio; its inner photo fills the circular frame. No scroll-portal or floating-card redesign is included.

1. **Grays darkened for WCAG AA compliance**:
   Body text and secondary captions use `--muted` (`#5C5852`) rather than lighter tints, ensuring all text satisfies WCAG 2.1 AA standards (minimum 4.5:1 contrast for normal text).
2. **No hover-only colour gate**:
   All photographs render in full natural colour upon initial reveal. Hovering adds a subtle `scale(1.03)` transform with smooth easing. Under `prefers-reduced-motion: reduce`, all scaling and motion transitions are disabled.
3. **Single-element echo effect**:
   The echo effect on "Skydiving" uses a single semantic `<span>` element with multi-stop `text-shadow`:
   `-0.04em -0.04em 0 var(--echo-1), -0.08em -0.08em 0 var(--echo-2), -0.12em -0.12em 0 var(--echo-3), -0.16em -0.16em 0 var(--echo-4)`.
   Padding (`padding-top: 0.16em; padding-left: 0.16em`) ensures the text shadows are not clipped.
4. **Native `<dialog>` element**:
   The chat assistant panel uses native `<dialog>` invoked with `.showModal()`, providing an accessible modal dialog with browser-native focus trapping, `Escape` key dismissal, and automatic focus restoration without third-party modal libraries.

## Photography & media asset inventory

All images are downloaded into `public/images/`, scaled to at most 1600px wide, and optimized for delivery with descriptive alt text and loading placeholders.

| Asset | Local path | Dimensions | File size | Source URL | Descriptive alt text |
|---|---|---|---|---|---|
| Hero band | `public/images/home-hero-skydivers.webp` | 1536 × 1024 | 109 KB | `https://www.greedyadventures.com/greedy/img/home/home-hero-skydivers.webp` | Tandem skydivers freefalling in open skies above the coastline |
| Step 2 | `public/images/step-2.jpg` | 1365 × 2048 | 346 KB | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/sea-view-tandem-skydive-pattaya/108d38.jpg` | Skydiver having safety harness fitted during pre-jump briefing |
| Step 3 | `public/images/step-3.webp` | 1600 × 1066 | 155 KB | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/plane.webp` | Jump aircraft propeller and fuselage on the runway |
| Step 4 | `public/images/step-4.webp` | 1600 × 1600 | 179 KB | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/tandem-with-sea-view.webp` | Tandem skydivers in freefall with the sea and coastline below |
| Step 5 | `public/images/step-5.jpg` | 1085 × 1018 | 196 KB | `https://www.greedyadventures.com/greedy/trips/tandem-canopy-landing-g0250281.jpg` | Tandem skydiver and instructor landing safely under open canopy |

*Note: The video (`https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4`) is streamed via external URL and is never stored locally.*



## Pass 4, commit 1: scroll portal

The photo reveal replaces the separate photo band. One semantic, single-line h1 contains two inline spans with a real separating space; both have the warm echo. A 220dvh section contains a sticky stage below the shared 80px header. Its panels slide by their own widths. The pure pin/passage geometry drives a single CSS property through passive events and a coalesced animation frame; no React frame state or timed progress.

Familjen Grotesk Bold uses clamp(2rem, 6vw, 6.5rem). Whole-title scale is 1→1.1, tracking −.04em→−.08em. Word travel is 50% of each word above 1023px, 30% at tablet, 20% below 768px. Bounds are asserted at 390/768/1440px. The title stays in the upper sky, away from the people, travelling dots and thin rules. Its colour reaches a middle warm grey while both paper and photo are exposed, then finishes paper; echoes fade quadratically to transparent. This pacing avoids an unreadable near-background colour during the panel transition.

Each warm blend layer reaches .4 opacity; a fixed .45 ink scrim keeps the photographic sky behind the moving letters dark enough. The photo remains visible, including both skydivers. CTA/facts occur once in the following intro, and the video opens externally with noopener noreferrer. The footer reserves 76px plus safe-area inset for the unchanged launcher. Reduced motion uses a static final photo/title, no pin, panels, dots or scroll/resize listeners.

See frontend-scroll-report.md and examples/scroll-hero for screenshot measurements and the limits of the sampling method.
