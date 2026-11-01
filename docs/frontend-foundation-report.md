# Frontend foundation pass 1

Date: 2026-11-02. Branch: frontend. Backend baseline: backend-v1.

## A: Dependency baseline

Approach A; see ADR 017 for the registry version table and compatibility evidence. Read-only commands: npm view @assistant-ui/ai-sdk@0.0.16 dependencies peerDependencies; npm view @assistant-ui/react-ai-sdk@1.4.21 dependencies peerDependencies; npm view @ai-sdk/react versions --json; npm view @ai-sdk/react@4.0.155 through 4.0.163 dependencies.ai. Versions output includes every requested version. 4.0.162 maps to 7.0.158 and satisfies ^4.0.157.

Restored package-lock.json with git show backend-v1:package-lock.json (byte-preserving write), added the exact direct dependency, then npm install. No lock editing or overrides.

```text
changed 3 packages, and audited 559 packages in 22s
164 packages are looking for funding
17 moderate severity vulnerabilities
```

npm also reported pending esbuild/unrs-resolver install-script notices. No remediation changing versions was run.

```text
npm ls ai @ai-sdk/gateway @ai-sdk/react @ai-sdk/provider @ai-sdk/provider-utils
assignment@0.1.0 C:\assignment
@ai-sdk/react@4.0.162 -> ai@7.0.158 (deduped across adapter/provider consumers)
ai@7.0.158 -> @ai-sdk/gateway@4.0.131
@ai-sdk/provider@4.0.35
@ai-sdk/provider-utils@5.0.72
Lock proof: added=157 changed=0 removed=0
Changed: []
Removed: []
```

The throwaway Python comparison used each package path's `(version, integrity)` tuple from git show backend-v1:package-lock.json against the installed lockfile. Root dependency metadata is additive; all existing root ranges remain identical. git diff backend-v1 -- package.json contains additions only.

```text
Before unit tests: ports 3000 and 3100 free
> assignment@0.1.0 test
> vitest run
RUN v5.0.5 C:/assignment
Test Files 39 passed (39)
Tests 463 passed (463)
Duration 3.89s
After unit tests: ports 3000 and 3100 free
```

434 unchanged server cases, scaffold 1, frontend/content 28. No provider calls; MODEL_MODE=mock. Later sections record the completed UI verification.

## B: Lint

```text
Before lint: ports 3000 and 3100 free
> assignment@0.1.0 lint
> eslint . --max-warnings=0
After lint: ports 3000 and 3100 free
Exit 0
```

forbidOnly is unconditionally true; no process.env in Playwright config, no eslint-disable.

## C: Font verification

Removed :root font-variable overrides, retained local font files and next/font/local, and used generated variables with fallback stacks. Bundled upstream OFL notices and linked them in design-notes. No runtime packages or font binaries changed.

```text
> assignment@0.1.0 build
> next build
Next.js 16.4.3 (Turbopack)
Compiled successfully in 1485ms
Finished TypeScript in 3.8s
Generating static pages using 8 workers (7/7) in 743ms
Routes: /, /_not-found, /api/chat, /api/knowledge/sources, /api/knowledge/trace, /knowledge
Exit 0

npx playwright test tests/e2e/foundation.spec.ts --project="Desktop Chrome"
ok hero renders the bundled Familjen Grotesk platform font (387ms)
1 passed (2.2s)
```

CDP CSS.getPlatformFontsForNode requires every rendered font on the hero echo word to have familyName Familjen Grotesk and isCustomFont true. Both ports free before/after both runs. Only mock mode used.

## D: Step 5

Explicit width:min(60vw,100%) fixes the flex-column auto-width collapse at <=900px; aspect-ratio keeps the circle square.

```text
npm run build
Compiled successfully in 250ms
Finished TypeScript in 1706ms
Generating static pages (7/7) in 745ms
Exit 0
npx playwright test tests/e2e/foundation.spec.ts
6 passed (4.7s)
```

