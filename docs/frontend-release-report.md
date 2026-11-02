# Frontend pass 5: release readiness

Historical Pass 5 record. The later single approved backend correction fixes the mock-negation execution defect reported below; see mock-media-policy-report.md and ADR 020. Other Pass 5 gaps and captures remain dated evidence.

Current result: typecheck/lint/build and 528 unit tests pass; the final full matrix passes 240/240 after generated-artifact isolation. No live provider call, deployment, installation, backend change or dependency-version change. Open release items: Lighthouse target scores unavailable under the no-install constraint; the frozen scripted mock ignores negation in its media-selection branch; 17 moderate tooling advisories intentionally remain. See the final result below; earlier sections preserve intermediate gates/failures chronologically.

Baseline: frontend at 81f9b27. Verification is local, production build, explicit MOCK mode. No live provider calls, deployment, installations, package-version changes or backend edits. The owner's pre-existing citation-report content is protected.

## Quality and measurement

Lighthouse is unavailable: command lookup found no CLI; no lighthouse package is in project node_modules or the existing npm _npx cache. Chrome and Playwright/CDP are installed, but their timings/axe checks do not constitute Lighthouse scores. The no-install constraint takes priority. The three mobile-preset runs per page, before and after, could not run. No audit/throttling alteration or fabricated score. Lighthouse target certification remains a release blocker and requires an already-installed Lighthouse tool in a later authorized run.

| Page | Stage | Runs | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|---|---|
| / | Before | 0 | unavailable | unavailable | unavailable | unavailable |
| / | After | 0 | unavailable | unavailable | unavailable | unavailable |
| /knowledge | Before | 0 | unavailable | unavailable | unavailable | unavailable |
| /knowledge | After | 0 | unavailable | unavailable | unavailable | unavailable |

Separate cold-load CDP evidence measures encodedDataLength on Network.loadingFinished with cache disabled, a fresh context and default project device settings (no custom throttling). At 390px / DPR 2.75: baseline homepage 593,987 bytes and Knowledge 550,966 bytes; after quality changes homepage 594,367 and Knowledge 543,851 bytes. These are observed single loads, not Lighthouse medians or statistically meaningful speed comparisons. Plan photos are lazy and below the 220dvh hero, so their savings occur on scroll, not initial load. All request paths/bytes and paint/navigation timings are in load-*.json; before/ preserves the baseline captures.

Image cause/fix: mobile plan sizes claimed 100vw (390px) instead of their actual 300px frame. They selected 1080px; corrected sizes select 828px for 825 physical pixels. At tablet the slot is 306px and at desktop the four slots are about 401/401/457/505px. Accurate sizes plus additional sub-640 optimizer buckets choose 320px at tablet, and 416/416/464/512px at desktop rather than 640px. The original hero remains priority/fill and 100vw. A 1440 candidate avoids the desktop jump from 1200 to 1920. Browser assertions bound every plan image to the first useful candidate within 10% of physical slot size; bounded optimizer rounding is documented rather than claiming exact arbitrary pixel widths. No source asset, image content, provider/runtime contract or dependency changed.

SEO: both routes have actual shared title/description, lang=en, default responsive viewport and explicit index/follow without a canonical. Home description is the existing on-page sentence “Tandem jump over Pattaya.” Knowledge description is its own subtitle. No invented Open Graph image. The Knowledge outline skipped h1→h3; each tabpanel now has a real, screen-reader-visible h2 describing its content. No visual redesign.

Keyboard evidence: keyboard-only Tab order covers the skip link, visible header links/action, intro links, all package ask buttons, FAQ summaries, footer links and launcher. Hero/plan are non-interactive and reachable in the heading outline, not artificial tab stops. Native details open/close through Enter. Knowledge tabs use arrows/End and trace is submitted by keyboard against the MOCK backend. Every visited control has >=2px solid warm ink/ember outline. Exactly one h1 and no skipped levels are checked on each page/active panel. axe label-content-name-mismatch and heading-order pass. Native dialog traps background controls and restores launcher focus on Escape; Chromium may briefly focus body at its browser-chrome Tab boundary. This is automated DOM/accessibility-tree verification, not a claim of a human NVDA/VoiceOver session. Reduced motion plus increased contrast preserve layout and remove hero pinning.

