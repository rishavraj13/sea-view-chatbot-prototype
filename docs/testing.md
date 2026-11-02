# Testing

Release branch master (fast-forwarded from frontend); backend-v1 is frozen except the single approved mock media-policy correction (ADR 020). Dependency versions remain frozen. Pass 5 verification was local/offline with explicit MODEL_MODE=mock. The later authorized release deployment and single quota-blocked live request are recorded below; no test skip, timeout increase, suppression or automatic retry was introduced.

## Setup and full gate

Use Node >=22.12 and the committed lockfile. A fresh reviewer checkout can run npm ci; Pass 5 used existing dependencies without installing. Copy .env.example only if .env.local is absent. Never print keys. With no server running, check ports 3000/3100 before/after each command:

```powershell
$env:GIT_PAGER='cat'
Get-NetTCPConnection -State Listen -LocalPort 3000,3100 -ErrorAction SilentlyContinue
$env:MODEL_MODE='mock'
npm run verify:offline
npm run test:e2e
```

No listener rows means the ports are free. verify:offline runs typecheck → lint (--max-warnings=0) → Vitest → production build, serially and stopping on failure. Equivalent individual commands: npm run typecheck, npm run lint, npm test, npm run build. Playwright requires that build and starts next start on 3100 with mock mode, reuseExistingServer:false, one worker, retries:0, test timeout 15s and expect timeout 5s. Stop manual dev/start on 3000 first.

Final Pass 5 gate: 528 unit tests/46 files; all 240 e2e tests across Desktop 1440×900, Tablet 768×1024 and Mobile 390×844 pass. Raw outputs and earlier phase outputs are in examples/release-readiness; see frontend-release-report.md. Current release gaps are listed there rather than inferred away from passing tests.

## Numbered behavior checks

[verification.md](verification.md) is the reviewer walkthrough with expected outcomes for factual source chips, follow-ups, brochure/video/both, missing info, retired/unknown files, error fixtures/Retry, Knowledge trace, keyboard and the quota-sensitive live harness.

| Check                                      | Offline command / evidence                                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Media policy                               | npm test -- tests/server/chat/media-policy.test.ts; 127-row tests/fixtures/media-policy.json                                                                                          |
| Retrieval quality/history                  | npm test -- tests/server/knowledge/quality.test.ts tests/server/knowledge/query.test.ts; 38-row tests/fixtures/retrieval-quality.json                                                 |
| Attribution/guard                          | npm test -- tests/server/knowledge/attribution.test.ts tests/server/chat/attribution-replay.test.ts tests/server/chat/answer.test.ts; 28-pair tests/fixtures/attribution-quality.json |
| Registry/media payloads                    | npm test -- tests/server/media/resolver.test.ts tests/server/chat/explicit-media.test.ts tests/components/chat-tool-cards.test.tsx                                                    |
| Typed errors, safe logging and retry delay | npm test -- tests/server/chat/errors.test.ts tests/components/chat-errors.test.ts; npx playwright test tests/e2e/chat-errors.spec.ts tests/e2e/knowledge-errors.spec.ts               |
| Source anchors/capture/brochure            | npm test -- tests/server/knowledge/anchors.test.ts tests/server/knowledge/cancellation.test.ts tests/server/knowledge/brochure.test.ts                                                |
| Runtime/transport/history                  | npm test -- tests/components/chat-contract.test.tsx; npx playwright test tests/e2e/chat-lifecycle.spec.ts tests/e2e/chat-screenshots.spec.ts                                          |
| Knowledge exact context and shapes         | npx playwright test tests/e2e/knowledge.spec.ts tests/e2e/knowledge-errors.spec.ts                                                                                                    |
| Long-answer presentation                   | npm test -- tests/components/assistant-answer.test.tsx; npx playwright test tests/e2e/assistant-answer.spec.ts                                                                        |

The existing media-policy tests exercise the live branch with MockLanguageModelV4, not a provider network. The approved post-backend-v1 correction (ADR 020) makes explicit mock execution use that same computed policy state/tools. The old examples/release-readiness/mock-negation.json is historical before-fix evidence. Mock prose remains scripted and may carry a diagnostic refusal beside media; that separate behavior is unchanged and does not prove live guard/tool reliability.

Error tests use committed OFFLINE MOCK captures (examples/chat-runtime/errors.json) intercepted by Playwright; mock mode itself does not exhaust provider quota. Provider mapping tests mock upstream HTTP. Countdown fixtures use the controlled browser clock; no sleeps are used. Product copy comes from src/content/foundation.ts, not raw API text.

