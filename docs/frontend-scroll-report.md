# Frontend pass 4 report

## Commit 1: scroll portal hero

Offline mock verification only; no dependency install, live API, deployment or backend change. The portal replaces Hero + PhotoBand with one sticky 220dvh section. CTA/facts move into HeroIntro; footer clearance preserves the launcher. Progress is position-driven and reversible. Reduced motion never binds scroll/resize listeners.

### Screenshot evidence

Personally reviewed all six requested hero viewport captures (390/1440, p=0/.5/1). No clipped letters, hidden text or horizontal overflow. The opening intentionally keeps the paper board's large quiet area. The photo retains skydivers and its blue sky is reduced toward the warm grade, not replaced by a flat fill.

| Width | Minimum sampled contrast, p=0/.25/.5/.75/1 | Photo RGB p=0        | Photo RGB p=1       | Blue minus red |
| ----- | ------------------------------------------ | -------------------- | ------------------- | -------------- |
| 390   | 16.46 / 3.41 / 3.41 / 3.96 / 13.55         | 40.67, 74.20, 103.51 | 42.01, 66.15, 72.24 | 62.84 → 30.23  |
| 768   | 16.46 / 3.41 / 3.41 / 3.90 / 13.53         | 41.32, 75.67, 105.55 | 43.18, 67.43, 73.42 | 64.24 → 30.23  |
| 1440  | 16.46 / 3.41 / 3.41 / 3.45 / 11.87         | 41.10, 77.47, 108.86 | 42.89, 69.24, 75.53 | 67.76 → 32.64  |

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

First full matrix: 197 passed, 1 failed (2.7m). The Desktop model-failure chat test timed out while Playwright waited for the unchanged fixed launcher to become stable, before any chat request. It reported no intercepting element, application error or geometry change. The unchanged Desktop chat-errors file immediately passed all 6 cases (4.9s), including this case in 490ms. This does not establish a definitive cause; it is recorded as an isolated browser actionability stall, not hidden with a delay, force click or increased timeout. The final full matrix result is recorded below. Raw evidence: e2e.txt and chat-click-recheck.txt.

## Commit 2: floating plan cards

Replaced the out-of-order showcase with a five-item ol in source order. Step 1 is text-only; the four existing photos use non-zero 4:3 frames, 8px radius and RevealImage's once-only reveal. The section stays a Server Component; only PlanCard owns the shared position hook. Labels/copy come from src/content and existing knowledge parity still passes.

Every card uses the same --shadow-float token, warm border, white surface, 12px radius and 20px padding. The 12-column desktop layout spans 4–5 columns, alternates 0/56px offsets and overlaps neighbours by 24px with increasing stacking order. Tablet has two columns/32px offsets; mobile one column/16px gaps/no overlap. A desktop text gutter keeps copy clear of the overlapping neighbour. Drift amplitudes are 12/16/20/24/18px. The hook measures the stationary li; a descendant moves, avoiding feedback. A second inner surface owns hover's −6px lift. No new tab stops, timers or looping animations. Reduced motion removes listeners, drift and hover motion.

All three plan viewport screenshots were personally reviewed. The initial full matrix was already 204/204, but visual review caught a caption underneath the desktop overlap. The 8px text gutter fixes the layout cause, and a new assertion checks caption clearance. The pre-gutter matrix output is retained as e2e-before-gutter.txt rather than concealed. Final output follows in examples/floating-plan/e2e.txt.

### Final real command output

Full transcripts: [typecheck](examples/floating-plan/typecheck.txt), [lint](examples/floating-plan/lint.txt), [unit](examples/floating-plan/test.txt), [build](examples/floating-plan/build.txt), [full e2e](examples/floating-plan/e2e.txt).

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

Test Files  45 passed (45)
Tests  526 passed (526)
Duration  4.11s

> assignment@0.1.0 build
> next build
✓ Compiled successfully in 281ms
Finished TypeScript in 1651ms
✓ Generating static pages using 8 workers (7/7) in 641ms
```

### Scope/dependency proof

Frozen-path diff command (no output):

```text
git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server
```

The throwaway lock comparison (not committed as a script) compared version and integrity on every baseline entry:

```json
{ "baselineEntries": 511, "added": 157, "changed": 0, "removed": 0 }
```

All 157 additions predate this pass. package.json/package-lock.json are unchanged from pass start ffdb6fd. npm ls confirms ai@7.0.158 and @ai-sdk/gateway@4.0.131 throughout the dependency graph. package-additions.diff records only approved frontend additions versus backend-v1. No new packages, installs, backend imports, changes to frozen paths, README, chat or Knowledge code. The protected citation-report file is unchanged. Tests do regenerate unrelated chat/knowledge captures; those are restored before committing. Ports 3000/3100 were checked around runs; final state is free. All server checks use explicit mock mode; no live API or deployment.

Additional assumptions: “one-line caption” means the existing single brief caption, with natural wrapping where necessary for readable mobile text, not truncation or an unbreakable line. Step 01 formatting is a UI label, not a changed source fact. “Not rendered” under reduced motion means display:none removes panels/dots from the render tree; no scroll listener is attached. The photo grade evidence includes both the permitted .4 blend layers and fixed .45 ink scrim, with the specified photo scale changing between endpoints. It is an observed RGB change, not an isolated overlay-only experiment. Performance numbers are this short local navigation/scroll observation, not field performance.

### Reviewed viewport captures

- Hero: screenshots/hero-1440-p0.png, hero-1440-p0.5.png, hero-1440-p1.png; hero-390-p0.png, hero-390-p0.5.png, hero-390-p1.png.
- Plan: screenshots/plan-390.png, plan-768.png, plan-1440.png.
- Extra quarter-point/tablet hero captures and transparent-foreground photo audits remain available with the measurements.

The post-gutter full run passed all product/hero/card assertions but had one filesystem failure while writing the existing docs/screenshots/chat-empty-768.png (UNKNOWN: unknown error, open), with 203 passes/1 failure (1.9m). No timeout, screenshot path, assertion, retry setting or application code was changed to hide it. Raw output is retained in examples/floating-plan/e2e-file-error.txt. The failure is at the host file-write boundary; the underlying reason for that Windows I/O error is unverified. An unchanged full recheck follows in e2e.txt.

### Final matrix and short performance observation

```text
npx playwright test
204 passed (1.9m)
```

All three projects ran 68 tests each with retries:0 and the unchanged 15s test/5s expect timeouts. Final exit code 0. The prior isolated launcher stall and host screenshot-file error are preserved above with their failed transcripts; no tests or runtime code were weakened to clear them. The final code passed the complete matrix, including existing chat/Knowledge tests, axe at both hero endpoints and open chat, all required card geometry and reveal assertions, warm UI colours and screenshot contrast.

Final navigation/reversible-scroll observer evidence (raw JSON in examples/floating-plan):

| Width | Observed CLS | Long tasks |
| ----- | ------------ | ---------- |
| 390   | 0.000000     | 57ms       |
| 768   | 0.001024     | 59ms       |
| 1440  | 0.006721     | 60ms       |

This includes page startup/hydration and is not a browser performance trace, field percentile or isolated animation benchmark; Lighthouse remains the next pass. No looped animation or new layout-driving animation besides the explicitly requested title tracking is introduced.
