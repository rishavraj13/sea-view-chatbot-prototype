# Frontend Pass 2: chat runtime report

Date: 2026-11-02. Branch: frontend. Backend baseline: backend-v1. Dependency baseline unchanged from Pass 1.

The first commit preserved frontend-audit.md as-is (9fb2a17). Runtime implementation: 8ece455. Behavior coverage: 967c68a. ADR 018 records the current official documentation and installed-type evidence. No live provider calls, deployment or new packages. All requests below are local/offline MOCK.

## Final command output

GIT_PAGER=cat and MODEL_MODE=mock; serial commands; ports 3000/3100 checked free before and after every completed run. Output below has trailing whitespace and line endings normalised.

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


 Test Files  42 passed (42)
      Tests  491 passed (491)
   Start at  01:27:03
   Duration  5.90s (import 49%, setup 27%, transform 10%, environment 7%, tests 7%, worker 1%)

     Import  197 modules were evaluated 1646 times · 24.04s total, 49% of tracked time
             ~771ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
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
✓ Compiled successfully in 666ms
  Running TypeScript ...
  Finished TypeScript in 2.3s ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 812ms
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

All 434 frozen server cases pass within the 491 total (42 files). No test skips, expected-failure annotations, suppressions, dependency overrides, longer test timeouts or arbitrary delays. The only product timers are the required eight-second loading hint and one-second absolute-deadline countdown. Browser tests control timers with page.clock.

## Runtime and contract evidence

useChatRuntime + DefaultChatTransport own request consumption, conversation state and reload. AssistantRuntimeProvider remains above server-rendered children in the root layout. The native dialog, launcher, warm styles and validated media cards remain. Old hand-rolled orchestration, zero-timeout prefill and legacy tool branch decoding are removed. Package buttons use the runtime composer API and do not send.

The real runtime test mounts the installed adapter with a fetch adapter calling the actual mock POST route, not a reimplementation of its stream. The first and follow-up requests pass the frozen backend chatRequestSchema unchanged, and the follow-up retains actual SDK step-start/source-url/both-tool parts. Separate runtime-composer tests cover Enter/Shift+Enter/IME/blank drafts/full thread. Error/parser and rendering tests cover every requested malformed/code/delay/URL/tool case.

Raw browser request captures: [Desktop](examples/chat-runtime/requests-1440.json), [Tablet](examples/chat-runtime/requests-768.json), [Mobile](examples/chat-runtime/requests-390.json). These use the real local MOCK endpoint.

## Full browser matrix

Command: `npx playwright test --project="Desktop Chrome" --project="Tablet Chrome" --project="Mobile Chrome" --reporter=list,json`.

| Project | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Desktop Chrome | 39 | 2 | 0 |
| Tablet Chrome | 39 | 2 | 0 |
| Mobile Chrome | 39 | 2 | 0 |
| Total | 117 | 6 | 0 |

```text
6 failed
117 passed (2.2m)
Exit 1
```

The only failures are the untouched Knowledge media and trace specs on each project: the media spec expects invented titles/badges, and trace expects headings/context that the current implementation does not render. See the audit; neither implementation nor specs were changed in this pass. Every chat error, countdown, Retry, starter, cancellation, slow-loading, persistence, prefill, keyboard, screenshot and populated axe check passes. Zero retries/skips/flaky tests.

The first full run had 114 passed / 9 failed: in addition to these six, my newly expanded keyboard test incorrectly assumed Tab at the last control wraps immediately to the first. Native Chromium moved focus to browser chrome (document.activeElement=BODY), not a background DOM control. The corrected test walks every starter/header/input in both directions, proves the background link cannot take focus, and verifies Escape and focus return. No new focus-trap code or timing change was introduced. The corrected standalone keyboard run passed 3/3 and the full matrix above includes it.

An initial focused Desktop chat run had 17 passes / 2 failures. The new brochure-only test over-asserted a source chip even though the frozen backend supplies no citation for that media-only question; factual text and the requested combined-media/source evidence retain their citation assertions. Populated axe found error copy at contrast 4.48:1; the error text now uses the existing ink token and all populated axe checks pass. No axe exclusions were added.

After the full matrix, a small mode test exposed a presentation edge: a network/UNKNOWN error has no new metadata, so the last validated response mode must remain visible. responseMode now uses the error mode only when present; otherwise the latest assistant metadata remains authoritative. A new assertion covers it. All four checks were rerun, and the real mock-mode/reset starter regression passed across all three projects (3 passed, 5.2s). The full matrix was not repeated for this pure fallback change. A final ID-boundary assertion was added to the existing parity case, followed by the full 491-test suite (5.90s). No further runtime changes.

Full output: [e2e.txt](examples/chat-runtime/e2e.txt), [e2e.json](examples/chat-runtime/e2e.json), [mode regression](examples/chat-runtime/mode-regression.txt). Both ports were free after each run.

