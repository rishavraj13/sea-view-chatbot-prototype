# Frontend Pass 3: Knowledge view report

Date: 2026-11-02. Branch: frontend. Baseline before this pass: 0fdadfd; backend baseline: backend-v1.

Read the attached request, AGENTS.md, docs/frontend-audit.md, api.md, actual real-knowledge/chat error captures, the frozen routes/schema/trace types, existing components/tests and the installed Next Server/Client Components guide. No live provider request, dependency installation or deployment. README and the protected citation report stay untouched.

## Contract and implementation

Catalog, trace and typed-error responses are validated before rendering or state writes. Catalog/trace types are inferred from Zod; the error schema/parser/copy and the page-source helper come from chat. A shared RequestError and extracted absolute-deadline useCountdown now serve chat and Knowledge. Removed handwritten Knowledge types, the legacy raw error helper and unused CSS. A request hook guards aborted/unmounted requests and replays the last submitted body on Retry.

Trace is six small presentational sections in the required order, followed by metadata/pipeline banner. Displays exact context and source text, actual scalar tool-call input/result fields, media provenance/availability and page citations; no invented Retrieval query or object JSON display. The form validates complete earlier turns, shared 4000-character limits and latest user ordering. ARIA tabs use roving tabindex and automatic arrows/Home/End activation. Real catalog titles are authoritative. Footer links target /#packages, /#plan and /#faq via Next Link. All Knowledge source/style files are 122 lines or shorter.

The fifth shared starter is restored to rain. The missing age-limit fact remains tested by typing it separately; no knowledge/source facts changed. No frontend runtime imports from src/server. ADR 019 explains the lack of an authoritative retrieval-query field and all limitations.

## Real local/mock contract evidence

knowledge-contract.test.ts parses existing actual sources/VIP/weather/ECO-photo/no-match captures and the typed route error examples. It calls the real sources/trace route functions in-process in MOCK mode (no network/provider), parses returned responses, and validates outgoing earlier-turn requests against the exported backend traceRequestSchema. The reviewed capture is [captures.json](examples/knowledge-view/captures.json): 18 sources and brochure, dependent VIP, retired-media and no-match scenarios. Results tests render actual captured values, not just DTO assertions. Behavior tests exercise real keyboard selection, malformed-response recovery/Retry, shared product error copy, unmount cancellation, complete-pair and length validation.

## Offline checks (implementation checkpoint)

GIT_PAGER=cat and MODEL_MODE=mock; all commands serial. Ports 3000/3100 checked free before/after each completed run. Output below normalises line endings and trailing whitespace only.

### npm run typecheck (exit 0)

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

### npm run lint (exit 0)

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

### npm run test (exit 0)

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  44 passed (44)
      Tests  512 passed (512)
   Start at  01:54:49
   Duration  3.95s (import 46%, setup 24%, environment 10%, transform 10%, tests 9%, worker 1%)

     Import  220 modules were evaluated 1774 times · 15.83s total, 46% of tracked time
             ~505ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 23ms

  Creating an optimized production build ...
✓ Compiled successfully in 284ms
  Running TypeScript ...
  Finished TypeScript in 1915ms ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 634ms
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

The 512 tests include all 434 frozen server cases. No skips, suppressions, weaker backend tests, timing hacks or output sanitizers. An initial typecheck caught Playwright's exact option accidentally used in RTL (removed; RTL's string name matcher is already exact). Next lint caught plain anchors for root-page section navigation; replaced with Next Link, retaining the required /# targets.

## Desktop checkpoint

```text
npx playwright test tests/e2e/knowledge.spec.ts tests/e2e/knowledge-errors.spec.ts tests/e2e/knowledge-evidence.spec.ts --project="Desktop Chrome" --reporter=list,json --max-failures=5
22 passed (13.0s)
Exit 0
```

The first run was 18 pass / 4 fail because I had given the context section and its pre block identical accessible names. Fixed that at the UI boundary with a distinct label for the exact context block, and strengthened the test to compare textContent exactly (including whitespace) with the actual local API response. No assertion was skipped or relaxed. All typed catalog/trace error cases, countdowns, malformed/empty response states, actual media/trace, keyboard navigation and axe on each tab/populated result pass at this checkpoint. Full matrix and viewport reviews follow below.
