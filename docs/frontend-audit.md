# Frontend audit

Date: 2026-11-01 (Asia/Calcutta). Read-only takeover audit of branch frontend, HEAD 5aa5f957f1929cad71dd83e66bcee7e8845ac066, matching frontend-antigravity-checkpoint. Backend baseline tag backend-v1 resolves to a4626e62fb831c2884e130c8522adec9bc85ea08.

Only docs/frontend-audit.md is written. No commit, source/test/config/dependency edits, package installation, deployment, live provider request or production API request. Requested builds/tests generated ignored cache/test artifacts. Tracked screenshots were inspected but not overwritten. docs/progress-log.md remains read-only under the task's explicit file restriction.

## Executive findings

- Working: TypeScript compilation, production build, all 463 unit tests, static homepage sections, real-data parity tests, successful mock chat transport/media/source rendering, /knowledge header/tabs/source browser, and the three scoped Desktop axe checks.
- Broken: lint; HTTP error extraction/countdown; required assistant-ui integration; trace tool-call typing/display and claimed retrieval query; font-variable ownership; responsive Step 5 circle; several e2e expectations.
- Frozen application paths have an empty diff against backend-v1, but the lockfile changes two existing resolved versions: ai 7.0.158 -> 7.0.159 and @ai-sdk/gateway 4.0.131 -> 4.0.132. This is a pre-existing freeze violation despite unchanged package.json ranges.
- Desktop e2e baseline: 6 passed, 5 failed, 18 unrun at max-failures=5. Supplemental /knowledge: 2 passed, 2 failed. Supplemental responsive nav: mobile passed, tablet failed at exactly 768px.
- step-2.jpg is already 1365×2048, 354,645 bytes (346.3 KiB), not 2.3 MB. No resize is required at this checkpoint.
- The historical leading "0" was not reproduced and its cause cannot be established from available evidence. The separate "1 error was not a part of any test" was reproduced and traced to Playwright's max-failures reporter event.

## Safety and execution method

GIT_PAGER=cat and MODEL_MODE=mock were set for baseline commands. playwright.config.ts already has test timeout 15000ms, expect timeout 5000ms, retries=0, workers=1, port 3100, webServer MODEL_MODE=mock, and reuseExistingServer=false. No configuration change was necessary.

Ports 3000 and 3100 were checked before and after every test/build/server run. Both were free at the end of every completed run. No dev server was started on 3000. Browser runs used newly started mock-only production servers on 3100. One long-running command/server at a time.

The unchanged e2e tests write screenshots to relative docs/screenshots paths. They were run from ignored .next/frontend-audit-run with --config C:/assignment/playwright.config.ts and an ignored --output directory. These flags relocate artifacts only; test code, selectors, assertions, projects, timeouts and failure cap were unchanged. The original sandbox attempt stalled after server startup with an unreachable localhost listener and no tests started; it was interrupted, ports checked free, and the same baseline rerun outside the sandbox. The completed run is the reported baseline. No test failure was retried to claim a pass.

Supplemental read-only browser inspections blocked all non-local requests, used a new mock server and closed the owned browser/server in finally. The POSTs observed were local mock chat/trace only. The synthetic error fixtures with mode:live in e2e are intercepted HTTP responses, not live model calls.

## Source and test map

| Area | Implementation / boundary |
| --- | --- |
| / | src/app/page.tsx: Header, Hero, PhotoBand, Statement, Packages, ThePlan, Faq, WhereAndWho, Footer |
| /knowledge | src/app/knowledge/page.tsx: KnowledgeHeader, KnowledgeTabs, Footer |
| Root layout | src/app/layout.tsx: local-font declarations, global CSS, skip link, ChatProvider around server-rendered children, persistent ChatContainer |
| Shared state/hooks | src/components/ChatContext.tsx: custom useChatDialog; other state/effects co-located in ChatPanel, TraceTab, KnowledgeTabs, RevealImage, ToolResultVideo and ChatComposer. No separate hooks directory |
| Chat | src/components/chat/: custom conversation/controller, native dialog/composer, message projection, source helper, media cards, handwritten types and error parser |
| Knowledge | src/components/knowledge/: source/media tabs, fetch state, trace form/results, handwritten response types |
| Copy/data | src/content/index.ts: 214-line manually maintained constants/types, partial CHAT_UI/KNOWLEDGE_UI labels. Components still contain extensive copy |
| Styles/tokens | src/app/globals.css plus 23 component CSS modules; tokens in :root, not a separate token package/directory |
| Frozen backend | src/server, src/app/api, data, public/demo, scripts, tests/server; requested diff is empty |
| Unit/content | tests/components (7 files), tests/content/parity.test.ts (6 parity cases), tests/scaffold.test.tsx; Vitest node default, jsdom annotation for composer, shared setup mocks fonts/keys |
| Frozen tests | 30 tests/server files unchanged. Historical backend-v1 total 435 included one scaffold case; the frontend changes that scaffold's expected markup. The frozen server files account for 434 cases; 434 + scaffold 1 + frontend/content 28 = current 463 |
| E2E | tests/e2e: accessibility (3), chat-errors (5), chat (5), knowledge (4), page-sections (12): 29 per project |
| Browser matrix | Desktop Chrome 1440×900; Tablet Chrome 768×1024; Mobile Chrome uses Pixel 5 with viewport overridden to 390×844 and DPR 2.75 |
| Dependencies added | Runtime: @assistant-ui/react ^0.15.32, @assistant-ui/react-ai-sdk ^1.4.21. Dev: @axe-core/playwright ^4.14.0, @playwright/test ^1.64.1, @testing-library/jest-dom ^7.0.1, @testing-library/react ^16.3.3, @testing-library/user-event ^14.6.8, jsdom ^30.1.3. start/test:e2e scripts also added |

No frontend runtime import from src/server was found. The matches under src/app are only the frozen API route imports. Server Components remain the default for layout/pages/static sections. Packages is client-rendered for its ask buttons; RevealImage and chat/knowledge interaction boundaries are clients. Passing server-rendered children through ChatProvider does not itself turn every page component into a Client Component.

The lockfile adds 157 package entries, removes none, and changes the two existing resolved versions named above. Installed node_modules/ai/package.json confirms 7.0.159. package.json's caret range alone conceals the drift. Do not reinstall/update packages or restore frozen resolutions as part of this read-only audit.

## Current state by area