## Keyboard and screen-reader structure

release-keyboard.spec.ts and helpers/keyboard.ts use actual Tab/Enter/arrows/End/Escape, with no pointer clicks or programmatic focus. The home walk verifies skip link, visible header links/action, intro links, three package ask buttons, native FAQ summaries, footer links and launcher. Hero and plan have no artificial tab stops; their headings remain in the accessible outline. Details toggle through Enter. Knowledge tabs use keyboard selection; its test question is typed and submitted to the local MOCK route using the keyboard.

Each visited control has >=2px solid ink/ember focus outline. Native dialog contains background focus and restores the launcher on Escape; body may briefly be active at Chromium's browser-chrome Tab boundary, but no background control receives focus. Axe label-content-name-mismatch and heading-order checks pass. There is one h1 and no skipped levels on both pages/all selected panels; Knowledge's level-two panel headings fix the former h1→h3 gap. release-metadata.spec.ts checks lang/title/own-page description/responsive viewport/index-follow without canonical, and reduced motion with prefers-contrast:more. Layout fits each viewport. This is an automated accessibility-tree walkthrough, not an unperformed human NVDA/VoiceOver speech session.

```powershell
npx playwright test tests/e2e/release-keyboard.spec.ts tests/e2e/release-metadata.spec.ts tests/e2e/accessibility.spec.ts
```

Existing axe scans run on both pages, populated/error media states and the open dialog, with zero serious/critical violations. Passing these checks does not manufacture a Lighthouse Accessibility score.

## Scroll, colour, image and screenshot checks

```powershell
npx playwright test tests/e2e/hero-scroll.spec.ts tests/e2e/hero-visual.spec.ts tests/e2e/plan-cards.spec.ts tests/e2e/warm-palette.spec.ts
npx playwright test tests/e2e/release-load.spec.ts tests/e2e/release-screenshots.spec.ts
```

Pure pin/passage tests cover before/start/interior/end/past/degenerate geometry. Browser checks cover portal endpoints/midpoint/reversal, title bounds, grade/dots/panels, static reduced motion, ordered responsive cards, loaded 4:3 photos, once-only reveal, float/hover removal and zero horizontal overflow. Computed UI colours include borders/shadows and exclude photos/video/canvas. Full viewport captures are used, not resized full documents or arbitrary waits.

Screenshot contrast sampling uses opaque glyph cores against a separate hidden-title background, excluding antialiasing and the one-pixel moving panel seam. Photo RGB audit captures hide foreground panels/title/dots while retaining the grade/scrim because p=0 otherwise covers the photo. This is sampled evidence, not a guarantee at every subpixel/scroll fraction. See frontend-scroll-report.md for exact RGB/contrast and limitations.

release-load.spec.ts disables browser cache through CDP in a fresh context and records Network.loadingFinished encodedDataLength, plus paint/navigation entries and image selection after scrolling. It uses each project's normal device/DPR, no substituted Lighthouse throttling. Plan image candidates must meet the physical slot within 10% normal bucket rounding. First-load bytes are single-load observations; plan photos below the 220dvh hero are lazy and do not affect initial transfer. Historical before/ captures remain distinct from final load captures.

The earlier agent-side Lighthouse unavailability in Pass 5 is historical. The owner has now supplied the actual local three-run medians, recorded verbatim below; the Lighthouse step is measured, with both Performance values below the 85 internal target. No score is inferred from axe/CDP, and no performance work followed the supplied measurement.

Generated screenshot/JSON captures now use each test’s fresh test.info().outputPath under ignored test-results; committed fixtures/history are not overwritten. The shared helpers/artifacts.ts only changes artifact destinations, not screenshot options/buffers or assertions. Final selected figures are promoted after a successful matrix into docs/screenshots/final-v5 and indexed in design-notes.md. Every requested 1440/390 home top/scrolled, chat-reply and Knowledge-trace viewport was reviewed. Historical filenames remain evidence of their original passes, not a claim of the final UI. PNG recompression is lossless with decoded-pixel identity checks.

## Cleanup, frozen proof and source archive

The throwaway `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` invocation returns no diagnostics. ESLint and a static CSS-module import/class search report no unused classes. A TypeScript alias-aware named-export scan reports no unreferenced frontend declarations; it is not runtime coverage/reflection analysis. Four long CSS modules stay intact because each owns one component; mixed content was split.

