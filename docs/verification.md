# Reviewer verification guide

Run against the **local production build in explicit mock mode** first. It uses real captured website data but scripted answers; live quality is not established by a mock pass. No provider key is needed. All commands below are offline model checks unless explicitly labelled LIVE. Do not call the hosted live URL during an offline review.

## 1. Prepare and run the gate

Use Node >=22.12 and the existing lockfile (`npm ci` for a fresh reviewer checkout). Copy .env.example only if .env.local is absent. Keep private keys out of terminal/chat/logs. Check 3000/3100 with Get-NetTCPConnection before/after each run. Stop other servers. In PowerShell:

```powershell
$env:GIT_PAGER='cat'
$env:MODEL_MODE='mock'
npm run verify:offline
npm run test:e2e
```

Expected: typecheck, zero-warning lint, all unit tests and build pass; the full browser matrix has zero failures. Playwright starts next start on 3100 with explicit mock mode and reuseExistingServer:false. For manual UI checks, start `npm run start -- -p 3000` after build, then stop it before Playwright. The five underlying commands also work separately: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e.

## 2. Grounded information and source chips

Open `/`, launch Ask about your jump, send “What is included in the package?”. Expected: a labelled mock response using captured text, with a Sea View page source chip; no raw knowledge URL in the prose. Click the chip to open the real page separately only if you intend an external website visit. The full long answer remains in the DOM; Show full answer/Show less changes only its eight-line visual clamp. In live mode the prompt asks concise answers, but mock prose deliberately exposes captured context.

Automated: `npx playwright test tests/e2e/assistant-answer.spec.ts tests/e2e/chat-lifecycle.spec.ts`. Source URL allow-list/deduplication and text identity have unit tests in tests/components.

## 3. Dependent follow-up

Ask “How much is the VIP package?” then “and what's included?”. Expected: previous user/assistant turns are resent as actual SDK message objects; sources reflect the package question. No serialized part types/sourceId appear as model history text. Closing/reopening chat and client-side navigation retain the conversation; reload/New conversation reset it. Old assistant history is capped at 4000 characters, so extremely long diagnostic answers are not all resent.

Automated: `npx playwright test tests/e2e/chat-screenshots.spec.ts tests/e2e/chat-lifecycle.spec.ts`; frozen history/query/single-call tests run in the unit suite.

## 4. PDF delivery

Send “Can you send me a brochure?”. Expected: one registered PDF result, Open/Download actions pointing to /demo/brochure.pdf, and a Demo material badge. This generated sample is not an official website PDF. The deterministic summary describes the registry result; it cannot promise an unregistered file.

Automated: `npx playwright test tests/e2e/chat-lifecycle.spec.ts`; unit media-shape/resolver/summary tests cover discriminants and availability.

## 5. Video and both files

Send “Can I see a video of the experience?” and then “Send me the brochure and a video.”. Expected: video result for the first, both brochure and video for the second. Results use real registered URLs; the video is external and preload=none. Playback errors show a link fallback, not a new asset or fabricated success. Automated tests intercept media failures rather than depending on the external host.

Automated: `npx playwright test tests/e2e/chat.spec.ts tests/e2e/chat-lifecycle.spec.ts`. Live model tool execution is distinct from mock scripted selection. The approved ADR 020 correction makes “Do not send a brochure” return no implicit media in explicit mock mode. The old examples/release-readiness/mock-negation.json is before-fix evidence; the full 127-row mock pipeline/route regression is tests/server/chat/mock-media-policy.test.ts. Scripted choices still do not certify live model choice.

## 6. Missing information

Ask “What is the age limit?”; also try weight limit, clothing or Bangkok pickup price. Expected: “I do not have that information.”, no invented number, no inappropriate media. The static pages do not state these facts. Expected retrieval no-match cases are explicit in the quality table.

Automated: `npx playwright test tests/e2e/chat-lifecycle.spec.ts tests/e2e/knowledge.spec.ts`.

## 7. Retired or unknown file

Ask “Send me brochure id retired”. Expected: registry result kind unavailable and a short customer-safe unavailable message, no working download link. Unknown ids similarly remain unavailable. This preserves explicit-id resolution independently of the model's chosen tool input.

Offline unit command: `npm test -- tests/server/chat/explicit-media.test.ts tests/server/media/resolver.test.ts tests/components/chat-validation.test.ts`. The manifest's unavailable id is retired; do not edit the frozen registry to simulate failure.

## 8. Model failure, rate-limit and retry

Mock mode does not naturally exhaust a provider or generate model failures. Use the committed **OFFLINE MOCK HTTP fixtures** in docs/examples/chat-runtime/errors.json and intercepted Playwright routes. Do not invalidate a real API key or call a provider to reproduce these states.

```powershell
npx playwright test tests/e2e/chat-errors.spec.ts tests/e2e/knowledge-errors.spec.ts
npm test -- tests/server/chat/errors.test.ts tests/components/chat-errors.test.ts
```