| Area | Status | Evidence / practical result |
| --- | --- | --- |
| Homepage sections | Working | All requested structural sections exist and SSR/build succeeds; package/inclusion/plan/FAQ/location parity cases pass |
| Factual copy discipline | Broken | Constants duplicate source facts rather than derive from JSON; Statement.tsx hard-codes "Choose no cameras, instructor video and photos..." outside src/content and implies a camera entitlement/exclusion not stated by the captured package inclusions |
| Chat happy path | Working | Local mock both-media request returns 200, x-model-mode:mock, PDF/video cards, source chip and mock strip |
| assistant-ui runtime | Missing | Packages installed but no frontend import/use of either assistant-ui package; custom React state is the runtime |
| Typed errors/retry | Broken | Installed transport error has responseBody/statusCode, not response.json; API errors fall into generic MODEL_FAILURE. Countdown never receives the typed 429 delay |
| Source/media rendering | Working, bounded | Structured source-url chips and correct final tool results render; source helper casts/substring URL matching and unsupported legacy branches remain risks |
| /knowledge header/tabs/sources | Working | Targeted test finds h1 Knowledge Base, Sources/Media/Test a question and source catalog; trace action Run trace is visible after selecting its tab |
| /knowledge media | Working UI / Broken test | UI uses actual manifest titles/availability/demo flags; test expects invented titles, wrong capitalization and an absent Official badge |
| /knowledge trace | Broken | toolCalls typed string[] instead of objects, shows [object Object]; retrieval query repeats submitted question even for history; response.context is never rendered |
| Automated unit/content checks | Working, incomplete coverage | 463/463 pass, but trace "render" test merely inspects JSON and does not render TraceTab |
| Lint | Broken | playwright.config.ts:10 reads process.env.CI against the repository restriction |
| Desktop e2e | Broken | Four typed-error tests plus package accessible-name test fail; cap prevents 18 other tests from running |
| Responsive header test | Broken boundary | CSS hides links at <=768px; test treats >=768 as desktop. 390px test passes |
| Accessibility | Working scoped checks / Missing coverage | Three empty/default Desktop axe tests and dialog keyboard focus/return pass; sr-only CSS, ARIA tab arrow/roving focus and populated/error/media states need work |
| Palette | Working explicit CSS | Warm paper/ink/neutral shadows/ember; no explicit blue, teal, purple or cool-tinted gray declarations found |
| Font rendering | Broken | next/font registers displayFont/bodyFont/serifFont; :root overwrites their variables with original family names. CDP reports actual hero Arial-BoldMT, isCustomFont:false |
| Font provenance/licence packaging | Missing complete record | All three binaries have copyright and OFL URL metadata; no standalone OFL/license text is bundled. Full redistribution compliance cannot be established from the repo alone |
| Image assets | Working | All five decoded successfully and are <=1600px wide; step-2 is already optimized |
| Responsive Step 5 photo | Broken | .step5Circle is 0×0 at both 768px and 390px; width is auto with max-width:60vw and auto margins inside a flex column |
| Documentation accuracy | Broken / stale | architecture and ai-assistance still describe frontend/knowledge as pending; progress claims font use/exact request shape not borne out by runtime evidence |

## Chat wiring and backend contract comparison

### Actual runtime and body

ChatProvider is a custom modal/prefill context, not AssistantRuntimeProvider. ChatPanel owns UIMessage[], draft/loading/error/countdown state and calls DefaultChatTransport({api:'/api/chat'}) directly, then iterates readUIMessageStream. ChatMessage manually renders parts. Neither assistant-ui package has an active integration or registered tool renderer in src.

The observed first request was:

    {"id":"active-chat","messages":[{"id":"u-1793550604754","role":"user","parts":[{"type":"text","text":"Send me the brochure and a video."}]}],"trigger":"submit-message"}

messageId is supplied as undefined to the SDK and omitted in JSON. Thus this is not literally only {messages}, contrary to progress-log wording. It is nevertheless accepted by the frozen backend: chatRequestSchema is a non-strict Zod object which strips unknown top-level id/trigger fields. The supported messages array is sent intact, and assistant history includes the actual SDK source/tool/step parts rather than serializing them as text.

Backend constraints remain 1–30 messages, final role user, 1–8 parts, text 1–4000 after trim, user/assistant roles, bounded ids, source-url and completed tool-sendBrochure/tool-showVideo parts. Composer limits individual text to 4000 and trim/nonempty, but the UI does not enforce message-count/part limits over a long conversation. Retry appends the last user text again instead of reusing the failed turn.

### Rendering

- Text is escaped React prose, not dangerouslySetInnerHTML. User/assistant layout is custom HTML/CSS.
- Completed brochure/video results render cards; brochure displays PDF/title, Demo material when isDemo, Open and Download. Video uses native controls/playsInline/preload=none; poster probe failure drops the poster; playback error supplies an external link. Unavailable results collapse to one generic note, without asset-specific detail.
- ChatMessage consumes the correct tool-sendBrochure/tool-showVideo final message parts, but also accepts legacy tool-output-available/tool-invocation branches not defined by this backend's final UIMessage contract. Outputs are asserted/cast, not Zod-validated.
- source-url parts are consumed structurally, deduplicated to the two page-level chips, retaining the first source URL/anchor. No citation URL parsing from answer text is used. This aligns with the source-part protocol. URL substring matching can mislabel an unrelated host/path and needs a real allowed-origin/path check.
- Mode mock is read from response metadata and latches isMockMode true; mock strip and backend [MOCK] text render. New conversation does not clear that mode flag. A later live response would not reset it. Error response metadata is not used.
- Error parsing uses unchecked casts. getErrorMessage returns error.message before considering code; its fallbacks are hard-coded in error-mapping.ts, not src/content. The requested product-owned per-code content mapping is missing.
- AI SDK 7.0.159 HttpChatTransport calls createUIApiCallError, producing APICallError with statusCode/responseBody and no response property. ChatPanel catches no matching response, leaves MODEL_FAILURE, and renders "The model is temporarily unavailable." plus enabled Retry for mocked 429, 504 and 400 alike. Browser failure snapshots confirm this. The 502 test passes accidentally because its expected string equals that fallback.
- A countdown effect/render branch exists, but real transport failures never populate it. parseErrorResponse checks only typeof number, not integer/range; malformed delays would be accepted. Backend docs constrain retryAfterSeconds to optional integer 1..3600 on RATE_LIMIT. No automatic retry occurs; manual Retry currently duplicates the failed user message.
- Root-layout mounting preserves ChatPanel state across dialog toggles/client route transitions, but reset does not abort an in-flight request. That request can repopulate a cleared conversation. The 0ms prefill timeout is an unnecessary scheduling workaround to revisit through correct draft/event ownership; the 8-second slow-message timer and real retry countdown are purposeful UX timers.

Verdict: successful request/SSE/source/tool consumption is compatible with docs/api.md. The assistant-ui runtime requirement, typed error/retry contract consumption, external-input validation and long-history/lifecycle behavior are not correctly implemented. No backend change is needed to fix the confirmed frontend contract errors.

## /knowledge: actual page and trace mismatch

The header is Knowledge Base, with Sources, Media and Test a question. All labels above and Run trace are present in KNOWLEDGE_UI; current checkpoint uses them. Counts are aria-hidden, so exact tab accessible names exclude "(18)"/"(3)". This checkpoint repaired earlier label mismatches.

KnowledgeTabs fetches sources via /api/knowledge/sources but assigns resp.json() directly to a typed state without Zod. TraceTab similarly trusts raw success JSON. Its optional earlier-turn request correctly sends question plus three text UI messages (earlier user, assistant, latest user) when both earlier fields are supplied. Earlier fields have no 4000-character maxLength; incomplete history is silently omitted.

The response's actual toolCalls is an array of {name,input,result}. knowledge/types.ts instead declares string[]. TraceTab's join(', ') consequently prints [object Object], observed with a real local mock brochure trace. It should display validated names/inputs/results without changing the frozen contract.

The actual six headings are:

1. Question
2. Retrieval query
3. Chunks passed to the model (N)
4. Tools selected
5. Media resolved
6. Answer text and citations

