# Progress log

## 2026-11-02 — Frontend Pass 3 complete

Final delivery packages raw typecheck/lint/unit/build and full e2e outputs, actual local MOCK contract captures and all requested viewport screenshots in frontend-knowledge-report.md / examples/knowledge-view. **512 unit tests (44 files), all 434 server cases included; 180/180 browser tests, 60 per viewport; typecheck/lint/build exit 0.** Every requested Desktop/Mobile image was opened and reviewed. No code change after the green full matrix. Baseline proof: 0 changed versions/integrity and 0 removed entries versus backend-v1 (157 frontend additions remain from Pass 1); ai 7.0.158 / gateway 4.0.131 / react adapter 4.0.162. Frozen-path diff empty; README and protected citation report untouched. All runs serial/mock-only with both ports free before/after. No installation, live provider call or deployment. Final commit: feat: knowledge view reflects the real trace contract.

## 2026-11-02 — Frontend Pass 3: full browser regression coverage

Replaced stale Knowledge specs with manifest/contract-based coverage and added endpoint errors, request-state/keyboard/axe and viewport evidence specs. Manifest is read with fs and parsed, not imported as a Node JSON module. Browser helpers compare exact context textContent with the actual mock endpoint, while in-process unit route tests prove the frozen schema contract. The shared rain preset and typed age-limit chat refusal are both covered. Final full matrix: **180/180 passed** in 1.7m (**60 per Desktop/Tablet/Mobile**), zero skipped/flaky cases/retries. All prior six Knowledge failures are resolved at their roots; no assertions are disabled. The user/assistant-pair validation, empty chunks/media, actual tool-call objects and all five captured error scenarios pass on every viewport. All eight required viewport images have been opened and reviewed. Baseline proof/report packaging follows as a final documentation commit; no further code change is needed.

## 2026-11-02 — Frontend Pass 3: validated Knowledge view

Implemented schema-validated catalog/trace responses and shared strict chat error handling. Extracted the chat absolute-deadline countdown/RequestError for reuse and deleted the legacy error helper/types. TraceTab now delegates to a form, request hook and six small result sections. Shows exact returned context, object tool calls as readable fields, registry media, page-attributed citations and metadata; removes invented Retrieval query. Complete earlier-turn pair is validated (4000-char fields), button disables in flight and permanent live-call note is visible. Added roving ARIA tabs, true empty states, safe links and home footer section targets. Restored weather as the shared fifth starter; typed age-limit chat refusal remains covered separately. No source fact, backend or dependency changes.

Initial typecheck/lint/unit/build pass: 44 files / 507 tests (4.21s), all 434 frozen server cases retained. First Desktop browser check 18/22: four new selectors found duplicate accessible names on context section/pre. Fixed the naming at its root (distinct labelled exact-context block), strengthened exact textContent comparison without trimming; Desktop rerun **22/22 passed** (13.0s), including typed errors/retry/countdown, keyboard, real catalog, complete history and axe on every tab/result. RTL's unsupported exact option and Next's required Link for /# targets were corrected without suppressions. ADR 019 records contract decisions/limitations. Final verification and full matrix follow; no live provider call, server live mode or deployment. Ports checked free before/after every run.

## 2026-11-02 — Frontend Pass 2 complete: verified runtime and typed errors

Final full matrix: **117 passed / 6 failed** (39/2 per Desktop, Tablet and Mobile), zero skipped/flaky cases. Only the two untouched Knowledge media/trace specs fail per project. Every chat/error/countdown/reload/cancellation/starter/persistence/prefill/keyboard/populated-axe/screenshot check passes. A final metadata edge now preserves the last validated message mode when an UNKNOWN/network error supplies no new mode; unit assertion and real-MOCK reset regression passed across all projects (3/3, 5.2s). Typecheck/lint/build rerun exit 0; final unit run **42 files / 491 tests passed** (5.90s), including 434 unchanged server tests and ID/text/part/message boundary parity. Full output, intermediate failures/root causes, assumptions and contract evidence are in frontend-chat-runtime-report.md and examples/chat-runtime.

All eight requested 1440×900 / 390×844 viewport images were opened and visually reviewed: empty starters, both media with source chip, typed 429 countdown and mock strip. Tablet equivalents are also saved. No full-document chat captures. Retained the existing native dialog, media cards, warm palette and honest mock prose. The shared fifth starter now tests missing age information. Unrelated generated homepage/Knowledge screenshots were restored/removed.

Proof: frozen-path diff empty; package.json/lockfile unchanged in Pass 2; against backend-v1 157 entries added previously, **0 changed versions/integrity / 0 removed**. npm ls: ai 7.0.158, gateway 4.0.131. Protected citation report and Knowledge code/spec untouched. No live API/provider call, deployment, new dependency, output sanitizer, skipped/weakened test or timing workaround. GIT_PAGER=cat; serial mock-only runs; ports 3000/3100 free at completion. Final commit: feat: assistant-ui chat runtime with typed errors.

## 2026-11-02 — Frontend Pass 2: browser behavior regression coverage