`npm run format` uses .prettierignore to protect frozen paths, the lockfile, raw examples and docs/structured-citations-report.md. `npm run format:check` verifies editable files. Generated examples are ignored; curated fixtures/reports remain tracked. Read-only npm audit reports moderate tooling/transitive advisories; no npm audit fix/overrides/install is allowed under the baseline freeze.

```powershell
git diff --stat backend-v1 -- src/server src/app/api data public/demo scripts tests/server
npm ls ai @ai-sdk/gateway
```

Expected: frozen diff is empty; ai 7.0.158, gateway 4.0.131. A throwaway lock comparison verifies every backend-v1 entry's version/integrity, zero changed/removed (157 older frontend additions). Pass 5 adds only a package script, not dependencies or lock entries. Key checks compare readEnv's configured private keys to tracked files without printing values and scan plausible provider-key prefixes; .env.example is the only tracked env file. No hidden key/log/cache/deployment files go into git archive.

After the final commit, `git archive --format=zip --output=<outside-repo-path> HEAD` produces a clean source ZIP. The release report/final delivery lists its location, total size and largest entries. Re-running tests may regenerate tracked historical screenshots/examples: review those diffs and retain final curated release figures rather than silently replacing historical evidence.

## LIVE verifier is separate

`npm run verify:live` and its `-- --base-url` form are documented in verification.md, including existing spent/stopped ledgers, call caps and quota warnings. Never run/reset them as part of verify:offline. The remote eight-turn runner spaces calls >=10s and stops on 429; the historical local runner has its own 25-call/3.1s campaign rules and stopped ledger. New live work needs an explicit budget; none ran in Pass 5.

## Approved backend exception: mock media-policy execution

```powershell
$env:MODEL_MODE='mock'
npm test -- tests/server/chat/mock-media-policy.test.ts
```

Expected: 133/133 cases. Every one of the 127 existing policy rows runs through the explicit mock pipeline and both chat/trace routes. None executes no implicit tool, optional deterministically executes permitted tools, required executes only permitted tools. The chat response is consumed with the real AI SDK transport/parser; completed tool results, mode, text and trace/pipeline media/calls must agree. Global fetch fails if called, and zero calls are asserted. This is separate coverage from the existing live-branch mock-provider exposure tests.

Six extra cases preserve explicit-id behavior for available brochure/video, retired, unknown, wrong-type and noun-free explicit requests. Explicit id resolution remains an intentional independent registry action, including when policy is none; no extra implicit tool may come from a noun inside that id. Missing-asset scripting remains covered by existing tests. No request, stream, payload, guard, retrieval, knowledge/media data or dependency changes. Real gate output and the two-file frozen diff are in mock-media-policy-report.md and examples/mock-media-policy/.

## Owner-supplied Lighthouse measurement — 2026-11-02

The owner supplied these measured results verbatim; no scores were altered, rounded or estimated. Tool: Lighthouse `<VERSION>` (the supplied version placeholder is retained; the actual version was not specified).

Command supplied by the owner:

```text
npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new"
```

Method: default mobile emulation and simulated throttling, 3 runs per page, median reported. Target: local production build (`npm run build; npm run start -- -p 3100`) in explicit mock mode on the owner's Windows machine.

```text
Date: 2026-11-02. Tool: Lighthouse <VERSION>. Command: npx lighthouse <url> --only-categories=performance,
accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new" (default mobile
emulation and simulated throttling), 3 runs per page, median reported. Target: local production build
(npm run build; npm run start -- -p 3100) in explicit mock mode on the owner's Windows machine.
/ : Performance 84 (runs 82, 84, 84), Accessibility 100 (100, 100, 100), Best Practices 96 (96, 96, 96),
SEO 100 (100, 100, 100).
/knowledge : Performance 77 (runs 76, 77, 79), Accessibility 100 (100, 100, 100), Best Practices 96
(96, 96, 96), SEO 100 (100, 100, 100).
```

Performance is below the **85 internal target on both pages**. These are local Lighthouse measurements under simulated mobile throttling, **not field data** or deployed-production scores. No performance work was done after measurement. No unverified cause is attributed to the scores. This replaces the earlier “not measured” status; it does not establish universal Lighthouse certification or a passing performance target.

## v1.0 production deployment verification

Live and explicit mock both deploy application commit 34e8ab05cce1dc3b0b102391a4af502fcaae3800, via clean git archive snapshots. Tag v1.0 moves only for the final docs-only commit; code/config/test/dependency files are unchanged. No .env.local, .vercel, node_modules, local test output or owner's uncommitted content entered the snapshot. The sole approved backend code exception is pipeline.ts and its mock-policy regression test, documented in ADR 020.