Expected: frontend product copy from src/content/foundation.ts, not raw backend/provider text. RATE_LIMIT shows the busy message; a valid retryAfterSeconds disables Retry and counts down; missing/invalid delay permits manual Retry. TIMEOUT and MODEL_FAILURE show their mapped copy. Retry reloads the existing failed chat turn without duplicating the user's message. Knowledge Retry resends the previous submitted body. Fixtures cover INVALID_INPUT and malformed JSON too. Countdown tests use Playwright's controlled clock, not sleeps. The public schema/mapper excludes provider internals and secrets.

## 9. Media policy, retrieval and grounding tables

```powershell
npm test -- tests/server/chat/media-policy.test.ts
npm test -- tests/server/knowledge/quality.test.ts tests/server/knowledge/query.test.ts
npm test -- tests/server/knowledge/attribution.test.ts tests/server/chat/attribution-replay.test.ts tests/server/chat/answer.test.ts
```

Expected: all table rows pass. tests/fixtures/media-policy.json contains **127 rows** (exceeds the 95+ requirement) for none/optional/required and matching tools, including desire/information/negation forms. These policy/provider-wire tests use an offline mock provider in the live pipeline branch, not a real model request. tests/fixtures/retrieval-quality.json has **38** questions with expected top sections/no matches. tests/fixtures/attribution-quality.json has **28** answer/chunk calibration pairs. Invented numeric properties/foreign URLs/unrelated answers reject; supported paraphrases attribute sources. Lexical success does not prove semantic meaning.

## 10. Knowledge inspection and test question

Open `/knowledge`. Expected: exactly eighteen Sources sections with dates/real URLs; native details expose exact text. Media uses actual manifest records, Demo material and available/unavailable status. Test a question → enter a question → Run trace. Expected: submitted question/history, exact source context (possibly empty), ranked chunks/scores, tool call objects/results, resolved media, answer, structured citations and public mode/provider/modelId. No invented retrieval-query field, environment values or private conversation store. On a live backend this valid test consumes one model call; local explicit mock uses none.

Automated: `npx playwright test tests/e2e/knowledge.spec.ts tests/e2e/knowledge-errors.spec.ts tests/e2e/release-keyboard.spec.ts`.

## 11. Keyboard, visuals and accessibility

```powershell
npx playwright test tests/e2e/release-keyboard.spec.ts tests/e2e/release-metadata.spec.ts tests/e2e/accessibility.spec.ts
npx playwright test tests/e2e/hero-scroll.spec.ts tests/e2e/hero-visual.spec.ts tests/e2e/plan-cards.spec.ts tests/e2e/warm-palette.spec.ts
npx playwright test tests/e2e/release-load.spec.ts tests/e2e/release-screenshots.spec.ts
```

Expected: logical Tab order with >=2px warm outlines, native dialog trapping/return, keyboard details/tabs/trace, one h1/no skipped levels, accessible names containing visible labels, and reduced-motion/increased-contrast layouts. Portal values reverse exactly; title fits 390/768/1440; plan remains ordered and responsive; UI colours exclude saturated blue/teal (photos excluded). The image transfer test verifies actual slot/DPR candidate selection. Generated captures/JSON live in each test’s ignored test-results outputPath; browse them there. The release’s selected final figures are promoted into docs/screenshots/final-v5 after a passing run, leaving historical committed evidence untouched. These are automated accessible-tree checks, not a manual screen-reader certification. Screenshot sampling excludes antialiasing/seams as documented in frontend-scroll-report.md.

Lighthouse is absent and installs were prohibited in Pass 5, so three-run mobile medians/targets could not be certified. Do not substitute axe/CDP scores. See frontend-release-report.md for the unavailable before/after table and observed bytes.

## 12. LIVE verifier — separate approval and quota required

**Do not run as part of verify:offline or this pass.** The installed verifier can contact real providers and consumes shared quota:

```powershell
npm run verify:live
npm run verify:live -- --base-url https://sea-view-chatbot-prototype.vercel.app
```

The local form requires live Groq Qwen/none and uses the historical source-attribution ledger (25-call cap, ~3.1s minimum spacing, stop on first 429). That ledger is already stopped/spent; do not delete/reset/resume it to bypass the budget. The remote form runs the eight production scenarios with >=10s spacing, no automatic retries, persistent production ledger and stop on 429. Existing production ledger is also a historical completed campaign. Any new campaign needs explicit authorization, an isolated ledger/output directory and an approved budget; the frozen scripts are not changed in this task. Hosted calls are not equivalent to offline mock assertions.

Expected from an authorized future live run: source-backed factual answers, exact requested tools, honest missing-info refusal, public live/provider/model metadata; failures reported, not hidden by fallback. No live call or new provider-reliability claim was made in Pass 5.