Rewrote chat-errors.spec.ts around captured real route envelopes from OFFLINE MOCK exceptions; assertions use product constants, inline alerts, page.clock countdown and identical Retry request bodies. Added pending cancellation/late-response/slow-hint checks, all five real-MOCK starters, mock reset, client-route persistence, populated media/error axe and viewport screenshots/request captures. Strengthened keyboard tests with every starter/header/composer focus step in both directions, blocked background DOM focus and Escape/focus return. Native Chromium can move from the last input to browser chrome; the initial new test incorrectly assumed immediate wrapping to the first button. No custom focus trap or timing workaround was added; the corrected meaningful sequence passes all three projects (3/3, 5.1s). Initial full matrix was 114 passed / 9 failed: three keyboard-expectation failures now corrected and the six deferred Knowledge cases. Final full matrix remains to run.

## 2026-11-02 — Frontend Pass 2: runtime implementation checks

After adding runtime-composer whitespace/Enter/Shift+Enter/IME/full-thread behavior tests and invalid media rendering, all checks pass: typecheck exit 0, lint (--max-warnings=0) exit 0, **42 files / 491 unit tests passed** (5.28s), build exit 0 (compile 319ms; TypeScript 2.6s; static pages 7/7 in 1027ms). Output is captured under examples/chat-runtime. Backend runtime/body/protocol unchanged; no dependency changes. Browser lifecycle/error/viewport evidence is the next logical step.

## 2026-11-02 — Frontend Pass 2: runtime and contract foundation

First committed frontend-audit.md unchanged (9fb2a17). Read current assistant-ui docs and installed type/source contracts; ADR 018 selects useChatRuntime + DefaultChatTransport and documents the messages-only projection. Replaced manual ChatPanel orchestration with one root AssistantRuntimeProvider and runtime primitives; removed timeout-prefill, legacy tool branches and raw error rendering. Added Zod tool/error/source checks, product-copy errors, absolute-deadline retry countdown, metadata-derived mode, bounded history/composer and native dialog lifecycle. Added missing sr-only utility. Five starters now include a missing-fact question as requested; shared Knowledge preset labels inherit that choice without a trace behavior change.

Offline proof: real runtime first/follow-up bodies pass the frozen backend schema with actual source/step/both-tool history. Limits are checked against the exported Zod schema because backend numeric constants do not exist. Typecheck and lint exited 0; 42 unit files / 490 tests passed (4.29s), including all unchanged server cases; build exited 0. Initial Desktop chat run: 17 passed / 2 failed. New over-broad citation expectation on brochure-only requests corrected to the requested factual starter; populated axe found 4.48:1 error-copy contrast, fixed with the ink token. Browser verification continues; no passing final matrix claimed yet. No backend/dependency edit, live API call or deployment. Found and stopped a verified repo Next dev server on 3000 before further runs; no requests sent to it. Every completed test/build run checked ports free before/after.

## 2026-11-02 — Frontend foundation G–H: final verification and revealed captures

Final offline checks: typecheck exit 0; eslint --max-warnings=0 exit 0; **39 files / 464 unit tests passed** (434 server + scaffold 1 + frontend/content 29); production build exit 0. Full Desktop/Tablet/Mobile matrix: **26 passed / 6 failed per project, 78 passed / 18 failed total**, zero skipped/flaky cases. Failures are exclusively the four deferred chat-error cases and two deferred knowledge media/trace cases per project. The specs and their deferred code were not modified. All foundation, remaining chat, knowledge header/sources and scoped axe checks pass. Exact output and root causes are in frontend-foundation-report.md and examples/frontend-foundation.

Screenshot review caught the Step 5 inner photo's shorter intrinsic height; it now fills the square, with frame/image bounds both asserted. The mobile beyond-viewport full-page capture also omitted the hero despite confirmed decoded/revealed state. Individual element capture confirmed the photo exists. Neither removing will-change nor disabling screenshot animations helped, and both experiments were reverted. Final capture uses the measured document height at the same width after real scrolling/reveal/clip/decode assertions, with reveal state checked again. No production reveal/animation code change or arbitrary delay. Final screenshot-only rerun: **3/3 passed** (17.1s). Visually inspected home-1440.png and home-390.png; all photos appear. home-768.png is also refreshed. Screenshots use CSS-pixel widths.

Approach **A** remains selected for the next runtime pass. Repeated lock proof: **157 added / 0 changed versions or integrity hashes / 0 removed**, all original package ranges unchanged, ai 7.0.158 and gateway 4.0.131. Frozen-path diff is empty, as are the protected citation report and deferred spec diffs. All commands serial, GIT_PAGER=cat, servers mock-only on 3100 with reuseExistingServer:false; ports 3000/3100 checked free before/after all runs and at completion. No live API call or deployment. Pre-existing untracked frontend-audit.md remains untouched and unstaged.

## 2026-11-02 — Frontend foundation F: shared copy and factual statement