Production Vercel inspect confirms nodejs26.x and maxDuration chat30/trace30/sources10 on both projects. Environment-name-only inspection confirms the existing live Groq names and no provider key on mock; settings/protection are unchanged. Anonymous route/media/link/catalog checks passed except long image caching (max-age=0 on source and optimized image responses). The initial sources verifier omitted documented top-level isDemo; corrected against the actual contract, the exact 18-section dataset and registry match. No server/config change was made after the owner instructed continuing remaining verification.

The existing remote smoke entry was run once from a fresh task directory, preserving every previous ledger. Exact equivalent command (cwd in examples/release-v1/smoke-run.json):

```powershell
node C:\assignment\node_modules\tsx\dist\cli.mjs --tsconfig C:\assignment\tsconfig.json C:\assignment\scripts\verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
```

This uses the installed verify:live harness entry; npm run verify:live would additionally load .env.local, unnecessary for remote mode. The fixed harness order begins with brochure, then video/both/inclusions/VIP/follow-up/rain/age; all questions equal the brief's sentences. It allows eight requests, >=10-second start spacing, no retries and stops on first 429. First brochure request returned HTTP429 in 1315ms; one request used, zero retries, stopped429:true, seven unattempted. No direct 1-token quota probe: this ledger does not track an extra direct provider request, so the budget was reserved for smoke. The ledger is now closed for this task; do not resume/reset/retry.

Public body has live/groq/qwen metadata and RATE_LIMIT, no retryAfterSeconds. The matching provider_error log is the fixed allowlisted event (no key/body/conversation); see release-v1-report.md. Both deployed mock scenarios pass independently without provider calls. Remote Playwright specs are skipped: existing config hardcodes baseURL plus local production webServer, without CLI/env override; changing config was forbidden. Anonymous fetch and actual SDK stream consumption provide scoped remote checks without claiming an e2e deployment suite pass.

The final tagged source ZIP is built independently after extraction with npm ci and MODEL_MODE=mock npm run verify:offline, then its temporary tree is submitted for cleanup. Automatic approval review rejected the verified deployed-source cleanup, so that tree remains for owner removal; no alternative deletion method is used. Exact concrete ZIP SHA256/size/largest entries and final extracted-build output are delivered in the outside-repo companion manifest. The release report includes deployed-source archive build output and explains the final docs-only tag move. No live test ran from the archive build.

## Latest authorized live-only smoke — 2026-11-02, 02:40 UTC

A new authorization ran ONLY the existing remote production verifier from a fresh ledger cwd (examples/live-smoke-final-2026-11-02/run.json). No direct VIP/quota probe, other live endpoint test, source/config/test/dependency/deployment change, retry, fallback or workaround. Equivalent installed verify:live entry:

```powershell
node C:\assignment\node_modules\tsx\dist\cli.mjs --tsconfig C:\assignment\tsconfig.json C:\assignment\scripts\verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
```

The unchanged runner orders brochure/video/both/inclusions then VIP→follow-up, rain, age; all sentences exactly match the brief. Every call returned200. Result **7/8 pass**, eight transport requests/provider calls expected, minimum start spacing10.099s, zero retries/reruns, no429. The eight-call cap leaves no room for a failure rerun. Required toolChoice worked for brochure, video and both. Weather FAILED with “I do not have that information.” and zero citations; its failed covered-answer assertions are retained. The cause is not observable from raw served text alone and was not diagnosed with an extra request. No model/retrieval/guard fix or test weakening. [Full raw served answers, sources separately, tools, latencies, checks and wire/SDK evidence](examples/live-smoke-final-2026-11-02/report.md).

The **first release smoke attempt at02:16 UTC returned429 with all advertised buckets full**: request remaining1000/limit1000, token remaining8000/limit8000 and resets1ms, errorType tokens/code rate_limit_exceeded. Public retryAfterSeconds was absent. That historical event is not rewritten, and does not prove the rejecting daily/minute bucket or request-size causation. This new ledger is also closed: eight calls spent, no ninth call authorized.

Only documentation/evidence changes after the run. Existing build/unit/keyboard/browser checks remain separate offline evidence; docs-only validation commands and code-scope proof are captured with this campaign. The requested final docs commit moves v1.0 only with executable source unchanged; the rebuilt clean tagged ZIP is outside the repo, with path/size/SHA256 in its companion manifest. No redeployment occurs.