## Quality commit: real output

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


 Test Files  45 passed (45)
      Tests  526 passed (526)
   Start at  02:47:55
   Duration  4.16s (import 45%, setup 25%, environment 12%, transform 10%, tests 8%, worker 1%)

     Import  226 modules were evaluated 1807 times · 16.87s total, 45% of tracked time
             ~529ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

Build passes; full output: quality-build.txt. Focused production-build e2e: 24 passed (21.0s), quality-e2e-final.txt. No retries or timeout changes.

## Mock-answer readability commit

Assistant text over 600 characters is clamped to 8 lines with shared Show full answer/Show less labels, aria-expanded and aria-controls. The complete original MessagePrimitive text stays in the same DOM, unmodified; source/tool parts are outside the disclosure. Short answers have no toggle. Unit tests cover the boundary, escaped literal markup and text identity in both states. Browser tests against the actual local mock answer verify eight-line height, expanded height, complete text identity and visible source chips. Initial test typing used Playwright’s exact option in Testing Library, which does not accept that option; corrected to its exact string-name match, without suppressions.

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


 Test Files  46 passed (46)
      Tests  528 passed (528)
   Start at  02:51:57
   Duration  4.15s (import 43%, setup 23%, environment 15%, transform 9%, tests 9%, worker 1%)

     Import  230 modules were evaluated 1824 times · 16.58s total, 43% of tracked time
             ~519ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

Build passes (clamp-build.txt); focused full-viewport browser check: 3 passed (4.5s), clamp-e2e.txt.

## Cleanup and hygiene commit

Removed unused brandTag/credits CSS, the obsolete global reveal/echo styles (the actual effects live in their component modules), an unreferenced UnavailableResult alias, and obvious structural comments. No unused assistant-ui runtime piece was found: its imports own the active runtime and parts. The MediaPart export is required by the validation test and remains. Split the mixed content barrel into site/packages/plan/faq modules, with chat/Knowledge/navigation labels in their own existing modules; values and data parity are unchanged. Footer/FAQ/skip labels now use src/content. Split metadata tests from the keyboard walk. Added final viewport screenshot tests, without sleeps or live calls.

Throwaway tsc --noEmit --noUnusedLocals --noUnusedParameters exited 0 with no diagnostics before and after cleanup. A TypeScript-symbol/alias scan found 67 referenced frontend named exports and zero unused named declarations after cleanup; it covers source/tests, not object fields or reflection. The CSS-module selector/import usage search reports zero unused module classes. Four stylesheets remain above ~150 lines (Hero, Packages, ThePlan, ChatPanel): each owns one component's responsive/state rules, so splitting them would scatter one responsibility rather than fix mixed code. No frontend TS/TSX/content file remains above that threshold. Raw checks: unused-before/after.txt, exports-check.json, css-cleanup.json.

Added verify:offline (serial typecheck/lint/unit/build), .gitignore for generated examples and a complete optional legacy GOOGLE_MODEL entry. Package versions, ranges and lockfile are untouched. The formatter ignore list now explicitly protects every frozen directory, verbatim example captures and the owner's citation report before running the global formatter.

Read-only npm audit exit 1: 17 moderate, 0 high/critical (tooling dependency/advisory propagation including transitive minimatch). No audit fix, overrides, install or lock edit. Full machine-readable result: npm-audit.json. The verified dependency baseline intentionally remains unchanged.

Secret scan uses readEnv from the sole env reader, then compares configured provider-key bytes against every tracked file without printing values. Zero configured-key matches and zero key-like provider-prefix candidates; only .env.example is tracked. Prefix patterns require plausible key-length suffixes, so literal prefix documentation is not mistaken for a credential. Scan result: secret-scan.json. No keys, request bodies or private conversations are added.

Screenshot lossless optimization checked decoded mode/dimensions/pixel SHA256 before every write. 39 PNGs shrank from 10,766,879 to 10,300,937 bytes, saving 465,942 bytes, with zero pixel changes. Historical screenshots and referenced raw examples remain because prior reports/tests depend on them; no factual fixture was pruned. Generated future captures are ignored unless curated. Final release figures will be indexed separately from historical evidence. screenshot-compression.json records the check.