The camera-choice sentence is absent from data/knowledge; removed it and its unused style. Statement now uses the exact jump-facts line, covered by parity and rendered-markup assertions. Shared package labels/prefill helpers drive component and chat e2e accessible-name expectations (ECO name, no hidden arrow). Header and touched package/statement copy are in src/content. Added five frontend-safe error messages (owner delegated the wording choice) and trace labels as constants only; error mapping/runtime and TraceTab behavior/specs are deliberately untouched. Full unit suite **464/464**, 39 files, exit 0 (3.83s). Ports free before/after formatting and tests. No facts, backend files or API contracts changed.

## 2026-11-02 — Frontend foundation E: inclusive nav breakpoint

Header links now show at >=768px and hide at <=767px; compact spacing/type at 768–1023px keeps the four existing links and action pill within the header. Shared header copy moved to src/content/navigation.ts. Nav spec reads the project's viewport; added explicit 768/767 boundary and overflow assertions. Build exited 0; header e2e **9/9 passed** on Desktop/Tablet/Mobile, including the untouched knowledge header test. Ports free before/after both runs.

## 2026-11-02 — Frontend foundation D: responsive Step 5

Replaced the max-width-only circle rule with explicit width:min(60vw,100%) at narrow widths, retaining aspect-ratio:1/1. Build exited 0; foundation e2e **6/6 passed** across 1440, 768 and 390px (circle plus custom-font assertions). The first new test measured the inner image wrapper, not the circle, and failed 3 cases; corrected its selector to the actual step5Circle ancestor without changing the square assertion. Ports free before/after each run.

## 2026-11-02 — Frontend foundation C: font ownership and licences

Removed handwritten --font-* overrides and added fallback stacks at font-family use sites. Kept next/font/local and all three existing binaries. Bundled each upstream OFL notice under public/fonts/licenses and corrected design-notes to name only the implemented families. Production build exited 0. Desktop Chromium CDP e2e passed (1/1): the hero's rendered font is Familjen Grotesk, isCustomFont:true. Ports 3000/3100 free before/after build and e2e. No chat runtime/error logic changed.

## 2026-11-02 — Frontend foundation B: strict lint configuration

Replaced the Playwright process.env.CI read with unconditional forbidOnly:true. No lint suppression. npm run lint (eslint . --max-warnings=0) exited 0. Ports 3000/3100 free before and after. Existing timeout, mock webServer and reuseExistingServer:false settings unchanged.

## 2026-11-02 — Frontend foundation A: dependency baseline

Approach **A** succeeded. Registry inspection found @ai-sdk/react 4.0.162 requires exactly ai 7.0.158 and satisfies the adapter's ^4.0.157 range. Restored the backend-v1 lockfile, declared that exact direct dependency and ran ordinary npm install. No overrides, forced/legacy resolution or manual lock edits. ADR 017 records the decision for the next runtime pass.

Proof: 157 lock entries added; **0 existing versions/integrity hashes changed; 0 removed**. All existing package.json ranges unchanged; additions only versus backend-v1. npm ls: ai 7.0.158, gateway 4.0.131, react 4.0.162, provider 4.0.35, provider-utils 5.0.72. Full offline unit suite: **39 files / 463 tests passed**, including the unchanged 434 server cases. Ports 3000/3100 free before/after install and unit tests. npm reported 17 moderate advisories and pending install-script notices; no audit fix or dependency upgrade was attempted. No live call, deployment or backend edit.

## Real website knowledge and property-based guard — 2026-10-31

The former fictional knowledge, facts and response examples are retired. Original Git history is preserved; historical working-tree files now clearly identify supersession. Current data contains fifteen faithful logical sections from the two specified pages, isDemo:false and capture date 2026-10-31. Taglines and identical inclusion lists are not reconciled.

One video HEAD returned 200 video/mp4; video body was not read or stored. The page poster was observed. A demo-labelled PDF was generated from the package facts and rendered/visually checked with a baht-capable font. Retired asset remains unavailable.

Citation/numeric property guard replaces exact-line matching. Threshold remains 1. Retrieval quality and all required check output, plus raw live answers, are pasted in real-knowledge-report.md before commit. No deployment, request-schema, provider or stream changes beyond the approved additive source/provenance fields.

## Completed verification

Retrieval quality: 35/35, including seven no-matches. Google VIP price 200/accepted/1 call/1552ms; weather 200/accepted/1 call/2187ms. Exactly two live calls, no retries. All 108 tests pass; typecheck, lint and build exited 0. Full source list, quality table, raw answers and guard limits are in [real-knowledge-report.md](real-knowledge-report.md). Required real output:

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