"Retrieval query" is not a returned API field. Repeating lastSubmittedQuestion is inaccurate when the shared backend query incorporates earlier user history. response.context is available but not displayed as exact context. A frontend must not invent an authoritative query field or import backend runtime code; show what the contract actually provides, or seek a separately approved contract extension if exact query output is required.

The test expects Model Context / Retrieved Chunks / Attributed Sources / Tool Calls / Generated Media / Final Answer and a nonexistent section-answer section. Its headings/selectors are stale. It must not be made green by weakening assertions or altering the backend.

Other gaps: no tab arrow/Home/End keyboard handler or roving tabIndex; all tab buttons stay tabbable. The trace retry button ignores retryAfterSeconds. The form offers no live-call quota warning at submission. Footer's #packages/#plan/#faq links resolve to nonexistent sections on /knowledge rather than navigating home.

## Design, colours, screenshots and assets

### Screenshot review

Opened every existing docs/screenshots PNG with the image viewer:

| Screenshot | Actual pixels | Observation |
| --- | --- | --- |
| home-1440.png | 1440×5786 | Warm paper, black display headline with four echo layers, thin rules/pills, three package columns, white inclusion block, asymmetric rectangle/pill/circle grid, dark four-column footer |
| home-768.png | 768×7081 | Single-column package/plan layout and two-column footer; header links hidden. Step 5 photo circle absent |
| home-390.png | 1073×19437 | Mobile single-column layout, compact headline, stacked facts/cards/footer; Step 1 tag/description cramped. Step 5 circle absent |
| chat-1440.png | 1440×900 | Right 440px warm sheet, blurred/dim background, outlined starter pills, bottom composer; label visibly consumes composer space |
| chat-768.png | 768×1024 | Same right-hand sheet at tablet width, rest of page visible behind |
| chat-390.png | 1073×2321 | Full-width mobile dialog, stacked/wrapped title actions, large starter targets; visible label and constrained textarea |

The 1073px mobile PNG width is expected at configured 390 CSS px × Pixel 5 DPR 2.75 (rounded); 844 CSS px × 2.75 = 2321 image px. It is not proof of overflow or stale screenshots. Current document width equals scrollWidth at 1440, 768, 767 and 390. My initial interpretation of this pixel width as stale/overflow was corrected before this report.

The warm neutral Swiss layout and ember direction are recognisable. The intended custom typography is not actually applied. All home screenshots show gray photo placeholders because reveal states are not triggered/waited through a full-page capture; local inspection confirms the hero image is loaded and reveals after scrolling. This is a capture/reveal-state issue, not missing image files. Separately, the Step 5 responsive circle genuinely collapses: 494.656px square at 1440 versus 0×0 at 768/390. The rule sets max-width and auto margins without an explicit width, disabling the stretched flex-item width. Fix geometry, not timers/image downloads.

### Palette and tokens

Scanned all frontend CSS, including focus rings, shadows and inline style sites. Explicit colours are paper #F3F1ED, white #FFFFFF, ink #141311, muted #5C5852, ember #B4411B, echo grays #BDB9B1/#C9C5BD/#D3CFC8/#DCD9D2 and warm RGB alpha variants. No explicit blue/teal/purple or cool-gray RGB/HSL/OKLCH values were found. Focus-visible uses ink/ember, and shadows use rgba(20,19,17,...).

Some white/footer/alpha values bypass shared tokens. Browser-native video controls/selection states are not fully themed; no claim is made about every OS/browser-native colour. Natural colours in the approved photography are distinct from the application palette. Keep future token work warm; do not introduce a blue generic component theme.

### Fonts

| File | Bytes | Metadata |
| --- | ---: | --- |
| public/fonts/FamiljenGrotesk-Bold.woff2 | 11,820 | Familjen Grotesk Bold, copyright 2021 project authors, OFL URL |
| public/fonts/InstrumentSans-Regular.woff2 | 30,092 | Instrument Sans, variable wght 400..700, copyright 2022 project authors, OFL URL |
| public/fonts/InstrumentSerif-Italic.woff2 | 22,128 | Instrument Serif Italic, copyright 2022 project authors, OFL URL |

Only these three binaries exist under public/fonts; no Clash/Satoshi files. Embedded name records contain copyright and https://scripts.sil.org/OFL, consistent with docs/design-notes.md's choice. No standalone OFL/license text was found, and nameID 13 is absent: the repository has incomplete licence packaging/provenance evidence. Obtain/bundle authoritative upstream notices/terms in a future authorized change; this offline audit does not establish complete redistribution compliance.

The font-loading code itself is valid and offline-capable. Generated CSS registers family names displayFont/bodyFont/serifFont and sets the same --font-* custom properties which globals.css then overrides with literal "Familjen Grotesk"/"Instrument Sans"/"Instrument Serif". Browser computed variables use those unmatched original names. All six registered local/fallback faces are unloaded, and CDP reports Arial-BoldMT for the hero, isCustomFont:false. Preserve next/font's generated variables; put fallback tokens elsewhere rather than replacing fonts or fetching new ones.

### Image inventory

| File | Actual dimensions | Bytes |
| --- | --- | ---: |
| public/images/home-hero-skydivers.webp | 1536×1024 | 111,544 |
| public/images/step-2.jpg | 1365×2048 | 354,645 |
| public/images/step-3.webp | 1600×1066 | 159,086 |
| public/images/step-4.webp | 1600×1600 | 183,040 |
| public/images/step-5.jpg | 1085×1018 | 200,856 |

All widths satisfy <=1600. step-2 is already about 346.3 KiB and agrees with design-notes/progress; the 2.3 MB report is outdated for 5aa5f95. No image was resized in this audit. Image provenance URLs/alt data are documented locally; no new remote download or video playback was performed.

## Known failures: confirmed or disproved

| Reported issue | Audit result / root cause |
| --- | --- |
| a. Error tests expect raw backend text instead of product content | Confirmed requirement/test problem, plus real transport bug. No product error messages exist in src/content. getErrorMessage prefers backend text, and ChatPanel cannot read the actual SDK error shape, so alert actually renders generic MODEL_FAILURE. Both layers must be fixed; merely changing expected strings is insufficient |
| b. Missing Knowledge Base/Sources/Media/Run trace | Disproved at checkpoint. Header/tabs test and sources test pass, trace submits. Actual failures are invented media titles/badges and stale trace labels/selectors. Trace contract/render defects also exist independently |
| c. Tests assume desktop at smaller widths | Partly disproved: current test is already viewport-aware. Exact boundary bug remains: CSS <=768 hidden, TS test >=768 visible. Targeted tablet fails, mobile passes |
| d. Leading 0 / "not part of any test" | Separate issues. No leading 0 reproduced in screenshots/current mock DOM/commands; current code and all six frontend commits contain no numeric .length && JSX pattern. Original output is needed to attribute it. The reporter suffix is reproduced and explained by max-failures, not an unhandled app promise |

Playwright's installed runner emits reporter.onError({message:"Testing stopped early after ... maximum allowed failures."}) when its failure cap is reached (node_modules/playwright/lib/runner/index.js around 6221). Its reporter later counts that unassociated fatal event and prints "1 error was not a part of any test" (around 1222). It is not an additional sixth failing test, nor evidence that the app rendered an error counter. The targeted runs below the cap do not show it.

