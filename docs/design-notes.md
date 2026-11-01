# Design notes (Board G: Swiss Echo)

## Typography and font licensing

### Font decision and bundled licences

The implementation uses **Familjen Grotesk 700** for display, **Instrument Sans 400–700** for body copy, and **Instrument Serif italic 400** for accents. The three existing WOFF2 files remain self-hosted through `next/font/local`; builds need no font-service request. CSS uses the generated variables with system/Georgia fallbacks and never redeclares those variables in `:root`.

Full SIL Open Font License 1.1 notices, copied from the upstream repositories on 2026-11-02:

| Family           | Bundled notice                                          | Upstream                                                                                 |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Familjen Grotesk | [OFL](../public/fonts/licenses/FamiljenGrotesk-OFL.txt) | [Familjen-Sthlm](https://github.com/Familjen-Sthlm/Familjen-Grotesk/blob/master/OFL.txt) |
| Instrument Sans  | [OFL](../public/fonts/licenses/InstrumentSans-OFL.txt)  | [Instrument](https://github.com/Instrument/instrument-sans/blob/master/OFL.txt)          |
| Instrument Serif | [OFL](../public/fonts/licenses/InstrumentSerif-OFL.txt) | [Instrument](https://github.com/Instrument/instrument-serif/blob/main/OFL.txt)           |

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

Foundation correction (2026-11-02): the Statement uses the captured jump-facts sentence "Same aircraft, altitude and instructors in every package". The previous camera-choice subline was not in the knowledge data and was removed. Header links show from 768px; compact tablet spacing retains the pill and prevents horizontal overflow. The foundation originally repaired the Step 5 circle. Pass 4 below supersedes that showcase with ordered 4:3 photo cards and the photo band with the scroll portal.

1. **Grays darkened for WCAG AA compliance**:
   Body text and secondary captions use `--muted` (`#5C5852`) rather than lighter tints. Automated contrast/axe checks are reported per tested state; this is not a claim of universal manual WCAG certification.
2. **No hover-only colour gate**:
   Plan photographs retain natural colour on reveal; the hero uses the documented warm grade/scrim. Plan image hover adds a subtle `scale(1.03)` transform with smooth easing. Under `prefers-reduced-motion: reduce`, all scaling and motion transitions are disabled.
3. **Semantic echo effect**:
   The portal uses two inline spans in one h1, each with the same warm multi-stop `text-shadow`:
   `-0.04em -0.04em 0 var(--echo-1), -0.08em -0.08em 0 var(--echo-2), -0.12em -0.12em 0 var(--echo-3), -0.16em -0.16em 0 var(--echo-4)`.
   Portal copy inset and measured title bounds keep echoes in the stage; their colours fade with progress and are transparent at the final state.
4. **Native `<dialog>` element**:
   The chat assistant panel uses native `<dialog>` invoked with `.showModal()`, providing an accessible modal dialog with browser-native focus trapping, `Escape` key dismissal, and automatic focus restoration without third-party modal libraries.

## Photography & media asset inventory

All images are downloaded into `public/images/`, scaled to at most 1600px wide, and optimized for delivery with descriptive alt text and loading placeholders.

| Asset       | Local path                               | Dimensions  | File size | Source URL                                                                                                 | Descriptive alt text                                            |
| ----------- | ---------------------------------------- | ----------- | --------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Hero portal | `public/images/home-hero-skydivers.webp` | 1536 × 1024 | 109 KB    | `https://www.greedyadventures.com/greedy/img/home/home-hero-skydivers.webp`                                | Tandem skydivers freefalling in open skies above the coastline  |
| Step 2      | `public/images/step-2.jpg`               | 1365 × 2048 | 346 KB    | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/sea-view-tandem-skydive-pattaya/108d38.jpg` | Skydiver having safety harness fitted during pre-jump briefing  |
| Step 3      | `public/images/step-3.webp`              | 1600 × 1066 | 155 KB    | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/plane.webp`                    | Jump aircraft propeller and fuselage on the runway              |
| Step 4      | `public/images/step-4.webp`              | 1600 × 1600 | 179 KB    | `https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev/offerings/apex-gallery/tandem-with-sea-view.webp`     | Tandem skydivers in freefall with the sea and coastline below   |
| Step 5      | `public/images/step-5.jpg`               | 1085 × 1018 | 196 KB    | `https://www.greedyadventures.com/greedy/trips/tandem-canopy-landing-g0250281.jpg`                         | Tandem skydiver and instructor landing safely under open canopy |

_Note: The video (`https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4`) is streamed via external URL and is never stored locally._

## Pass 4, commit 1: scroll portal

The photo reveal replaces the separate photo band. One semantic, single-line h1 contains two inline spans with a real separating space; both have the warm echo. A 220dvh section contains a sticky stage below the shared 80px header. Its panels slide by their own widths. The pure pin/passage geometry drives a single CSS property through passive events and a coalesced animation frame; no React frame state or timed progress.

Familjen Grotesk Bold uses clamp(2rem, 6vw, 6.5rem). Whole-title scale is 1→1.1, tracking −.04em→−.08em. Word travel is 50% of each word above 1023px, 30% at tablet, 20% below 768px. Bounds are asserted at 390/768/1440px. The title stays in the upper sky, away from the people, travelling dots and thin rules. Its colour reaches a middle warm grey while both paper and photo are exposed, then finishes paper; echoes fade quadratically to transparent. This pacing avoids an unreadable near-background colour during the panel transition.

Each warm blend layer reaches .4 opacity; a fixed .45 ink scrim keeps the photographic sky behind the moving letters dark enough. The photo remains visible, including both skydivers. CTA/facts occur once in the following intro, and the video opens externally with noopener noreferrer. The footer reserves 76px plus safe-area inset for the unchanged launcher. Reduced motion uses a static final photo/title, no pin, panels, dots or scroll/resize listeners.

See frontend-scroll-report.md and examples/scroll-hero for screenshot measurements and the limits of the sampling method.

## Pass 4, commit 2: floating plan cards

The plan is now an ol of five li cards in source order, replacing the old out-of-order pill/circle showcase. The first card is text-only, preserving check-in/photo-ID copy; all four original photographs remain. Step labels and heading/subtitle live in src/content. Each card uses --surface, --hair, 12px radius, 20px padding and the single shared --shadow-float token: 0 1px 2px rgba(20,19,17,.06), 0 24px 48px -24px rgba(20,19,17,.28). Hover strengthens the same warm shadow slightly and lifts the inner surface 6px; it reveals no content and creates no tab stop.

Desktop is a 12-column grid, spans 4/5, with alternating 0/56px offsets and 24px neighbour overlap. Later cards have higher z-index. Tablet has two columns and 32px alternating offsets; mobile has one column and 16px gaps, no static offsets or overlap. Natural caption wrapping is retained at narrow widths rather than truncating source text. Photos have 4:3 frames, 8px radius and the existing once-only clip-path reveal.

Drift amplitudes are 12/16/20/24/18px. The hook measures the untransformed li; a descendant translates by (.5 - p) × amplitude. Keeping the measurement outside the moving layer avoids geometric feedback. The separate inner surface owns hover lift, so it cannot overwrite scroll drift. Reduced motion removes both transformations and listeners. Static top offsets never animate. Only transforms animate for float/hover; the existing explicitly requested RevealImage clip-path is the reveal exception.

Desktop text has an additional 8px end gutter inside the standard 20px card padding: the 24px overlapping neighbour would otherwise cover up to 4px of copy. Titles/captions wrap before that overlap; photographs retain their full frame. A browser assertion checks caption clearance.

Portal geometry at the tested widths:

| Viewport | Base display size    | Whole scale | Tracking in em | Word travel (each own width) |
| -------- | -------------------- | ----------- | -------------- | ---------------------------- |
| 390px    | 32px (clamp minimum) | 1→1.1       | −.04→−.08      | 20%                          |
| 768px    | 46.08px (6vw)        | 1→1.1       | −.04→−.08      | 30%                          |
| 1440px   | 86.4px (6vw)         | 1→1.1       | −.04→−.08      | 50%                          |

The base title occupies approximately 65% on mobile and 48% on tablet/desktop. Both the complete h1 and its independently translated words are measured in the viewport-bound assertions, rather than assuming the formula alone guarantees fit.

## Pass 5: final presentation and image delivery

Responsive image sizes now describe the actual card frames, including padding/borders, grid columns/overlap and max-width. Additional optimizer candidates keep normal slot rounding within 10%; no source photo is rewritten. At 390px/DPR2.75, each 300px plan frame selects 828px instead of 1080px. The hero uses fill/preload (the supported Next 16 successor to priority) with a 100vw slot; a 1440 candidate avoids its old desktop 1920 URL jump. See release-load.spec.ts and the release report for transfer evidence and measurement limits.

Long assistant prose is clamped to eight lines only when longer than 600 characters. Shared Show full answer/Show less labels and aria-expanded/controls disclose the complete, unchanged DOM text. Source chips and tool cards remain outside the clamp. Knowledge panels now have semantic h2 headings without changing their visual tab design. UI styles continue to use warm tokens; focus is solid ink or ember, not browser blue.

### Final viewport screenshot index

These are the current Pass 5 figures; earlier chat/Knowledge/hero files are historical evidence of their respective passes. Every requested 1440/390 figure was personally opened by Codex and reviewed. They are viewport captures, not resized full pages. Plan reveals are asserted complete before capture, without sleeps. The launcher remains fixed and can overlay a viewport edge; footer clearance preserves access by scrolling. The trace screenshot intentionally shows the tools area, not the entire long report.

| Width                | Home top                                              | Home scrolled (plan)                                        | Chat with reply                                    | Knowledge trace                                                |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| 1440                 | [Top](screenshots/final-v5/release-home-1440-top.png) | [Plan](screenshots/final-v5/release-home-1440-scrolled.png) | [Chat](screenshots/final-v5/release-chat-1440.png) | [Trace](screenshots/final-v5/release-knowledge-trace-1440.png) |
| 390                  | [Top](screenshots/final-v5/release-home-390-top.png)  | [Plan](screenshots/final-v5/release-home-390-scrolled.png)  | [Chat](screenshots/final-v5/release-chat-390.png)  | [Trace](screenshots/final-v5/release-knowledge-trace-390.png)  |
| 768 (extra coverage) | [Top](screenshots/final-v5/release-home-768-top.png)  | [Plan](screenshots/final-v5/release-home-768-scrolled.png)  | [Chat](screenshots/final-v5/release-chat-768.png)  | [Trace](screenshots/final-v5/release-knowledge-trace-768.png)  |

The shared two demo-link settings live in src/content/site.ts; colours/fonts are design configuration, not business facts. Knowledge/source facts remain parity-tested against the frozen capture. Screenshot recompression is lossless, with decoded pixel hashes checked before writes. No claim of Lighthouse target scores: the tool was absent and installs forbidden.