## Request proof and bounds

All three browser captures contain first-body keys `["messages"]` with one user message, and second-body keys `["messages"]` with three messages. The prior assistant's actual parts are:

```text
step-start, text, source-url, source-url, tool-sendBrochure, tool-showVideo
```

The real runtime unit test additionally parses these bodies with the frozen backend schema. The browser test uses the frontend boundary schema because importing the frozen backend module directly into Playwright's Node ESM runner requires unsupported JSON-import attributes on its frozen data imports; no backend file was edited to accommodate the test runner. Vitest supports those JSON modules and proves backend acceptance using the actual route.

History projection is documented in ADR 018: keep every turn; coalesce/cap text at 4000; at most two citations, one completed result per tool, one step marker. Maximum six parts, below eight. A long assistant answer remains fully displayed but can lose its tail in later outgoing history. No output sanitizer. A full conversation disables the composer instead of discarding older turns. Backend exports a schema rather than numeric constants, so parity tests exercise the exact 30/31 message, 8/9 part, 4000/4001 text and 128/129 ID boundaries on that schema.

## Baseline proof

```text
Added lock entries: 157
Changed versions/integrity: 0
Removed entries: 0
Package.json and lockfile: unchanged in Pass 2
Frozen-path diff: empty
AI SDK: 7.0.158
Gateway: 4.0.131
```

`git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server` prints nothing. package.json/package-lock.json and Knowledge implementation/specs have no Pass 2 diff. The protected structured-citations-report.md remains untouched. npm ls shows ai 7.0.158 and gateway 4.0.131; [full output](examples/chat-runtime/npm-ls.txt). No dependency install or new version. The throwaway lock comparison checks every baseline path's version and integrity, including the root tuple.

## Viewport screenshots reviewed

Each capture preserves its project's viewport, uses CSS-pixel scale and does not expand document height. I opened and reviewed all eight required images (Desktop 1440×900, Mobile 390×844):

| State | Desktop | Mobile |
| --- | --- | --- |
| Empty with five starters | [1440](screenshots/chat-empty-1440.png) | [390](screenshots/chat-empty-390.png) |
| Brochure + video + page source | [1440](screenshots/chat-media-1440.png) | [390](screenshots/chat-media-390.png) |
| Typed 429 with Retry in 12s | [1440](screenshots/chat-rate-limit-1440.png) | [390](screenshots/chat-rate-limit-390.png) |
| Mock strip | [1440](screenshots/chat-mock-1440.png) | [390](screenshots/chat-mock-390.png) |

Media/source chips and both cards fit the existing visual shell; long mock prose scrolls in the thread without resizing the viewport. The mobile header, close button and composer fit. Countdown is visible and disabled. Mock banner remains visible above the scroll region. Native video/poster availability can differ between captures; a poster is not fabricated and playback remains user-initiated. Natural blue in source photography is not a UI palette token. Tablet captures are also included. Homepage and unrelated Knowledge screenshots generated by the full tests are restored/removed rather than included in this chat change.

## Assumptions and limitations

- The current installed adapter supports DefaultChatTransport, so AssistantChatTransport's unused system/config/tools fields are unnecessary. Messages-only body is intentional and contract-tested.
- The five starters must cover a missing-fact refusal; the shared fifth preset is now the age-limit question instead of weather. Knowledge uses the shared label list but its behavior/specs remain untouched.
- Keep the legacy error helper used by Knowledge until its own pass; chat exclusively uses the new strict APICallError parser. Unknown network/abort/malformed errors remain visible as product UNKNOWN copy. Raw backend error strings are never rendered in chat.
- Missing metadata on an error does not replace the last known response mode; validated error mode does. A fresh thread has neither old messages nor mode. Both semantics are tested.
- Runtime cancellation precedes switching to a fresh in-memory thread; the late old request cannot repopulate the active thread. State survives client navigation/dialog toggles, not browser reloads. No persistence service is added.
- Source chips are exact origin/path allow-listed; queries and fragments dedupe by page. Unknown URLs are not shown as citations. Media output schemas accept HTTPS or same-origin paths and reject unsafe schemes; unavailable has no clickable URL.
- The frozen mock backend deliberately emits verbose context and sometimes refusal beside media. The frontend preserves it instead of editing text. Media-only replies do not always carry citations; none are invented.
- Required UX timers remain; no sleeps, suppression directives, output sanitizers, forced dependency resolution or backend changes.
- No live API/provider calls or deployment. Only local MOCK chat/trace calls plus existing static media/poster loading during browser rendering. At one checkpoint port 3000 was occupied by a separately started verified repo Next dev server; it was stopped without sending it requests, then every run followed the free-port rule.