## Code quality and rewrite candidates

1. Rewrite ChatPanel's orchestration, not the whole visual system. It mixes modal lifecycle, draft/prefill, transport, history, streaming, error extraction, countdown, loading, announcements and rendering. Extract a small session hook/controller plus focused status/error rendering, using the installed assistant-ui runtime/integration if that requirement remains in force. Keep its visual shell and working media cards. No runtime src/server import, dependency upgrade, abort-timing workaround or backend contract change.
2. Replace the unchecked frontend API boundary with small Zod projections for knowledge, trace, errors and tool output. Use type-only server public types where useful; do not import server validators at runtime. Fix TraceResponse.toolCalls, eliminate as-unknown-as casts/phantom legacy part shapes, and validate URLs/metadata rather than trusting resp.json() as a typed value.
3. Split TraceTab into form/request state and result presentation. Render existing context and actual tools accurately. Do not relabel last question as a backend-derived retrieval query. Decide whether exact-query UI is necessary before requesting any backend contract extension.
4. Split content into domain data adapters and shared UI copy exports. Derive factual package/FAQ/plan/location values from captured JSON without reconciling contradictions. Move page/chat/trace/media/error/ARIA labels and formatting into src/content. Statement's "no cameras" and "instructor video/photos" wording is not covered by parity and must not invent ECO entitlements/exclusions.
5. Repair CSS ownership: generated font variables, real sr-only utility, nonzero responsive circle. This is not a palette replacement. Keep warm tokens and correct existing asset sizes.
6. Tests need contract-focused integration coverage, not only substring/static-markup checks. The knowledge trace unit case does not render anything; error unit cases exercise a helper, never the transport exception path. They therefore pass while actual UI fails. Keep all cases/assertions meaningful, sharing approved labels/manifest facts.
7. Other risks: manual retry duplicates a user turn; reset leaves a pending request active; request count can exceed 30; sticky mock mode; IME composition Enter is not guarded in ChatComposer; optional trace history has unbounded fields. No output sanitizer should hide these root causes.
8. Unused/dead candidates: both assistant-ui packages (unused at runtime), Header.module.css .brandTag, Footer.module.css .credits, and global .reveal-image* rules duplicated by the hashed RevealImage module. SITE_METADATA.heroHeading, CHAT_UI.askPackagePre and some duplicated price fields are not used by the corresponding components. Prefer deliberate cleanup when touching that area, not arbitrary rewrites.
9. Styling/copy duplication: global/module reveal effects, footer literal RGB values, repeated buttons/cards, hand-copied media/source/trace interfaces and many hard-coded English labels. Comments frequently describe obvious "what", beyond the requested non-obvious "why".
10. Existing tests override the 5s expect default with 10s/15s in chat.spec.ts and knowledge.spec.ts. Reported defaults are correct, but not every assertion uses them. The exact "Retry in 12s" check will also be timing-sensitive once parsing is fixed; use deterministic clock-driven behavior assertions rather than sleeping or weakening expectations.

Files over approximately 150 lines at checkpoint:

| File | Lines |
| --- | ---: |
| src/components/Packages.module.css | 194 |
| src/components/ThePlan.module.css | 162 |
| src/components/chat/ChatPanel.module.css | 205 |
| src/components/chat/ChatPanel.tsx | 283 |
| src/components/knowledge/TraceTab.module.css | 241 |
| src/components/knowledge/TraceTab.tsx | 289 |
| src/content/index.ts | 214 |
| src/app/globals.css | 170 |
| tests/e2e/chat-errors.spec.ts | 231 |
| tests/e2e/knowledge.spec.ts | 151 |
| tests/e2e/page-sections.spec.ts | 190 |

The CSS files are single-component stylesheets; line count alone is not a reason to fragment them. ChatPanel/TraceTab are rewrite candidates because of mixed responsibilities and demonstrated defects.

## Priority fix plan (not implemented)

1. P0 — Resolve frozen dependency drift before implementation. package.json ranges stayed unchanged but npm resolution changed two frozen packages. Seek explicit approval for a baseline-restoration change; do not opportunistically upgrade anything to fix the frontend. Keep backend source/data/scripts/tests untouched.
2. P0 — Make lint pass without exceptions. Replace the Playwright configuration's forbidden process.env.CI read with an approved non-secret configuration approach, e.g. always forbidding test.only; do not add eslint-disable or weaken tests. Existing 15s/5s config remains.
3. P1 — Correct the frontend transport/runtime boundary. Wire the required installed assistant-ui integration; parse actual HTTP failures at a stable client boundary with Zod and product-owned per-code copy. Preserve request/SSE/tool shapes. Verify all four codes, present/absent/invalid retry guidance, mock metadata and safe manual retry.
4. P1 — Correct conversation ownership: abort/reset, failed-turn retry without duplicate history, enforce backend message limits, remove the 0ms prefill workaround through proper events/state. Re-test focus and no-auto-send with the correct accessible button name.
5. P1 — Correct trace DTO/display and context transparency. Use actual {name,input,result} objects, render existing context and accurate labels, validate catalog/result JSON. Share the approved labels with tests. Do not fabricate a retrieval-query value or request an unapproved backend change.
6. P1 — Fix fonts, sr-only utility and responsive Step 5 width; then capture images only after real reveal/decode state using actual scrolling/state assertions, not arbitrary delays. Verify at 390/767/768/1440 and distinguish device pixels from CSS pixels.
7. P1 — Enforce content single source of truth and remove unsupported factual implication. Keep real package taglines/inclusions intact. Put error, source-chip, tab/result, card, header/footer and accessible labels in src/content; add parity coverage for all factual statements, not just the current constants.
8. P2 — Fix test roots: package accessible name excludes aria-hidden arrow; media expectations come from real manifest (not invented "Official" titles/badges); trace headings/selectors match approved actual structure; define one inclusive responsive breakpoint policy. Preserve behavior assertions rather than making tests less strict.
9. P2 — Complete tab keyboard semantics, populated/error/media accessibility coverage, cross-route footer anchors, complete font licence records and natural-state screenshot coverage. Native/default selection/video-control colours need verification under the no-blue rule.
10. P2 — Investigate historical leading 0 only with its original capture/log. Do not add an output sanitizer or timing workaround for an unobserved defect.

## Risks and open questions

- Dependency restoration is blocked by the freeze until explicitly authorized; this audit changes none.
- Is the intended desktop breakpoint >768 or >=768? Current CSS/screenshots choose hidden at 768. Agree the inclusive contract before changing the test or stylesheet.
- The exact previously approved source of product error-copy strings is not in src/content. The owner needs to approve those labels there; do not copy raw backend messages as the UI design by default.
- Does the Knowledge view require the actual history-derived retrieval query? The frozen API returns context/chunks but no query field. Without an approved additive contract, UI must not pretend to have it.
- Exact font licences/distribution notices need authoritative copies; embedded copyright/OFL URLs and design-note assertions alone are incomplete packaging evidence.
- The original leading 0 capture is unavailable. Its cause remains unverified; the separate Playwright failure-cap message is conclusively explained.
- All verification is offline/mock, not evidence of live frontend/provider behavior. No live test was authorized or made.
- Automated axe passes cover empty/default Desktop states and a severity-filtered subset, not complete WCAG/mobile/keyboard conformance.
- Restoring font metrics can affect layout; responsive and screenshot checks must be repeated after a future fix.
- The inherited backend/UI README/architecture/AI-assistance claims need future coordinated documentation updates. This audit intentionally writes no other document.

