# Frontend pass 4 report

## Commit 1: scroll portal hero

Offline mock verification only; no dependency install, live API, deployment or backend change. The portal replaces Hero + PhotoBand with one sticky 220dvh section. CTA/facts move into HeroIntro; footer clearance preserves the launcher. Progress is position-driven and reversible. Reduced motion never binds scroll/resize listeners.

### Screenshot evidence

Personally reviewed all six requested hero viewport captures (390/1440, p=0/.5/1). No clipped letters, hidden text or horizontal overflow. The opening intentionally keeps the paper board's large quiet area. The photo retains skydivers and its blue sky is reduced toward the warm grade, not replaced by a flat fill.

| Width | Minimum sampled contrast, p=0/.25/.5/.75/1 | Photo RGB p=0 | Photo RGB p=1 | Blue minus red |
|---|---|---|---|---|
| 390 | 16.46 / 3.41 / 3.41 / 3.96 / 13.55 | 40.67, 74.20, 103.51 | 42.01, 66.15, 72.24 | 62.84 → 30.23 |
| 768 | 16.46 / 3.41 / 3.41 / 3.90 / 13.53 | 41.32, 75.67, 105.55 | 43.18, 67.43, 73.42 | 64.24 → 30.23 |
| 1440 | 16.46 / 3.41 / 3.41 / 3.45 / 11.87 | 41.10, 77.47, 108.86 | 42.89, 69.24, 75.53 | 67.76 → 32.64 |

Sampling method: foreground and hidden-title screenshots identify opaque glyph cores and their actual underlying surface. Antialiased glyph edges and the one-pixel moving panel seam are excluded (blended edge pixels are not a uniform surface). This is a sampled large-text contrast check, not a proof for every subpixel or scroll position. The photo mean uses separate audit screenshots with opaque foreground panels, title and dots hidden; otherwise the p=0 photo is completely occluded by design. The scrim and overlays stay intact. Actual viewport screenshots are untouched.

Geometry: title font clamp(2rem,6vw,6.5rem), scale 1→1.1, tracking −.04em→−.08em, word travel 50% desktop/30% tablet/20% mobile. Both spans stay in bounds at every tested endpoint/midpoint, along with the complete h1 box. Both panels, dots, scale, tracking and grade reverse to exactly their starting computed state. The title colour's middle-grey plateau maintains contrast while paper and photo coexist. Overlay maximum .4 and fixed ink scrim .45 were selected from screenshot evidence, keeping both people visible.

Short PerformanceObserver observations are stored as performance-{width}.json (navigation plus 0/.5/1/.5/0 scroll). They include navigation/hydration, not just animation; no claim of a Lighthouse score. Only transform and opacity are scroll-animated except the requested h1 tracking/colour. Existing RevealImage keeps its requested once-only clip-path reveal.

### Real command output

Full, unedited output: [typecheck](examples/scroll-hero/typecheck.txt), [lint](examples/scroll-hero/lint.txt), [unit](examples/scroll-hero/test.txt), [build](examples/scroll-hero/build.txt), [e2e](examples/scroll-hero/e2e.txt).

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

Test Files  45 passed (45)
Tests  526 passed (526)

> assignment@0.1.0 build
> next build
✓ Compiled successfully in 312ms
Finished TypeScript in 2.1s
✓ Generating static pages using 8 workers (7/7) in 674ms
```

Assumptions: the common header remains 80px; dvh geometry updates on resize; narrow-screen word travel may reduce from the desktop 50% as approved. Reduced-motion final means the final visual state without scroll binding. 76px plus safe area reserves the 52px launcher and its 24px offset. Pixel sampling excludes antialiasing as stated, and does not claim every possible intermediate fraction passes. English/source copy and all existing facts are unchanged.

First full matrix: 197 passed, 1 failed (2.7m). The Desktop model-failure chat test timed out while Playwright waited for the unchanged fixed launcher to become stable, before any chat request. It reported no intercepting element, application error or geometry change. The unchanged Desktop chat-errors file immediately passed all 6 cases (4.9s), including this case in 490ms. This does not establish a definitive cause; it is recorded as an isolated browser actionability stall, not hidden with a delay, force click or increased timeout. The final full matrix will be rerun after cards. Raw evidence: e2e.txt and chat-click-recheck.txt.