> assignment@0.1.0 test
> vitest run

 RUN  v5.0.5 C:/assignment

 Test Files  14 passed (14)
      Tests  108 passed (108)
   Start at  13:50:34
   Duration  987ms (import 76%, transform 11%, tests 6%, setup 5%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 28ms

  Creating an optimized production build ...
✓ Compiled successfully in 1125ms
  Running TypeScript ...
  Finished TypeScript in 2.0s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 645ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```

# Captured-text cleanup — 2026-10-31

Completed the narrowly approved icon cleanup: audited 15 JSON sections, cleaned six, fixed the static authoring extractor, regenerated and rendered the demo PDF, and refreshed affected offline examples. Added corpus artifact and actual-PDF package/price regression tests. All facts and API behavior remain unchanged. No new live calls and no deployment. Previous VIP/rain raw answers are reproduced verbatim with guard/count/latency in [the cleanup report](captured-text-cleanup-report.md), which also pastes the actual typecheck, lint, test (110/110) and build output. Retrieval quality remains 35/35. The only added dependency is test-only pdf2json; no runtime dependency changes.

# Structured citations and concise answer style — 2026-10-31

Read the current API contract first: citations existed only as answer URL text. Implemented the approved additive source-url stream parts, trace.citations and validated history support; visible citation URLs are removed after the unchanged guard accepts the original model answer. Prompt now requests 1–3 short relevant sentences without unrequested activities. Fetched both authorized page HTML documents (HTTP 200); all five used anchors exist as element ids, so no source URL changed. Saved ids/hashes and added repeatable offline checks. Actual SDK transport/reader, shared-trace parity, citation-format and one-call paraphrase/unsupported-figure replay tests pass. Groq key absent: both requested live scenarios skipped; zero live calls to any provider, no deployment. Typecheck, lint, 128 tests across 17 files, and production build pass; real output and captured examples are in [the structured citations report](structured-citations-report.md). No package, provider, fact or media-result shape changes.

# Live Groq provider selection — 2026-10-31

Checked current official Groq rate-limit/tool/model/AI SDK docs and Vercel environment/protection docs. Selected Groq qwen/qwen3.8-27b with reasoning none via MODEL_ID and explicit live process configuration; .env.example reflects the candidate while remaining mock by default. Ran exactly four Groq calls, one per scenario with no retries: rain (474 ms), VIP (403 ms), both media tools (613 ms), dependent follow-up (454 ms). All HTTP 200; first three intended tasks passed, but the follow-up called sendBrochure with an unknown id and did not answer. Recorded dangling Cite: and duplicate DEMO presentation without fixes or fallback. Offline retrieval confirmed VIP first for the follow-up. Typecheck, lint, 128 tests across 17 files and build pass; real output, raw answers and separate citations/tools are in [the provider report](live-provider-report.md). Added a production environment/protection plan and README switch instructions. No backend/runtime/API/package changes, Google/OpenRouter calls or deployment. Preserved the pre-existing local citation-report edit outside the commit.

## Media gating and answer presentation — 2026-10-31

Removed attached citation labels/wrappers, replayed the exact live VIP answer, removed DEMO title prefixes, and made summaries derive one demo-material label from isDemo with customer-safe file errors and URLs only in payloads. Added a pure latest-turn media lexicon, omitted tools entirely for negatives, removed model id parameters with strict empty schemas, and preserved explicit customer-id selection. Added ADR 013 and npm verify:live with a shared forty-call ledger, spacing, 429 stop, explicit reruns and unattempted-case resume. Qwen passed 15/18 initially and 17/18 after reruns; retired media still included a guard refusal. Llama returned model failures in every scenario. Forty calls total, no 429, no fallback or subsequent backend workaround. Live evidence, per-attempt raw text/citations/tools/latency and real offline output are in media-gating-report.md. The pre-existing citation report remains untouched. No guard, retrieval, stream, provider enum, request or result-shape changes and no deployment.

## History serialization, media refusal and punctuation — 2026-10-31

Diagnosed cause (a): application history conversion serialized non-text SDK parts; saved harness history itself matched the SDK reader. Replaced it with a public text-only projection and tested real source/tool-bearing UI message round trips against captured provider HTTP contents. Failed media prose now drops without adding refusal; no-media failures still refuse. Fixed summaries ignore titles and unavailable demo flags; exact rain/inclusion/cancel punctuation replays pass. Added ADR 014 and strengthened live assertions, ECO acceptance and mixed/media-history scenarios. Qwen initial 19/21, follow-up recovered on its one rerun, mixed still failed on citation omission. Twenty-three calls, no Llama or fallback. Actual raw/provider-bound messages, separate citations, all visible texts, counts/timings and final offline outputs are in history-revision-report.md. The pre-existing citation report remains untouched; no guard rules, prompt, retrieval, schemas, stream, provider enum or deployment change.

## Server-side source attribution — 2026-10-31

Replaced the model-URL grounding dependency with pure normalized content-word attribution: overlap coefficient >=0.5, at least two distinct matched words, at most two supporting chunks ranked and deduplicated by URL. Selected from a broad pre-live evidence matrix (final 28 pairs: 17 positive, 11 negative). The numeric checker remains unchanged; foreign URLs still reject and optional model URLs are stripped. Updated the direct-customer prompt, source-part/trace population, old raw-answer replays, regression table and ADR 015 superseding citation clauses of 011/012. No mixed-request execution change; README documents its failure modes and semantic limits. Planned 24 initial Qwen turns by reusing rain as approved; Groq 429 stopped call 16. Ten passes, five model/tool omissions and one rate limit; eight unrun, no reruns permitted after the stop. Actual raw answers, attributed sources, visible text, token matrix, call timing and final offline output are in source-attribution-report.md. Protected citation report untouched; no deployment or other provider calls.

## 2026-10-31 — Required media choice and prompt cleanup (offline only)

Compared e587c72..505b90a: no tool description, same-step instruction or gate changes; implicit auto allowed the five saved media promises without execution. Added the approved none/optional/required policy, matching-only tools, general missing-info prompt, verbatim four-way cancellation split and capture/anchor safeguards. Required does not guarantee both tools or mixed factual prose. All request/stream/tool shapes and numerical thresholds stay unchanged. Retrieval is 38/38; attribution is 28/28 with identical classifications/coefficient outcomes. Approximate prompt average 722.3 → 672.6 tokens across 24 cases. Actual Groq HTTP is fully mocked; zero live calls and no deployment. See required-media-report.md for diagnosis, official support links, every token row, assumptions and final command output. Pre-existing structured-citations-report.md edit remains untouched.

## 2026-10-31 — Request-form detection for required media (offline only)

Replaced free-standing cue words with bounded English request forms and clause-local question-opener precedence. Mixed factual questions followed by explicit modal requests remain required. Noun-to-tool mapping, one provider call, strict inputs, explicit-id handling, summaries, guard and HTTP shapes are unchanged. Retained all 42 policy phrases, updated eight expected states and added 53 rows (95 total). Added an exact recorded SDK brochure-result history projection test; production history code is unchanged. Updated ADR 016, README limitations, API/architecture wording and offline testing instructions. No live provider calls or deployment; protected citation-report edit remains untouched. Full real command output is in request-form-report.md.

Final offline verification: typecheck and lint passed; all 362 tests across 28 files passed; production build passed. Exact command output is pasted in request-form-report.md.

## 2026-10-31 — Direct-desire media requests, Part A (offline)

Expanded bounded desire and file-action forms, excluded information-seeking desires, suppressed tools on explicit negation and retained optional bare words. Preserved all 95 policy rows and added 32; existing factual negatives remain non-required. Updated ADR 016, testing instructions and README limitations. No live calls in Part A; deployment is gated on a passing typecheck/lint/test/build and the requested commit. Full command output is in desire-form-report.md. Protected citation-report edit remains untouched.

## 2026-10-31 — Production deployment and quota-blocked smoke (Part B)

Part A committed as d5caf53 after typecheck, lint, 394 tests and build passed. Deployed a clean git archive of that commit to https://sea-view-chatbot-prototype.vercel.app; the protected uncommitted report and .env.local were excluded. Production uses live Groq qwen/qwen3.8-27b, reasoning none, with a secret uploaded through CLI stdin. Authentication/password protection disabled; unauthenticated public access verified. Sources (18), PDF signature, one external-video HEAD, typed invalid chat/trace errors, live metadata and actual Node 26 / maxDuration 30/30/10 all passed without model calls.

Added remote verify:live base-URL mode with an independent eight-request ledger, >=10-second spacing, no retries and stop-on-429. The first brochure request returned safe RATE_LIMIT in 695 ms; stopped after one request. The response contained no retry-after/x-ratelimit-* headers, so upstream bucket details remain unavailable through the unchanged API. Seven scenarios were unattempted, no reruns; live required-tool behavior remains unverified and backend-v1 is not tagged. Offline harness regressions additionally prove public checks and MOCK 429 stop/header behavior. README/testing document the shared free quota, manual retry option, no mock fallback, and the pending Knowledge view test button's one-call quota use. Full deployment/smoke evidence and final offline command output are in production-deployment-report.md. Protected citation-report edit remains untouched.

Final Part B offline checks passed: typecheck, lint, all 403 tests in 30 files, and production build. Exact output is pasted in production-deployment-report.md. No further live calls followed the first 429.

## 2026-10-31 — Rate-limit diagnostics (no deployment)

Used exactly one direct Groq qwen/qwen3.8-27b request with max_tokens:1. HTTP 200: limit/remaining requests 1000/999, tokens 8000/7986; reset headers 1m26.4s and 105ms. No retry-after or error body; no second live request. Official docs identify these as RPD/TPM; implied reported bucket usage is 1 request and 14 tokens. The historical production 429 cause remains unverified because that earlier upstream error/headers were not captured.

Kept status mapping unchanged: only SDK APICallError status429 yields RATE_LIMIT, independent of provider labels. Added one allowlisted structured server log per provider-bound error, with route rethrow deduplication and no keys/bodies/conversation. Added shared Zod error schema and optional bounded error.retryAfterSeconds on RATE_LIMIT in both chat and trace. Present/absent/garbage/clamped/HTTP-date, privacy, mapping and one-log tests pass offline; full final commands are in rate-limit-diagnostics-report.md. No provider, retry, prompt, retrieval, media or stream changes; no deployment. Protected citation-report edit remains untouched.

Final verification: typecheck and lint passed; 435 tests across 31 files passed; production build passed. Exact command output is pasted in rate-limit-diagnostics-report.md. One direct provider request total; no deployment.

## 2026-10-31 — backend-v1 dual deployment and verification

Redeployed clean 6710c21 to https://sea-view-chatbot-prototype.vercel.app with the existing environment unchanged. No source/scripts/tests/config code changed. Anonymous homepage, public sources (18), PDF signature, video HEAD, typed invalid chat/trace and actual Node 26 / maxDuration 30/30/10 passed. Immediately ran the unchanged remote verify:live harness in a fresh task directory: all eight requested scenarios passed, eight requests, >=10-second spacing (measured minimum 10.101s), zero retries and no 429. Required choice succeeded for brochure, video and both. Exact answers/citations/tools/latencies are in backend-v1-release-report.md and examples/backend-v1/live; old stopped ledgers remain unchanged.

Created sea-view-chatbot-prototype-mock from the identical archive, explicit MODEL_MODE=mock, no provider key and protection off: https://sea-view-chatbot-prototype-mock.vercel.app. Anonymous checks, exact public data/files, typed invalid input and SDK-consumed [MOCK]/mode:mock response with both tools passed; zero model calls. This separately selected scripted fallback is independent of Groq quota; no automatic fallback exists between URLs. README/testing record both roles and the shared live quota/one-call Knowledge test behavior. Provider-error log retrieval was not applicable because no 429 occurred. Protected citation-report edit remains byte-identical. Docs commit and backend-v1 tag follow passing final checks; tag points to docs with the same backend source as the deployed commit.

Final release verification passed: typecheck, lint, all 435 tests in 31 files and production build. The docs-only release commit is tagged backend-v1; application source remains identical to deployed 6710c21. Real outputs are pasted in backend-v1-release-report.md.

## 2026-11-01 — Frontend setup: typography, photography, tokens, content parity

1. **Font licensing and selection**:
   - Audited Fontshare's ITF Free Font License (`https://www.fontshare.com/licenses/itf-free-font-license`) for Clash Display and Satoshi. The license prohibits public redistribution: *"You cannot redistribute, sell, rent, lease, or give away the original font files (.otf, .ttf, .woff, etc.) publicly or to third parties. Do not upload ITF font files to other repositories, share them openly online, or hand the physical files to clients."*
   - Consequently, Clash Display and Satoshi binaries were deleted from `public/fonts/`.
   - Selected **Familjen Grotesk** (display, 700) and **Instrument Sans** (body, 400/500/700), paired with **Instrument Serif italic**. All three are published under the open-source **SIL Open Font License (OFL) 1.1**, permitting public repository storage and bundling. Self-hosted locally in `public/fonts/` via `next/font/local` to guarantee 100% offline and deterministic builds in standard sandbox environments.
2. **Photography and image processing**:
   - Downloaded the five authorized site photographs into `public/images/`.
   - Used `sharp` to resize and compress `step-2.jpg` from 2.3 MB down to 346 KB (under the 400 KB requirement) at 1365px wide (under 1600px).
   - Confirmed all five images are strictly under 1600px wide and under 400 KB: `home-hero-skydivers.webp` (1536×1024, 109 KB), `step-2.jpg` (1365×2048, 346 KB), `step-3.webp` (1600×1066, 155 KB), `step-4.webp` (1600×1600, 179 KB), and `step-5.jpg` (1085×1018, 196 KB).
   - Documented exact dimensions, source URLs, and descriptive alt text in `docs/design-notes.md` and `src/content/index.ts`.
3. **Dependency verification**:
   - Verified `npm view @assistant-ui/react peerDependencies` (`react: '^18 || ^19'`) and `npm view @assistant-ui/react-ai-sdk peerDependencies` (`ai: '^7.0.101'`). The installed `ai` (`7.0.158`) and React (`19.3.1`) versions satisfy both peer requirements.
   - Installed authorized scope-fenced packages: `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@playwright/test`, and `@axe-core/playwright`.
   - Verified zero version changes to frozen dependencies (`ai`, `@ai-sdk/*`, `zod`, `next`, `react`, `react-dom`).
4. **Content single source of truth**:
   - Created typed `src/content/index.ts` capturing packages (ECO, DELUXE, VIP), prices, taglines, inclusions, step descriptions, FAQs, location metadata, and starter chips.
   - Added `tests/content/parity.test.ts` asserting exact parity with `data/knowledge` and `data/media/manifest.json`. All 4 parity tests pass.

## 2026-11-01 — Remaining page sections (Milestone 2)

1. **Page "/" section implementation**:
   - `Statement.tsx`: Rendered 1px × 64px hairline, statement heading with serif italic accent, and subline without paraphrase.
   - `Packages.tsx`: 3-column hairline grid for ECO, DELUXE, and VIP packages with real `<button>` controls triggering `openChat("Tell me about the {name} package.")`. Included verbatim 4-item inclusion list and greedyadventures.com link.
   - `ThePlan.tsx`: 12-column asymmetric grid (step 4 wide 8 cols, step 3 pill 4 cols 500px radius 9999px, step 5 circle aspect-square, step 2 wide 7 cols) with Step 1 caption line, using verbatim plan descriptions and `RevealImage`.
   - `Faq.tsx`: Native `<details>` accordion rendering the 3 page FAQs plus the cancellation weather answer verbatim from `data/knowledge/`.
   - `WhereAndWho.tsx`: Location lines and "Operated by Dropzone Thailand" text-only without invented copy.
   - `Footer.tsx`: Dark footer (`--ink`) with 4 columns (prototype notice, navigation, demos, credits) and 5% white top border.
2. **State coordination**:
   - Created `ChatContext.tsx` providing `ChatProvider` and `useChatDialog()` so package cards can prefill the chat composer and open the modal dialog without sending.
3. **Verification**:
   - Added `tests/components/sections.test.tsx` verifying all rendered sections against constants and knowledge data.
   - Typecheck, lint, and all 447 tests pass. Next.js production build exits 0.

## 2026-11-01 — Chat interface and test suite (Milestone 3)

1. **Transport & Runtime**:
   - Integrated AI SDK `DefaultChatTransport({ api: '/api/chat' })` preserving the exact `{ messages: UIMessage[] }` payload and streaming protocol. Runtime is hoisted above page content in `RootLayout` via `ChatProvider` to maintain conversation state across dialog toggles and route changes.
2. **Component architecture**:
   - `ChatLauncher.tsx`: Fixed bottom-right pill ("Ask about your jump", no icon) triggering `openChat()`.
   - `ChatPanel.tsx`: Native `<dialog>` modal invoked via `.showModal()` for browser-native focus trap, `Esc` handling, and focus return. Responsive layout: 440px right-aligned sheet on desktop, full-screen on mobile.
   - Header with "Ask about your jump", "Answers come from greedyadventures.com", "New conversation" reset, and close button.
   - Persistent mock strip ("Mock mode: scripted answers, not a live model") whenever response metadata indicates `mode === 'mock'`.
   - `ChatEmptyState.tsx`: 5 exact starter question chips as real `<button>` elements that send immediately on click.
   - `ChatMessage.tsx`: User messages styled as ink pill-bubbles; assistant messages rendered as clean prose without `dangerouslySetInnerHTML`.
   - `ToolResultBrochure.tsx`: PDF card with typographic "PDF" mark, title, "Demo material" badge when `isDemo`, "Open" and "Download" buttons.
   - `ToolResultVideo.tsx`: 16:9 native `<video controls playsInline preload="none">` card; drops poster if `posterUrl` fails; on playback failure, renders "Watch on greedyadventures.com" external link.
   - `ToolResultUnavailable.tsx`: Muted inline note ("That file isn't available right now.") preventing broken card display.
   - Sources: Deduplicated by PAGE ("Sea View Skydiving page" or "Cancellations page"), rendered as outlined pill chips below the answer without parsing text.
   - Loading: "Looking through the website…" with pulse skeleton; transitions to "Taking longer than usual" after 8 seconds.
   - Errors & Countdown: Typed error handling (`RATE_LIMIT`, `TIMEOUT`, `MODEL_FAILURE`, `INVALID_INPUT`). On `RATE_LIMIT` with `retryAfterSeconds`, Retry button displays an active seconds countdown and disables until 0; without `retryAfterSeconds`, Retry is immediate.
   - `ChatComposer.tsx`: Textarea with 4000 character limit, Enter to send, Shift+Enter for newline, disabled Send while loading or empty.
   - ARIA live region (`aria-live="polite"`) announcing new assistant replies and errors.
3. **Verification**:
   - Added unit and RTL tests: `chat-sources.test.ts` (page deduplication and labelling), `chat-errors.test.ts` (typed error parsing and messages from real 429 fixtures), `chat-tool-cards.test.tsx` (brochure, video, unavailable renderers), `chat-composer.test.tsx` (keyboard handlers, maxLength, disabled states).
   - All 458 tests pass across 38 files. Typecheck, lint, and production build exit 0.

## 2026-11-01 — Knowledge view route and tests (Milestone 4)

1. **Route "/knowledge" implementation**:
   - Created `src/app/knowledge/page.tsx` with `KnowledgeHeader`, accessible `KnowledgeTabs`, and dark `Footer`.
   - `SourcesTab.tsx`: Queries `GET /api/knowledge/sources`, renders title, external link, capture date (`2026-10-31`), demo material badges, and full usable text inside native `<details>`.
   - `MediaTab.tsx`: Renders PDF and video assets with types, availability chips ("Available" vs "Unavailable"), and demo material tags.
   - `TraceTab.tsx`: Labelled form targeting `POST /api/knowledge/trace` with 5 starter preset buttons, optional earlier turns inputs (separate user and assistant text fields, not raw JSON), and submit button: "Run test (calls the model when the server runs in live mode)".
   - Structured trace output displaying in exact required sequence:
     1. Question
     2. Retrieval query
     3. Chunks passed to model (with similarity score, external URL link, full text in `<details>`)
     4. Tools selected
     5. Media resolved
     6. Answer text and citations
     7. Chips: mode (`mock`/`live`), provider, modelId
     8. Exact required line: "Output from the real pipeline"
   - Implemented loading, empty, and typed-error states matching chat error handling.
2. **Verification**:
   - Added `tests/components/knowledge-view.test.tsx` verifying Sources, Media, and Trace rendering against real captured JSON fixtures (`docs/examples/real-knowledge/sources.json` and `trace-vip.json`).
   - All 461 tests pass across 39 files. Production build generates static `/` and `/knowledge` routes cleanly.






## 2026-11-02 — Frontend pass 4, commit 1: scroll portal hero

Replaced the separate hero/photo band with a reversible sticky portal, pure pin/passage progress and a CSS-property hook, one-line echo h1, warm photo grade, reduced-motion static state, source-backed intro CTA/facts, and footer launcher clearance. No chat/knowledge/backend/dependency changes. Typecheck and zero-warning lint pass; 526 unit tests across 45 files pass; production build passes. Full e2e first run: 197 pass/1 launcher actionability timeout; unchanged focused chat-errors recheck 6/6 pass. No test weakened and no delay added. Final full matrix follows commit 2. Reviewed requested 390/1440 hero screenshots; five-point contrast minima >=3.40 at both widths. Desktop photo blue-minus-red mean 67.76→32.64. Full outputs, sampling caveats, observations and assumptions: frontend-scroll-report.md and examples/scroll-hero/. All checks explicitly mock, ports 3000/3100 free before/after; no live calls or deployment.


## 2026-11-02 — Frontend pass 4, commit 2: floating plan cards

Following hero commit 64ad380, replaced the old showcase with five ordered source-backed cards: text-only Step 1; four 4:3, once-revealed photos; shared warm shadow token; desktop 12-column stagger/24px overlap, tablet two-column/32px offsets and mobile single-column/16px gaps. Added position-driven drift measured from stationary list items, separate decorative hover lift, reduced-motion removal and no tab stops. Visual review found desktop overlap could obscure the caption edge; an 8px internal text gutter fixes the layout and a browser assertion checks clearance. Captions wrap naturally rather than truncating facts. All nine requested screenshots personally reviewed.

Final serial mock checks: typecheck pass, zero-warning lint pass, 526/526 unit tests (45 files), production build pass, full Desktop/Tablet/Mobile e2e 204/204 (1.9m), retries 0. An earlier matrix had a host file-open error writing an existing chat screenshot (203/204); its unmodified recheck passed. The earlier hero matrix launcher stall and host I/O failure remain reported, without timing hacks, forced clicks or timeout changes. Full real output and assumptions: frontend-scroll-report.md, examples/floating-plan/. Final observed CLS 0 / .001024 / .006721 (mobile/tablet/desktop); one 57 / 59 / 60ms startup-inclusive long task respectively, not a Lighthouse score.

Frozen-path diff versus backend-v1 is empty. All 511 baseline lock entries retain version/integrity: 0 changed, 0 removed; 157 earlier frontend additions. No package or lockfile change in this pass; ai7.0.158/gateway4.0.131 retained. README, protected citation report, chat and Knowledge code unchanged; unrelated regenerated evidence restored. Ports 3000/3100 free after runs. No install, live API or deployment. Delivery is exactly two commits: feat: scroll portal hero, then feat: floating plan cards.


## 2026-11-02 — Frontend pass 5: quality fixes

Measured baseline local cold loads, corrected plan photo sizes and optimizer candidate gaps, added canonical-free SEO metadata from existing page copy and repaired Knowledge h1→h3 jumps with tabpanel h2 headings. Added keyboard-only focus/details/dialog/tab/trace, reduced-motion/increased-contrast, heading/name and image-transfer checks. Typecheck/lint pass; all 526 unit tests pass; build passes; focused production-build mock e2e 24/24. Real output and before/after bytes: frontend-release-report.md and examples/release-readiness/. Lighthouse absent from installed tools/cache; no packages may be installed, so all requested Lighthouse medians/targets are explicitly unverified, a release gap. No live calls, backend/dependency edits or deployment; ports 3000/3100 free around runs.


## 2026-11-02 — Frontend pass 5: mock answer disclosure

Added presentation-only >600-character/8-line assistant answer disclosure, with shared labels and aria-expanded/controls. Full original Parts text remains unchanged in the DOM, history and runtime; sources/tools stay outside. Typecheck/lint pass, 528 unit tests (46 files) pass, build passes, three viewport e2e cases pass. Raw output pasted in frontend-release-report.md and stored under examples/release-readiness/clamp-*.txt. No live calls, dependency/backend edits or deployment; ports free around each run.


## 2026-11-02 — Frontend pass 5: cleanup and hygiene

Removed proven unused CSS/type alias and obvious comments; split mixed content into section modules without changing facts; centralized footer/FAQ/skip labels; separated metadata tests and added final screenshot coverage. Retained active assistant-ui code and the renderer export used by tests. Typecheck/lint pass; 528 unit tests pass. Throwaway noUnusedLocals/noUnusedParameters before/after has zero diagnostics; final CSS and symbol scans report no unused classes/named declarations. Longer CSS modules remain cohesive. Added verify:offline, safe formatter exclusions, generated-example ignore and the optional legacy env template field. Exact output: frontend-release-report.md.

Read-only npm audit: 17 moderate, zero high/critical; no dependency remediation under the baseline freeze. Key/prefix scan finds no tracked credential; only .env.example tracked. Lossless recompression saves 465,942 screenshot bytes with decoded-pixel hashes identical. Referenced historical evidence is retained. No backend/dependency-version/live/deploy change; ports free around commands.