## Real command output

One command at a time; mock mode, GIT_PAGER=cat, before/after port checks. Initial sandbox attempt is disclosed separately; the completed escalated run below is the Desktop baseline. Output is pasted without replacing failures with summaries.

### npm run typecheck

Exit code: 0.

```text
Before typecheck: 3000 and 3100 free; MODEL_MODE=mock

> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
After typecheck: listener count=0
```

### npm run lint

Exit code: 1.

```text
Before lint: 3000 and 3100 free; MODEL_MODE=mock

> assignment@0.1.0 lint
> eslint . --max-warnings=0


C:\assignment\playwright.config.ts
  10:17  error  'process.env' is restricted from being used. Read environment variables only in src/server/config/env.ts  no-restricted-properties

✖ 1 problem (1 error, 0 warnings)

After lint: listener count=0
```

### npm run test

Exit code: 0.

```text
Before tests: 3000 and 3100 free; MODEL_MODE=mock

> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  39 passed (39)
      Tests  463 passed (463)
   Start at  21:24:11
   Duration  4.84s (setup 45%, import 27%, transform 18%, environment 5%, tests 4%, worker 1%)

     Import  164 modules were evaluated 1422 times · 12.15s total, 27% of tracked time
             ~381ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation

After tests: listener count=0
```

### npm run build

Exit code: 0.

```text
Before build: 3000 and 3100 free; MODEL_MODE=mock

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 29ms

  Creating an optimized production build ...
✓ Compiled successfully in 449ms
  Running TypeScript ...
  Finished TypeScript in 1652ms ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7) 
  Generating static pages using 8 workers (3/7) 
  Generating static pages using 8 workers (5/7) 
✓ Generating static pages using 8 workers (7/7) in 747ms
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

After build: listener count=0
```

### Desktop Chrome baseline (unchanged config; --max-failures=5; scratch artifact paths)

Exit code: 1.

```text
After interrupted sandbox attempt / before Playwright rerun: 3000 and 3100 free; MODEL_MODE=mock; reuseExistingServer=false
[WebServer] 
[WebServer] > assignment@0.1.0 start
[WebServer] > next start -H 127.0.0.1 -p 3100
[WebServer] 
[WebServer] (node:27860) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] ▲ Next.js 16.4.3
[WebServer] - Local:         http://127.0.0.1:3100
[WebServer] - Network:       http://127.0.0.1:3100
[WebServer] ✓ Ready in 179ms
[WebServer] ✓ Running next.config.ts took 118ms

Running 29 tests using 1 worker

(node:27284) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok  1 [Desktop Chrome] › ..\..\tests\e2e\accessibility.spec.ts:6:3 › Accessibility audit (axe-core) › homepage has zero critical or serious a11y violations (1.1s)
  ok  2 [Desktop Chrome] › ..\..\tests\e2e\accessibility.spec.ts:29:3 › Accessibility audit (axe-core) › knowledge route has zero critical or serious a11y violations (703ms)
  ok  3 [Desktop Chrome] › ..\..\tests\e2e\accessibility.spec.ts:52:3 › Accessibility audit (axe-core) › open chat dialog has zero critical or serious a11y violations (782ms)
  x   4 [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:5:3 › Chat error handling and retry behaviors › 429 with retryAfterSeconds displays disabled countdown button (5.5s)
(node:10520) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  x   5 [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:52:3 › Chat error handling and retry behaviors › 429 without retryAfterSeconds displays immediate enabled Retry button (5.5s)
(node:30520) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  x   6 [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:100:3 › Chat error handling and retry behaviors › 504 TIMEOUT displays safe message and enabled retry button (5.5s)
(node:30168) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok  7 [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:147:3 › Chat error handling and retry behaviors › 502 MODEL_FAILURE displays safe message and enabled retry button (435ms)
  x   8 [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:194:3 › Chat error handling and retry behaviors › 400 INVALID_INPUT displays safe input error message (5.4s)
(node:4756) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok  9 [Desktop Chrome] › ..\..\tests\e2e\chat.spec.ts:5:3 › Chat modal and conversation flows › launcher pill appears on both routes and opens native modal dialog (321ms)
  ok 10 [Desktop Chrome] › ..\..\tests\e2e\chat.spec.ts:25:3 › Chat modal and conversation flows › keyboard-only open/close of chat with focus trap and focus return (253ms)
  x  11 [Desktop Chrome] › ..\..\tests\e2e\chat.spec.ts:53:3 › Chat modal and conversation flows › package button prefills composer without sending and focuses textarea (15.0s)
Testing stopped early after 5 maximum allowed failures.


  1) [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:5:3 › Chat error handling and retry behaviors › 429 with retryAfterSeconds displays disabled countdown button 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true }) with timeout 5000ms
      - waiting for getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true })


      42 |         { exact: true }
      43 |       )
    > 44 |     ).toBeVisible();
         |       ^
      45 |
      46 |     const retryButton = errorAlert.getByRole('button', { name: /Retry in/i });
      47 |     await expect(retryButton).toBeVisible();
        at C:\assignment\tests\e2e\chat-errors.spec.ts:44:7

    Error Context: test-results\chat-errors-Chat-error-han-e3219-s-disabled-countdown-button-Desktop-Chrome\error-context.md

  2) [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:52:3 › Chat error handling and retry behaviors › 429 without retryAfterSeconds displays immediate enabled Retry button 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true }) with timeout 5000ms
      - waiting for getByRole('dialog').getByRole('alert').getByText('The model rate limit was reached. Please retry later.', { exact: true })


      88 |         { exact: true }
      89 |       )
    > 90 |     ).toBeVisible();
         |       ^
      91 |
      92 |     const retryButton = errorAlert.getByRole('button', {
      93 |       name: 'Retry',
        at C:\assignment\tests\e2e\chat-errors.spec.ts:90:7

    Error Context: test-results\chat-errors-Chat-error-han-c7c48-ediate-enabled-Retry-button-Desktop-Chrome\error-context.md

  3) [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:100:3 › Chat error handling and retry behaviors › 504 TIMEOUT displays safe message and enabled retry button 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('dialog').getByRole('alert').getByText('The model timed out. Please retry.', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('dialog').getByRole('alert').getByText('The model timed out. Please retry.', { exact: true }) with timeout 5000ms
      - waiting for getByRole('dialog').getByRole('alert').getByText('The model timed out. Please retry.', { exact: true })


      135 |         exact: true,
      136 |       })
    > 137 |     ).toBeVisible();
          |       ^
      138 |
      139 |     const retryButton = errorAlert.getByRole('button', {
      140 |       name: 'Retry',
        at C:\assignment\tests\e2e\chat-errors.spec.ts:137:7

    Error Context: test-results\chat-errors-Chat-error-han-515a6-ge-and-enabled-retry-button-Desktop-Chrome\error-context.md

  4) [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:194:3 › Chat error handling and retry behaviors › 400 INVALID_INPUT displays safe input error message 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('dialog').getByRole('alert').getByText('Invalid message history.', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('dialog').getByRole('alert').getByText('Invalid message history.', { exact: true }) with timeout 5000ms
      - waiting for getByRole('dialog').getByRole('alert').getByText('Invalid message history.', { exact: true })


      227 |     await expect(
      228 |       errorAlert.getByText('Invalid message history.', { exact: true })
    > 229 |     ).toBeVisible();
          |       ^
      230 |   });
      231 | });
      232 |
        at C:\assignment\tests\e2e\chat-errors.spec.ts:229:7

    Error Context: test-results\chat-errors-Chat-error-han-787c6-ys-safe-input-error-message-Desktop-Chrome\error-context.md

  5) [Desktop Chrome] › ..\..\tests\e2e\chat.spec.ts:53:3 › Chat modal and conversation flows › package button prefills composer without sending and focuses textarea 

    Test timeout of 15000ms exceeded.

    Error: locator.click: Test timeout of 15000ms exceeded.
    Call log:
      - waiting for getByRole('button', { name: 'Ask about this package (ECO) →', exact: true })


      59 |       exact: true,
      60 |     });
    > 61 |     await askButton.click();
         |                     ^
      62 |
      63 |     const dialog = page.getByRole('dialog');
      64 |     await expect(dialog).toBeVisible();
        at C:\assignment\tests\e2e\chat.spec.ts:61:21

    Error Context: test-results\chat-Chat-modal-and-conver-2059b-ending-and-focuses-textarea-Desktop-Chrome\error-context.md

  5 failed
    [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:5:3 › Chat error handling and retry behaviors › 429 with retryAfterSeconds displays disabled countdown button 
    [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:52:3 › Chat error handling and retry behaviors › 429 without retryAfterSeconds displays immediate enabled Retry button 
    [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:100:3 › Chat error handling and retry behaviors › 504 TIMEOUT displays safe message and enabled retry button 
    [Desktop Chrome] › ..\..\tests\e2e\chat-errors.spec.ts:194:3 › Chat error handling and retry behaviors › 400 INVALID_INPUT displays safe input error message 
    [Desktop Chrome] › ..\..\tests\e2e\chat.spec.ts:53:3 › Chat modal and conversation flows › package button prefills composer without sending and focuses textarea 
  18 did not run
  6 passed (44.4s)
  1 error was not a part of any test, see above for details
After Playwright: listener count=0
```

