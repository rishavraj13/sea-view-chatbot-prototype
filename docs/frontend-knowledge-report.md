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

## Final full browser matrix

Implementation commit: f9a51cc. Browser behavior/specification commit: 99cbcb2. No later source change.

```text
npx playwright test --project="Desktop Chrome" --project="Tablet Chrome" --project="Mobile Chrome" --reporter=list,json
Running 180 tests using 1 worker
180 passed (1.7m)
Exit 0
```

| Project | Passed | Failed | Skipped / flaky |
| --- | ---: | ---: | ---: |
| Desktop Chrome (1440×900) | 60 | 0 | 0 |
| Tablet Chrome (768×1024) | 60 | 0 | 0 |
| Mobile Chrome (390×844) | 60 | 0 | 0 |
| Total | 180 | 0 | 0 |

The six previously failing Knowledge cases are replaced by stronger structure/contract assertions and all pass. No retries, timeouts raised, exclusions, skipped cases or error hiding. Full outputs: [e2e.txt](examples/knowledge-view/e2e.txt), [e2e.json](examples/knowledge-view/e2e.json); focused Desktop output is also retained. Every original chat/foundation/axe test continues to pass, including the restored rain starter plus a separate typed age-limit refusal. Knowledge adds 22 checks per project, including all five public error scenarios on **each** catalog/trace endpoint, valid delayed/immediate Retry, identical retried trace body, malformed-success recovery, empty states, real media, complete earlier-turn history, no-match refusal, keyboard navigation, in-flight button state and axe on each tab/result/error state.

## Frozen backend and dependencies

```text
git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server
(no output)
```

The throwaway lock comparison checks each baseline package path's version and integrity hash (root tuple included). It is not committed as a script. Result:

```text
Lock entries added vs backend-v1: 157 (all pre-existing from Pass 1)
Existing version/integrity changes: 0
Entries removed: 0
Package.json and package-lock.json diff in Pass 3: empty
Frozen-path diff against backend-v1: empty
README and protected structured-citations report diff in Pass 3: empty
ai: 7.0.158
@ai-sdk/gateway: 4.0.131
@ai-sdk/react: 4.0.162
```

[npm ls output](examples/knowledge-view/npm-ls.txt), [baseline proof](examples/knowledge-view/baseline-proof.txt). No npm install or new dependency. The renamed/extracted shared countdown preserves the absolute-deadline behavior and its existing chat clock tests pass. The only UI caller of the old error helper was TraceTab; that helper and its obsolete error types are deleted. No runtime backend imports, API-contract changes, source facts or source/media assets changed.

## Viewport screenshots reviewed

All eight requested files were opened and visually inspected. Sizes were checked from PNG headers with Pillow: 1440×900 and 390×844. These are original viewport captures, **not** full-document images. Tablet equivalents are included as supplemental evidence.

| State | 1440 | 390 |
| --- | --- | --- |
| Sources | [Desktop](screenshots/knowledge-sources-1440.png) | [Mobile](screenshots/knowledge-sources-390.png) |
| Media | [Desktop](screenshots/knowledge-media-1440.png) | [Mobile](screenshots/knowledge-media-390.png) |
| Brochure trace | [Desktop](screenshots/knowledge-trace-1440.png) | [Mobile](screenshots/knowledge-trace-390.png) |
| Trace 429 countdown | [Desktop](screenshots/knowledge-rate-limit-1440.png) | [Mobile](screenshots/knowledge-rate-limit-390.png) |

The catalog shows real titles, dates and expandable source text; media shows the real PDF/video/retired entries without an Official label. Tabs fit at 390px and their visible counts remain excluded from accessible names. Trace capture is scrolled to its result/tools area; long results continue below the viewport in the normal document, with exact context separately scrollable. A brochure-only mock run has empty retrieval/context/citations and a real registry result; the UI explicitly says none were returned instead of inventing diagnostics. The warm product-error box displays Retry in 12s. The fixed chat launcher remains visible and can overlay the bottom edge of document content on mobile; its redesign was explicitly out of scope, and underlying content remains reachable by scrolling. Screenshot tests check every tab and populated result/error with axe; zero serious or critical violations. Unrelated chat/home screenshot and random-ID request artifacts regenerated by the full matrix were restored to their pre-task versions.

## Assumptions and honest limitations

- GET sources and POST trace response types follow docs/api.md and the inspected actual routes. Existing captured files wrap traces in response; the endpoint itself does not, and frontend schemas parse the unwrapped response. Capture-envelope handling exists only in tests.
- Displayed Question/earlier turns are the saved submitted input, clearly distinct from returned context; the API does not echo them. It returns no retrieval query, so none is inferred. Exact context/chunk/answer strings remain unchanged except normal HTML escaping by React; there is no output sanitizer.
- A collapsed earlier-turn disclosure does not discard populated values. Both earlier fields must be filled or both empty. Retry repeats the submitted request even if a draft changes later. Catalog and trace requests may run independently, and switching tabs preserves form/result state.
- Data is the existing static 2026-10-31 capture with 18 sections. This pass does not fetch website pages, update facts or reconcile package contradictions. No knowledge-data/head/crawler operation is added.
- Missing retrieval or registry-only media may have no sources/context; an explicit empty state is the truthful representation. Refusals and verbose MOCK diagnostic answer text are preserved exactly. No live-provider behavior is claimed from these mock checks.
- Page citations use the shared chat allow-list/deduplication helper. Catalog source URLs can be displayed as returned after HTTPS validation; found media links accept HTTPS/local paths. Retired/unavailable entries are not links.
- Status/provider/model/demo chips show only validated public response values; the pre-run note never assumes mock/live. Current provider enum stays google/groq/openrouter. Unexpected future/malformed required shapes become a recoverable UNKNOWN product error; additive fields are stripped by Zod.
- Tabs use automatic activation with ArrowLeft/Right/Home/End; only the selected tab is tabbable, and Tab enters its focusable panel. Native details/textareas/pre blocks provide their normal keyboard behavior. No library or focus/timing workaround is added.
- Both views share one validated error parser, product copy, RequestError component and absolute-deadline countdown hook. A new failed request mounts a fresh timer; no automated request retry or fallback.
- Scope: README, backend, source/media data, dependency versions, scroll-portal/floating-card redesign and deployment remain unchanged. No live API/provider call; all verification uses local/mock routes or intercepted public error fixtures. Both required ports are free at completion.