The first new circle selector measured an inner wrapper and produced 3 failures / 3 font passes. Corrected it to the actual circle ancestor; all 6 pass, with unchanged non-zero and <1px square assertions at 1440/768/390. Ports free before/after each run.

## E: Navigation

Shared header copy; project-viewport-aware nav assertions; links visible at 768, hidden at 767; pill visible at both. Compact spacing prevents boundary overflow. All four existing links retained.

```text
npm run build
Compiled successfully in 1344ms
Finished TypeScript in 2.8s
Generating static pages (7/7) in 726ms
Exit 0
npx playwright test --grep "header"
9 passed (6.9s)
```

Each project's additional boundary test checks header scrollWidth <= clientWidth and every visible link lies inside the viewport. Ports free before/after build and browser run.

## F: Shared content

No camera-choice statement exists in the captured knowledge. Removed the unsupported sentence; the remaining statement is the exact jump-facts sentence "Same aircraft, altitude and instructors in every package". A new parity case checks the entire line and italic-prefix consistency. Rendering test requires that heading and the absence of the old paragraph.

Header/package/statement copy lives in src/content; package accessible-name and prefill helpers are shared by component/test. The ask-button name contains the package name but no aria-hidden arrow. Five error strings and future trace labels are added to content only; the owner delegated the error wording choice. The existing error mapper/runtime and knowledge media/trace specs remain untouched.

```text
npm run test
> vitest run
RUN v5.0.5 C:/assignment
Test Files 39 passed (39)
Tests 464 passed (464)
Duration 3.83s
Exit 0
```

Ports 3000/3100 free before/after formatting and unit checks.

## G: Final offline commands

Each run was serial, with MODEL_MODE=mock and GIT_PAGER=cat. Ports 3000/3100 were checked free before and after each run. The following is captured stdout/stderr with line endings and trailing whitespace normalised, each exit 0.

### npm run typecheck

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

### npm run lint

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

### npm run test

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  39 passed (39)
      Tests  464 passed (464)
   Start at  00:40:56
   Duration  3.03s (setup 37%, import 31%, transform 16%, tests 8%, environment 6%, worker 1%)

    Isolate  39 workers spawned · ~284ms startup each (spawn + environment, per file)
             at least ~569ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 28ms

  Creating an optimized production build ...
✓ Compiled successfully in 272ms
  Running TypeScript ...
  Finished TypeScript in 1843ms ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 733ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
├ ƒ /api/knowledge/trace
└ ○ /knowledge


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

The unit total is 434 unchanged server cases + 1 scaffold + 29 frontend/content cases = 464. The extra case checks source/Statement parity.

### Browser matrix

Command: `npx playwright test --project="Desktop Chrome" --project="Tablet Chrome" --project="Mobile Chrome" --reporter=list,json`.

| Project | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Desktop Chrome (1440×900) | 26 | 6 | 0 |
| Tablet Chrome (768×1024) | 26 | 6 | 0 |
| Mobile Chrome (390×844) | 26 | 6 | 0 |
| Total | 78 | 18 | 0 |

```text
18 failed
78 passed (2.8m)
Exit 1
```

All 18 failures are the six explicitly deferred cases repeated across three projects:

- chat-errors: 429 with/without retryAfterSeconds, 504 TIMEOUT, 400 INVALID_INPUT. The transport error is not decoded by the current runtime, so the alert shows the generic model-failure copy instead of the expected code-specific text; countdown/input behavior remains deferred. The 502 case passes because its generic message happens to match. Error rendering and the error spec were not touched; the new content constants do not claim to fix it.
- knowledge media: the test expects an invented brochure title/Official badge rather than actual manifest content. The media/trace specs and their behavior remain untouched.
- knowledge trace: the first expected heading is "1. Model Context", while current code renders Question/Retrieval query/Chunks passed to the model. Deeper typing/context problems remain as recorded in the audit.