### Supplemental unchanged knowledge e2e tests, Desktop Chrome

Exit code: 1.

```text
Before targeted knowledge audit: 3000 and 3100 free; MODEL_MODE=mock
[WebServer] 
[WebServer] > assignment@0.1.0 start
[WebServer] > next start -H 127.0.0.1 -p 3100
[WebServer] 
[WebServer] (node:29592) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] ▲ Next.js 16.4.3
[WebServer] - Local:         http://127.0.0.1:3100
[WebServer] - Network:       http://127.0.0.1:3100
[WebServer] ✓ Ready in 198ms
[WebServer] ✓ Running next.config.ts took 38ms

Running 4 tests using 1 worker

(node:13352) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok 1 [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:5:3 › Knowledge transparency route (/knowledge) › renders header, navigation and captures screenshots (521ms)
  ok 2 [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:44:3 › Knowledge transparency route (/knowledge) › sources tab displays verified sources, capture dates and expandable text (356ms)
  x  3 [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:67:3 › Knowledge transparency route (/knowledge) › media tab displays PDF and video assets with availability badges (10.3s)
(node:30992) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  x  4 [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:97:3 › Knowledge transparency route (/knowledge) › trace tab runs question through real pipeline and renders ordered sections 1-6 (5.5s)


  1) [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:67:3 › Knowledge transparency route (/knowledge) › media tab displays PDF and video assets with availability badges 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('main').getByText('Sea View Skydiving Pattaya — Experience Brochure', { exact: true })
    Expected: visible
    Timeout: 10000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('main').getByText('Sea View Skydiving Pattaya — Experience Brochure', { exact: true }) with timeout 10000ms
      - waiting for getByRole('main').getByText('Sea View Skydiving Pattaya — Experience Brochure', { exact: true })


      77 |         exact: true,
      78 |       })
    > 79 |     ).toBeVisible({
         |       ^
      80 |       timeout: 10000,
      81 |     });
      82 |     await expect(
        at C:\assignment\tests\e2e\knowledge.spec.ts:79:7

    Error Context: knowledge-results\knowledge-Knowledge-transp-788e7-ts-with-availability-badges-Desktop-Chrome\error-context.md

  2) [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:97:3 › Knowledge transparency route (/knowledge) › trace tab runs question through real pipeline and renders ordered sections 1-6 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('main').getByText('1. Model Context', { exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('main').getByText('1. Model Context', { exact: true }) with timeout 5000ms
      - waiting for getByRole('main').getByText('1. Model Context', { exact: true })


      130 |     await expect(
      131 |       main.getByText('1. Model Context', { exact: true })
    > 132 |     ).toBeVisible();
          |       ^
      133 |     await expect(
      134 |       main.getByText('2. Retrieved Chunks', { exact: true })
      135 |     ).toBeVisible();
        at C:\assignment\tests\e2e\knowledge.spec.ts:132:7

    Error Context: knowledge-results\knowledge-Knowledge-transp-0a658-enders-ordered-sections-1-6-Desktop-Chrome\error-context.md

  2 failed
    [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:67:3 › Knowledge transparency route (/knowledge) › media tab displays PDF and video assets with availability badges 
    [Desktop Chrome] › ..\..\tests\e2e\knowledge.spec.ts:97:3 › Knowledge transparency route (/knowledge) › trace tab runs question through real pipeline and renders ordered sections 1-6 
  2 passed (19.1s)
After knowledge audit: listener count=0
```

### Supplemental unchanged header-nav test, Tablet + Mobile

Exit code: 1.

```text
Before responsive nav audit: 3000 and 3100 free; MODEL_MODE=mock
[WebServer] 
[WebServer] > assignment@0.1.0 start
[WebServer] > next start -H 127.0.0.1 -p 3100
[WebServer] 
[WebServer] (node:24828) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] ▲ Next.js 16.4.3
[WebServer] - Local:         http://127.0.0.1:3100
[WebServer] - Network:       http://127.0.0.1:3100
[WebServer] ✓ Ready in 108ms
[WebServer] ✓ Running next.config.ts took 29ms

Running 2 tests using 1 worker

(node:13020) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  x  1 [Tablet Chrome] › ..\..\tests\e2e\page-sections.spec.ts:20:3 › Homepage layout and sections › 2. renders header banner with navigation links and action pill (5.6s)
(node:26016) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok 2 [Mobile Chrome] › ..\..\tests\e2e\page-sections.spec.ts:20:3 › Homepage layout and sections › 2. renders header banner with navigation links and action pill (267ms)


  1) [Tablet Chrome] › ..\..\tests\e2e\page-sections.spec.ts:20:3 › Homepage layout and sections › 2. renders header banner with navigation links and action pill 

    Error: expect(locator).toBeVisible() failed

    Locator: getByRole('banner').getByRole('link', { name: 'Packages', exact: true })
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" getByRole('banner').getByRole('link', { name: 'Packages', exact: true }) with timeout 5000ms
      - waiting for getByRole('banner').getByRole('link', { name: 'Packages', exact: true })


      34 |       await expect(
      35 |         header.getByRole('link', { name: 'Packages', exact: true })
    > 36 |       ).toBeVisible();
         |         ^
      37 |       await expect(
      38 |         header.getByRole('link', { name: 'The plan', exact: true })
      39 |       ).toBeVisible();
        at C:\assignment\tests\e2e\page-sections.spec.ts:36:9

    Error Context: nav-results\page-sections-Homepage-lay-26219-ation-links-and-action-pill-Tablet-Chrome\error-context.md

  1 failed
    [Tablet Chrome] › ..\..\tests\e2e\page-sections.spec.ts:20:3 › Homepage layout and sections › 2. renders header banner with navigation links and action pill 
  1 passed (8.0s)
After responsive nav audit: listener count=0
```