### Cleanup real output

#### npm run typecheck

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

#### npm run lint

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

#### npm run test

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  46 passed (46)
      Tests  528 passed (528)
   Start at  02:57:09
   Duration  4.84s (import 39%, setup 23%, environment 17%, transform 12%, tests 8%, worker 1%)

     Import  235 modules were evaluated 1887 times · 18.05s total, 39% of tracked time
             ~551ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

## Separate formatting commit

Ran the requested npm run format (Prettier --write .) with frozen paths, lockfile, raw examples and protected citation report explicitly ignored. Only formatting and this verification record are in the separate commit; frozen-path and protected-file diffs remain empty. Formatter transcript: format.txt.

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


 Test Files  46 passed (46)
      Tests  528 passed (528)
   Start at  03:01:34
   Duration  4.46s (import 41%, setup 23%, environment 15%, transform 12%, tests 9%, worker 1%)

     Import  235 modules were evaluated 1888 times · 16.78s total, 41% of tracked time
             ~511ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

## Supported image preload and capture-state follow-up

The installed Next image guide explicitly deprecates priority in Next 16 in favor of preload. Hero now uses preload (same intended high-priority image delivery); RevealImage's unused optional priority argument was removed, keeping plan images lazy. No dependency version or backend behavior changed.

Final screenshot capture now asserts the card's --p equals the pure passage function after scrolling, rather than assuming the queued animation-frame update has happened. It adds a state-based readiness assertion, not a sleep or runtime sanitizer. Initial visual interpretation suggested a missing sticky header; a geometry/hit-target probe and decoded PNG sampling disproved that: the header is at y=0 and the brand region contains the same 665 dark pixels at top and scrolled states. No header runtime/CSS workaround was made. The assertion is retained as stronger capture readiness, not presented as a header bug fix. Raw local probe: header-inspect.txt; nine focused screenshot cases passed (12.8s) before the preload replacement.

Actual follow-up offline gate:

```text
> assignment@0.1.0 verify:offline
> npm run typecheck && npm run lint && npm test && npm run build


> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0


> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  46 passed (46)
      Tests  528 passed (528)
   Start at  03:19:19
   Duration  4.49s (import 41%, setup 23%, environment 16%, transform 10%, tests 8%, worker 1%)

     Import  235 modules were evaluated 1889 times · 16.66s total, 41% of tracked time
             ~507ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation


> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 22ms

  Creating an optimized production build ...
✓ Compiled successfully in 280ms
  Running TypeScript ...
  Finished TypeScript in 2.1s ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 645ms
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

A complete final browser matrix is repeated after this compatible image-prop change. README/architecture/testing/verification now report known gaps rather than implying provider or Lighthouse certification.

## Frozen-backend issue found offline

An additional in-process trace diagnostic, explicitly MODEL_MODE=mock, question “Do not send a brochure”, returned HTTP 200/mode mock and a brochure result even though getMediaPolicy returns {state:none,tools:[]}. Raw public capture: examples/release-readiness/mock-negation.json; zero provider calls. This is not a frontend regression: the frozen runPipeline mock branch loops over selectMedia's noun matches without applying the computed policy, while the live model branch uses the policy's tool set/toolChoice. Mock diagnostic prose can also retain its refusal beside a media summary. The UI does not sanitize or change that text. No backend patch/workaround was authorized or applied. It needs a separately approved backend revision if negated mock requests must behave like the live policy. Passing the 127-row policy/provider-wire tests does not cover this separate explicit-mock execution branch.

## Final reviewer documentation and assumptions

README now describes the actual UI/runtime/Knowledge flow and both historical backend deployments, with demo URLs configured together in src/content/site.ts. Current architecture, verification and testing guides replace stale pending/hand-rolled-runtime claims. The audit has a historical resolution header. AI assistance distinguishes Codex/Antigravity work, owner-directed decisions and owner-attributed Claude review, without claiming a human reviewed every file/image. No private conversation, key or new fact is added.

All requested final 1440/390 viewport screenshots were opened and reviewed, plus the four extra tablet figures. They show home top/scrolled plan, labelled mock reply with disclosure/source chips, and Knowledge tools/context area. Pixel checks confirm the header is present; trace/plan figures show only the viewport portion, with the unchanged floating launcher. Final screenshot links are in design-notes.md. Existing earlier figures/captures are retained as historical evidence rather than overwritten with a new UI under old report names.

Assumptions and limits:

- The no-install constraint prevents Lighthouse execution. All before/after category scores and three-run medians remain unavailable; local CDP/axe are separate evidence. Performance/Accessibility/Best Practices targets cannot be certified here.
- CDP “initial bytes” are completed encoded lengths of responses observed by the load/fonts/hero-decode (or catalog-ready) checkpoint. Later lazy-image scroll transfer is excluded from that initial response set. Browser/device defaults are preserved; single-load variation/prefetch prevents treating this as a speed benchmark or Lighthouse median.
- Images use the first practical optimizer bucket near the physical slot, not arbitrary exact-width rendering. The corrected plan candidates round up within 10%; source photos and crop design remain unchanged.
- Long-answer disclosure applies to all assistant text over 600 characters, not only mock text. Eight lines are CSS presentation; full source text stays in the DOM. Prior history still caps each turn at 4000; no server memory is added.
- English lexical live media policy/guard limitations remain; the separate frozen mock-negation defect is explicitly reported. No live-provider reliability is inferred from offline tests.
- Accessible-tree/keyboard/axe and emulated reduced-motion/contrast checks do not claim a human screen-reader, forced-colours or real-phone certification.
- Existing demo URLs/settings are from backend-v1's last recorded deployment; no remote API/deployment/reachability check ran in this pass. They do not host this newly finished frontend. External source/media/font URLs are checked against captured/configured provenance and syntax, not fetched again.
- All facts remain the 2026-10-31 static capture. No website recapture, crawler, updated price inference or reconciliation of source contradictions occurred.
- Historical screenshots/raw examples remain because current reports/tests refer to them. Lossless PNG optimization preserves decoded pixels; generated examples are ignored and only selected evidence is committed. The protected citation report remains untouched.
- npm audit is a read-only registry operation, not a live model API request. Its 17 moderate findings stay under the approved dependency freeze; no fix/install/override runs. Secrets are scanned in memory through the sole validated reader, never printed.

No source change follows the final green offline/browser gate; remaining edits are documentation, curated captures and lossless encoding. A clean git archive ZIP is created from the final docs commit outside the repository, with its concrete filename, size, SHA256 and largest entries in the delivered companion manifest. Archives contain only committed source/evidence, not .env.local, .vercel, node_modules, .next or test outputs from ignored directories.

## Generated artifact lifecycle fix

The post-preload full run had 237 passes and three Windows UNKNOWN/open errors at page.screenshot writing existing curated PNGs (Desktop hero end, Desktop Knowledge error figure, Mobile hero quarter-point). They occurred before screenshot/contrast assertions could complete; no UI/assertion failure was hidden. Exact output: final-e2e-after-preload.txt. The precise process holding/mapping those files was not identified, so that detail remains unverified.

Root lifecycle correction: e2e tests now write screenshots/JSON into each test's fresh Playwright outputPath under ignored test-results through helpers/artifacts.ts. They no longer truncate committed, potentially viewer-open documents or mutate the fixtures/evidence under review. Pixel buffers/options remain identical; all assertions, audit rules, timeouts and retries are unchanged. No retry/sleep/error-swallowing or OS-file-lock workaround. Selected final captures are promoted once after the successful run into docs/screenshots/final-v5, with raw generations remaining in the test artifacts. This also prevents a failed/partial test run from silently overwriting historical committed evidence.

Actual post-fix offline gate:

```text
> assignment@0.1.0 verify:offline
> npm run typecheck && npm run lint && npm test && npm run build


> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0


> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  46 passed (46)
      Tests  528 passed (528)
   Start at  03:26:20
   Duration  4.38s (import 42%, setup 23%, environment 17%, tests 9%, transform 8%, worker 1%)

     Import  235 modules were evaluated 1888 times · 16.08s total, 42% of tracked time
             ~490ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation


> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 23ms

  Creating an optimized production build ...