All foundation cases, the package accessible-name/prefill test, other chat happy paths, page sections, sources/header and all 9 scoped axe checks pass. There are no failures outside the allowed group; no skipped tests, expected-failure annotations, retries, suppressions or timeout relaxations. The first full matrix also had 78/18; screenshot review then identified the Step 5 image's shorter inner wrapper. Its height now fills the square and the test checks the image and frame bounds. The second full matrix above includes that fix. After final capture-only refinements, the three screenshot cases are rerun independently (see H); remaining cases are unchanged.

Full machine/text output: [e2e.txt](examples/frontend-foundation/e2e.txt), [e2e.json](examples/frontend-foundation/e2e.json). Individual command transcripts are alongside them.

### Frozen backend and dependency proof

A throwaway Python comparison (not committed as a script) checks each backend-v1 package path's `(version, integrity)` tuple, including the root entry, plus unchanged existing package.json ranges:

```text
Added entries: 157
Changed versions or integrity hashes: 0
Removed entries: 0
Changed existing package ranges: 0
ai: 7.0.158
@ai-sdk/gateway: 4.0.131
```

`git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server` prints nothing. `git diff backend-v1 -- package.json` contains added scripts/dependencies only. Protected docs/structured-citations-report.md, chat-errors.spec.ts and knowledge.spec.ts have empty diffs versus the checkpoint. No runtime imports from src/server were introduced. Pre-existing untracked frontend-audit.md is left untouched and unstaged.

## H: Revealed screenshots

The screenshot test scrolls each image into view, asserts complete/non-zero natural size, awaits HTMLImageElement.decode(), then asserts its isRevealed class and final clip-path. Before capture it uses the measured full document height at the same CSS width, and reasserts the reveal state. This is a full-document photograph, not a claim that the phone viewport has that height. The original project-size overflow/layout checks run first; separate foundation tests retain actual 1440/768/390 project dimensions.

Why use a full-document capture viewport: mobile Chromium captureBeyondViewport omitted the partially visible hero layer even after its loaded/decoded/visible/revealed state was verified (hero bounds x16,y822,width358,height238.65625; viewport 390×844). An element capture showed the real photo, while full-page pixels were uniformly the placeholder (211,207,200). Neither disabling screenshot animations nor removing will-change helped; both experiments were reverted. Full-document viewport capture renders the photo, with sample hero pixels (1,57,118), (2,72,144), (193,223,240). Production RevealImage CSS/state/animation remains unchanged. No sleeps, arbitrary delays, CSS injection or reveal-state bypass.

Saved screenshots: [1440](screenshots/home-1440.png), [390](screenshots/home-390.png), plus [768](screenshots/home-768.png). CSS-pixel capture makes output widths exactly the requested width rather than multiplying mobile output by its DPR. Capture output is in examples/frontend-foundation/capture.txt and capture.json.

```text
npx playwright test tests/e2e/page-sections.spec.ts --grep "12\." --reporter=list,json
3 passed (17.1s)
Exit 0
```

Both requested images were opened and visually inspected after the final run: all five photos are rendered, the Step 5 photo fills a circular crop, and the layout retains the warm palette and custom fonts. No production reveal-style change remains.

## Assumptions and boundaries

- Approach A is the first compatible option; Approach B was unnecessary. The adapter remains available for the next chat-runtime pass.
- The owner's delegated choice permits five frontend-safe error strings in content; they are intentionally not wired into the deferred renderer yet.
- Exact source-supported Statement wording replaces the unsupported camera-choice sentence; no package entitlement is inferred from taglines.
- Existing local font binaries are retained, with upstream OFL notices. Warm tokens, natural photography and the existing page design are retained.
- Full-document screenshot height is a capture choice; responsive behavior is checked at the original project viewport sizes.
- No live API/provider calls, deployments, backend changes, error/trace behavior changes or scroll-portal/floating-card redesign. Both required ports are free after verification.