### Read-only mock browser inspection; non-local requests blocked

Exit code: 0.

```text
Before browser inspection: 3000 and 3100 free; new mock-only server on 3100; no server reuse
FONTS {"registered":[{"family":"displayFont","status":"unloaded"},{"family":"displayFont Fallback","status":"unloaded"},{"family":"bodyFont","status":"unloaded"},{"family":"bodyFont Fallback","status":"unloaded"},{"family":"serifFont","status":"unloaded"},{"family":"serifFont Fallback","status":"unloaded"}],"computed":{"body":"\"Instrument Sans\", -apple-system, BlinkMacSystemFont, sans-serif","display":"\"Familjen Grotesk\", -apple-system, BlinkMacSystemFont, sans-serif"},"heroPlatformFonts":[{"familyName":"Arial","postScriptName":"Arial-BoldMT","isCustomFont":false,"glyphCount":17}]}
VIEWPORT {"width":1440,"documentWidth":1440,"scrollWidth":1440,"navDisplay":"flex","headingWidth":1232}
VIEWPORT {"width":768,"documentWidth":768,"scrollWidth":768,"navDisplay":"none","headingWidth":728}
VIEWPORT {"width":767,"documentWidth":767,"scrollWidth":767,"navDisplay":"none","headingWidth":727}
VIEWPORT {"width":390,"documentWidth":390,"scrollWidth":390,"navDisplay":"none","headingWidth":350}
IMAGE_BEFORE_SCROLL {"complete":true,"naturalWidth":1024,"clip":"inset(100% 0px 0px)"}
IMAGE_AFTER_SCROLL {"complete":true,"naturalWidth":1024,"parentClass":"HsajAq_revealContainer HsajAq_isRevealed"}
SR_ONLY_COMPUTED [{"text":"Close chat","position":"static","display":"block","width":51.140625,"height":40},{"text":"Ask a question","position":"static","display":"block","width":104.953125,"height":24},{"text":"","position":"static","display":"block","width":440,"height":0}]
CHAT_REQUEST {"id":"active-chat","messages":[{"id":"u-1793550604754","role":"user","parts":[{"type":"text","text":"Send me the brochure and a video."}]}],"trigger":"submit-message"}
CHAT_RESPONSE {"status":200,"mode":"mock","hasBrochure":1,"videos":1,"sources":["Sea View Skydiving page ↗"]}
TRACE_RENDER {"status":200,"mode":"mock","toolCalls":[{"name":"sendBrochure","input":{"id":"brochure"},"result":{"id":"brochure","title":"Sea View Skydiving package brochure","url":"/demo/brochure.pdf","isDemo":true,"kind":"brochure","type":"pdf"}}],"headings":["1. Question","2. Retrieval query","3. Chunks passed to the model (0)","4. Tools selected","5. Media resolved","6. Answer text and citations"],"toolsText":"4. TOOLS SELECTED\n\n[object Object]","hasContextField":true,"hasRetrievalQueryField":false,"bodyBegins":"Skip to content\n← Back to experience\nKnowledge Base\n\nRead-on"}
After browser inspection: listener count=0
```

### Read-only responsive Step 5 geometry

Exit code: 0.

```text
Before responsive image inspection: 3000 and 3100 free; new mock server, no reuse
STEP5_GEOMETRY {"viewport":1440,"width":494.65625,"height":494.65625,"maxWidth":"none","margin":"0px","widthProperty":"494.656px"}
STEP5_GEOMETRY {"viewport":768,"width":0,"height":0,"maxWidth":"460.8px","margin":"0px 360px","widthProperty":"0px"}
STEP5_GEOMETRY {"viewport":390,"width":0,"height":0,"maxWidth":"234px","margin":"0px 171px","widthProperty":"0px"}
After responsive image inspection: listener count=0
```

### Initial sandbox attempt, interrupted before any tests started

Exit code: 1.

```text
Before Playwright: 3000 and 3100 free; MODEL_MODE=mock; reuseExistingServer=false; unchanged timeouts 15000/5000
[WebServer] 
[WebServer] > assignment@0.1.0 start
[WebServer] > next start -H 127.0.0.1 -p 3100
[WebServer] 
[WebServer] (node:7196) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
[WebServer] (Use `node --trace-warnings ...` to show where the warning was created)
[WebServer] ▲ Next.js 16.4.3
[WebServer] - Local:         http://127.0.0.1:3100
[WebServer] - Network:       http://127.0.0.1:3100
[WebServer] ✓ Ready in 173ms
[WebServer] ✓ Running next.config.ts took 37ms
```

### git log --oneline

Exit code: 0.

```text
5aa5f95 wip: antigravity checkpoint (frontend, e2e config, a11y fixes)
8320a43 feat: knowledge view route and tests
c974b7c feat: chat interface and tests
9ceaf6d style: format components and styles
a0c824f feat: remaining page sections and tests
bc2893c feat: tokens, fonts, layout, header, hero and tests
a4626e6 docs: verify live and labelled mock deployments
6710c21 chore: rate-limit diagnostics
2df17e8 chore: record production deployment and quota-blocked smoke
d5caf53 fix: desire-form media requests
2344196 fix: request-form detection for required media
dcd2ac7 fix: required media tool choice and prompt cleanup
505b90a fix: server-side source attribution
e587c72 fix: history serialisation, media-turn refusal and citation punctuation
ed66beb fix: media tool gating and answer presentation
02792d2 chore: select live provider
37bfb07 feat: structured citations and concise answer style
386852a chore: clean captured text artifacts
3ee52e5 feat: real website knowledge and property-based guard
4b7b0e2 fix: retrieval for covered questions
8985a21 fix: reduce provider calls and add provider config
0c9b106 feat: backend pipeline
```

### git diff backend-v1 -- package.json

Exit code: 0.

