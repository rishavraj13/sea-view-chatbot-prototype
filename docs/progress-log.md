# Progress log

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