✓ Compiled successfully in 275ms
  Running TypeScript ...
  Finished TypeScript in 1902ms ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 669ms
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

The final full browser result follows below. No application/backend code changed for this artifact correction.

## Final result after artifact isolation

```text
npm run verify:offline
> npm run typecheck && npm run lint && npm test && npm run build
Generating route types...
✓ Types generated successfully
> eslint . --max-warnings=0
Test Files  46 passed (46)
Tests       528 passed (528)
```

Full actual typecheck/lint/test/build output: artifact-offline.txt (pasted in the lifecycle section above). Final browser command/output:

```text
npx playwright test
240 passed (2.4m)
```

80 tests/project, Desktop/Tablet/Mobile; retries:0, unchanged 15s test/5s expect limits. Final stdout is final-e2e-artifacts.txt. All screenshots/options/contrast/audit assertions remain active. The earlier three UNKNOWN/open failures are retained, not disguised as product passes; the corrected test-artifact lifecycle passed the entire matrix without retry. No source code changed after this green gate.

Final selected artifact promotion: 12 PNG viewport figures, original 1,330,958 bytes → 1,307,834 bytes with decoded-pixel identity, plus 21 JSON artifacts. The manifest final-artifact-index.json records generated paths, published paths, sizes and pixel hashes. All 12 final figures were reviewed. Generated outputs remain in ignored test-results; committed final figures are under docs/screenshots/final-v5, separately from historical captures. No test rewrites committed fixtures/captures now.

### Observed 390px browser-load bytes, not Lighthouse

| Page       | Baseline | Final   | Interpretation                                   |
| ---------- | -------- | ------- | ------------------------------------------------ |
| /          | 593,987  | 594,182 | Single normal-device load; no median/speed claim |
| /knowledge | 550,966  | 543,060 | Single normal-device load; no median/speed claim |

The earlier before/after Lighthouse table remains unavailable for every category on both pages; no simulated score is filled from these byte observations. Image-slot/candidate and keyboard/contrast/axe checks independently pass.

Final freeze proof (final-freeze-proof.json):

```json
{
  "baselineEntries": 511,
  "added": 157,
  "changed": 0,
  "removed": 0,
  "frozenDiff": "",
  "lockAndProtectedDiffFromPassStart": ""
}
```

The 157 additions predate Pass 5; package/lock versions are unchanged. final-sdk.txt confirms ai7.0.158/gateway4.0.131, and final-package-additions.diff contains only frontend additions versus backend-v1 (including the new verify:offline script). Frozen diff command prints nothing. The owner's protected citation report is byte-identical to the pass start. Final relative Markdown link check, formatting check, key scan, tracked sizes and archive results accompany this record/delivery. Ports 3000/3100 are free after runs. No full release certification is claimed while the Lighthouse and known mock limitations remain.

### Final hygiene record

- npm run format:check: All matched files use Prettier code style! (final-format-check.txt).
- Current tracked/staged-file scan: zero configured-provider-key literal matches, zero plausible provider-prefix candidates, only .env.example tracked (final-secret-scan.json). Secret values are not included in the report.
- Relative documentation links: 70 checked, zero missing; external URL syntax valid, provenance checked without live reachability calls (final-doc-check.json). Additional evidence links below resolve to committed files.
- Ignore proof uses NUL-delimited git check-ignore input so Windows CRLF cannot become part of a pathname. Private envs/.vercel/test-results/playwright-report/.next/node_modules/generated examples are excluded; .env.example deliberately included (ignore-proof.json).
- Curated screenshot snapshot: 60 tracked PNGs, 11,608,771 bytes, including the 12 final figures. Historical reference/test evidence remains. The examples snapshot before adding the last check files was 223 files/5,588,830 bytes; the outside-repo final archive manifest is authoritative for final totals.

[Final offline command output](examples/release-readiness/artifact-offline.txt) · [Final full browser output](examples/release-readiness/final-e2e-artifacts.txt) · [Artifact index](examples/release-readiness/final-artifact-index.json) · [Freeze proof](examples/release-readiness/final-freeze-proof.json) · [Known mock defect capture](examples/release-readiness/mock-negation.json) · [Secret scan](examples/release-readiness/final-secret-scan.json).