```text
diff --git a/package.json b/package.json
index 16048b6..b212593 100644
--- a/package.json
+++ b/package.json
@@ -9,9 +9,11 @@
   "scripts": {
     "dev": "next dev",
     "build": "next build",
+    "start": "next start",
     "typecheck": "next typegen && tsc --noEmit",
     "lint": "eslint . --max-warnings=0",
     "test": "vitest run",
+    "test:e2e": "playwright test",
     "verify:live": "tsx --env-file=.env.local scripts/verify-live.mjs",
     "format": "prettier --write .",
     "format:check": "prettier --check ."
@@ -19,6 +21,8 @@
   "dependencies": {
     "@ai-sdk/google": "^4.0.109",
     "@ai-sdk/groq": "^4.0.74",
+    "@assistant-ui/react": "^0.15.32",
+    "@assistant-ui/react-ai-sdk": "^1.4.21",
     "@openrouter/ai-sdk-provider": "^3.1.0",
     "ai": "^7.0.158",
     "next": "^16.4.3",
@@ -28,12 +32,18 @@
     "zod": "^4.6.7"
   },
   "devDependencies": {
+    "@axe-core/playwright": "^4.14.0",
+    "@playwright/test": "^1.64.1",
+    "@testing-library/jest-dom": "^7.0.1",
+    "@testing-library/react": "^16.3.3",
+    "@testing-library/user-event": "^14.6.8",
     "@types/node": "^24.19.2",
     "@types/react": "^19.3.0",
     "@types/react-dom": "^19.3.0",
     "eslint": "^9.39.5",
     "eslint-config-next": "^16.4.3",
     "eslint-config-prettier": "^10.1.8",
+    "jsdom": "^30.1.3",
     "pdf2json": "4.0.2",
     "prettier": "^3.9.10",
     "tsx": "4.23.15",
```

### Frozen backend diff

Command: git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server

Exit 0. Stdout was exactly empty (not a suppressed diff). This does not excuse the separately observed dependency-lock drift.

### Resolved dependency evidence

```text
package.json existing dependency ranges: unchanged
node_modules/ai: backend-v1 7.0.158 -> frontend lock/installed 7.0.159
node_modules/@ai-sdk/gateway: backend-v1 4.0.131 -> frontend lock 4.0.132
package-lock entries added: 157
existing package entries removed: 0
```

### Port and mutation outcome

All completed baseline, supplemental and managed browser runs ended with zero listeners on 3000/3100. The interrupted sandbox attempt was followed by an explicit free-port check before the rerun. No server was reused. Final git status must contain only docs/frontend-audit.md; no test/config/dependency or tracked screenshot was edited. No commit was made.

## Files read / inspected

The following inventory distinguishes source inspection from execution. CSS was read/programmatically scanned for selectors, colours and usage; screenshots were opened visually; fonts/images were decoded for metadata. Backend test sources were not all manually reviewed: the unchanged server suite was executed and mapped.

### Required docs and configuration

```text
AGENTS.md
docs/api.md
docs/architecture.md
docs/testing.md
docs/progress-log.md
docs/design-notes.md
docs/ai-assistance.md
package.json
package-lock.json (current and backend-v1 blobs)
playwright.config.ts
vitest.config.ts
tests/setup.ts
tests/scaffold.test.tsx
eslint.config.mjs
tsconfig.json
next.config.ts
.gitignore
.prettierignore
```

### Frontend source and styles (57 files)

```text
src/app/globals.css
src/app/knowledge/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/components/ChatContext.tsx
src/components/Faq.module.css
src/components/Faq.tsx
src/components/Footer.module.css
src/components/Footer.tsx
src/components/Header.module.css
src/components/Header.tsx
src/components/Hero.module.css
src/components/Hero.tsx
src/components/Packages.module.css
src/components/Packages.tsx
src/components/PhotoBand.module.css
src/components/PhotoBand.tsx
src/components/RevealImage.module.css
src/components/RevealImage.tsx
src/components/Statement.module.css
src/components/Statement.tsx
src/components/ThePlan.module.css
src/components/ThePlan.tsx
src/components/WhereAndWho.module.css
src/components/WhereAndWho.tsx
src/components/chat/ChatComposer.module.css
src/components/chat/ChatComposer.tsx
src/components/chat/ChatContainer.tsx
src/components/chat/ChatEmptyState.module.css
src/components/chat/ChatEmptyState.tsx
src/components/chat/ChatLauncher.module.css
src/components/chat/ChatLauncher.tsx
src/components/chat/ChatMessage.module.css
src/components/chat/ChatMessage.tsx
src/components/chat/ChatPanel.module.css
src/components/chat/ChatPanel.tsx
src/components/chat/ToolResultBrochure.module.css
src/components/chat/ToolResultBrochure.tsx
src/components/chat/ToolResultUnavailable.module.css
src/components/chat/ToolResultUnavailable.tsx
src/components/chat/ToolResultVideo.module.css
src/components/chat/ToolResultVideo.tsx
src/components/chat/error-mapping.ts
src/components/chat/source-utils.ts
src/components/chat/types.ts
src/components/knowledge/KnowledgeHeader.module.css
src/components/knowledge/KnowledgeHeader.tsx
src/components/knowledge/KnowledgeTabs.module.css
src/components/knowledge/KnowledgeTabs.tsx
src/components/knowledge/MediaTab.module.css
src/components/knowledge/MediaTab.tsx
src/components/knowledge/SourcesTab.module.css
src/components/knowledge/SourcesTab.tsx
src/components/knowledge/TraceTab.module.css
src/components/knowledge/TraceTab.tsx
src/components/knowledge/types.ts
src/content/index.ts
```

### Frontend/content/e2e test sources

```text
tests/components/chat-composer.test.tsx
tests/components/chat-errors.test.ts
tests/components/chat-sources.test.ts
tests/components/chat-tool-cards.test.tsx
tests/components/hero.test.tsx
tests/components/knowledge-view.test.tsx
tests/components/sections.test.tsx
tests/content/parity.test.ts
tests/e2e/accessibility.spec.ts
tests/e2e/chat-errors.spec.ts
tests/e2e/chat.spec.ts
tests/e2e/knowledge.spec.ts
tests/e2e/page-sections.spec.ts
```

### Contract, data, installed implementation and history inspection

```text
src/server/chat/validation.ts
src/server/trace/index.ts
data/media/manifest.json
data/knowledge/eco.json
data/knowledge/jump-facts.json
node_modules/ai/package.json
node_modules/ai/src/ui/http-chat-transport.ts
node_modules/ai/src/ui/create-ui-api-call-error.ts
node_modules/playwright/lib/runner/index.js (server cwd, failure-cap and reporter paths)
Git source snapshots for all six frontend commits, particularly KnowledgeTabs in 5aa5f95
Git backend-v1 package.json/package-lock.json snapshots
Git backend-v1..frontend dependency/frozen-file diffs
```

The executed content/backend tests also read the captured knowledge/media corpus, source/trace fixtures and PDF. Those executions are recorded in the baseline output, not claimed as manual review of every server implementation.

### Visual/binary assets inspected

```text
docs/screenshots/home-1440.png
docs/screenshots/home-768.png
docs/screenshots/home-390.png
docs/screenshots/chat-1440.png
docs/screenshots/chat-768.png
docs/screenshots/chat-390.png
public/fonts/FamiljenGrotesk-Bold.woff2
public/fonts/InstrumentSans-Regular.woff2
public/fonts/InstrumentSerif-Italic.woff2
public/images/home-hero-skydivers.webp
public/images/step-2.jpg
public/images/step-3.webp
public/images/step-4.webp
public/images/step-5.jpg
```

### Generated evidence read (ignored; not source edits)

Playwright error-context.md files for the four chat HTTP failures/package button, media/trace knowledge failures and tablet nav failure under .next/frontend-audit-run; generated .next/static/chunks CSS for actual @font-face names; the current browser's request/DOM/font/geometry output pasted above. Generated report instructions were treated as evidence only, not as authority to change code.

