# Testing and capture verification

Required offline checks: npm run typecheck, npm run lint, npm test, npm run build, npm run format:check. Tests live under tests/server mirroring server modules. tests/setup.ts explicitly selects mock mode and blank keys. MOCK language-provider/HTTP tests exercise the live code path without network access; these are not real-provider success claims.

## Retrieval quality

`npm test -- tests/server/knowledge/quality.test.ts` runs 35 realistic questions with expected top source, including seven no-matches. The six required absent topics are age, weight, health, clothing, Bangkok pickup price and baggage; child eligibility is also absent. `npx --yes tsx scripts/capture-retrieval-quality.mjs` records all scores and the full quality table in docs/examples/real-knowledge/retrieval-quality.json. Threshold is independently asserted to remain 1. Each logical JSON section is one chunk, retaining the complete package/policy context.

## Guard and provenance

answer.test.ts checks accepted number/currency/unit formatting variants, leading/trailing/Markdown citations, unknown citations, wrong currencies/amounts, changed duration/altitude units, unsupported number words and empty media fallback. Its semantic-limit test deliberately shows that a nonnumeric false claim can pass the property guard; do not claim entailment. sources.test.ts verifies real URLs, capture dates, all package taglines, identical inclusion lists, and ECO photos wording without fabricated entitlements. Media tests distinguish real-video, demo-PDF and unavailable flags. Existing mode, history, trace parity, error sanitization and one-call tests remain.

## Actual current route examples

For zero-call examples: select MODEL_MODE=mock, then `npx --yes tsx --env-file=.env.local scripts/capture-real-examples.mjs`. It invokes the actual three route handlers with Request/Response objects and blocks provider fetches. It saves public sources, trace VIP/weather/ECO-photos/unknown responses and media SSE. No separate HTTP listener is started. These records are labelled OFFLINE MOCK; they are not invented live transcripts.

The bounded live script is `npx --yes tsx --env-file=.env.local scripts/real-knowledge-live.mjs` with Google live configuration. It permits exactly the two requested questions, persists a two-call ledger and refuses reruns. Do not clear the ledger or spend further calls in this task. It records raw non-reasoning answer, guard result, actual provider fetch count and latency through the real /api/chat handler. No provider retries or extra continuation calls. Full results are in real-knowledge-report.md.

## Website/media authoring

Two pages were fetched once manually into .next/real-capture, then scripts/build-website-sources.py extracted only the requested sections without network traversal. source-capture.json records hashes/anchors/poster. Exactly one video HEAD check is recorded in video-head.json; do not repeat it as part of automated tests or download the video.

Generate the demo PDF with `python scripts/build-brochure.py <path-to-Unicode-font-with-baht-glyph>`. ReportLab is an authoring dependency, not an application package. Render with pdftoppm and inspect the page; a font-glyph assertion prevents silently missing baht symbols. The current brochure was rendered and reviewed. No browser player/embed test or deployment was performed. Old fictional captures/scripts have explicit supersession notices, not current test data.

## Captured-text and brochure regression checks

`npm test -- tests/server/knowledge/sources.test.ts tests/server/knowledge/brochure.test.ts` checks all 15 source texts for decorative bullet/plus icons, replacement/invisible characters, HTML/entities, image markup and alt-label artifacts. It also asserts the four original inclusion sentences beneath an `Included` heading. The capture script removes the decorative prefixes before storing text.

The PDF test reads the committed binary with the test-only `pdf2json` parser (4.0.2, compatible with the project's Node minimum; no runtime import). It extracts each actual package heading and price and compares them with the source sections, requires three `Included` headings and the demo label, and rejects icon artifacts. It does not compare against a generator-produced sidecar. Regenerate the PDF after editing package data, then run this command; visual rendering remains a separate authoring check.

The cleanup made no additional live calls. The previous Google answers, call counts and timing remain unchanged in `examples/real-knowledge/live-google.json` and are reproduced verbatim in `captured-text-cleanup-report.md`. Refreshed sources/trace/media examples are explicitly OFFLINE MOCK.

## Citation anchors, structured sources and concise prompt

- `python scripts/verify-source-anchors.py` checks every source URL against the captured element-id inventory without network access. `npm test -- tests/server/knowledge/anchors.test.ts` checks the same invariant with Zod-validated capture metadata. The inventory contains the real element ids extracted by HTMLParser from the two pages, their HTTP statuses and hashes of the fetched HTML, not inferred anchor names. It verifies existence at capture time, not ongoing availability. When deliberately refreshing it, `python scripts/verify-source-anchors.py --capture` fetches only those two pages; an unverified fragment fails with a file name and must be replaced by the plain page URL. This is manual static verification, not a crawler.
- `npm test -- tests/server/chat/citations.test.ts tests/server/chat/answer.test.ts tests/server/chat/single-call.test.ts tests/server/chat/route.test.ts tests/server/trace/shared.test.ts` covers supported citation formats, URL removal, URL deduplication, no promotion of uncited chunks, no citations after guard rejection, prompt style/context integrity, and one-call mock-provider replays accepting a weather paraphrase and rejecting an invented figure.
- route.test.ts sends a real route request through DefaultChatTransport and reads it with readUIMessageStream. It asserts text, both completed tools and source-url parts survive parsing and that the returned assistant history is accepted with the existing limits. Invalid or oversized source parts fail Zod validation. Trace parity includes the identical citations array.
- Select `MODEL_MODE=mock`, then run `npx --yes tsx --env-file=.env.local scripts/capture-citations.mjs` for a saved actual route/SDK-consumer example. Provider fetches are blocked. `scripts/capture-real-examples.mjs` refreshes the trace examples through the same pipeline. These are OFFLINE MOCK and make no claims about real provider style or tool reliability.

Groq key presence was checked via readEnv without exposing its value; it was absent. The requested two live scenarios were therefore skipped, with zero calls to Groq, Google or OpenRouter. No substitutes are presented as live captures. No deployment.

## Subsequent live-provider selection — 2026-10-31

The later user-authorized Groq check found the key present. scripts/check-live-groq.mjs ran exactly the four requested scenarios through the actual chat route and DefaultChatTransport/readUIMessageStream with live Groq Qwen. The run used explicit process settings MODEL_MODE=live, MODEL_PROVIDER=groq, MODEL_ID=qwen/qwen3.8-27b and REASONING_EFFORT=none while the key came privately from .env.local via readEnv. Local dotenv selectors were not rewritten.

The one-shot script refuses any existing examples/live-provider/budget.json, counts provider HTTP requests before dispatch, permits only the Groq chat-completions host/path, enforces a hard maximum of four calls and spaces scenarios by 25 seconds. It captures only public text/tool content and numeric quota-limit headers, never keys, request authorization, hidden reasoning or upstream error bodies. The VIP follow-up resends the actual VIP user/assistant exchange, including structured sources. There is no extra trace/model request. Do not remove the ledger or rerun under this task's budget.

See live-provider-report.md and examples/live-provider/groq.json for exact answers, structured citations, tool arguments/results, guard outcomes and timings. Three intended tasks passed; the dependent follow-up failed by selecting a brochure with an unknown id instead of answering. An offline-only replay confirmed the query retrieves VIP first; it did not spend another model call. Dangling Cite: and duplicate DEMO presentation are recorded, not fixed. Four calls total; no retries, provider switch, Google/OpenRouter calls or deployment. The required typecheck/lint/test/build outputs are pasted in the report; the existing offline suite is not evidence that the failed live scenario passed.

## Current server-attribution regression (Qwen only)

`npm run verify:live` uses the actual chat route and DefaultChatTransport/readUIMessageStream with MODEL_MODE=live, MODEL_PROVIDER=groq, MODEL_ID=qwen/qwen3.8-27b and REASONING_EFFORT=none. The private key stays in .env.local through readEnv. Current captures/ledger are in docs/examples/source-attribution, with a hard 25-call cap, a 3.1-second spacing target (minimum requirement three seconds), maxRetries=0 and immediate permanent stop on the first 429. `--failures` permits one separate failure-only attempt only if no 429 stop and budget remains. Never reset the ledger to spend more calls in this task.

```powershell
$env:MODEL_MODE='live'
$env:MODEL_PROVIDER='groq'
$env:MODEL_ID='qwen/qwen3.8-27b'
$env:REASONING_EFFORT='none'
npm run verify:live
# Only when permitted by the ledger and remaining budget:
npm run verify:live -- --failures
```

The preceding 21 scenarios remain. DELUXE price plus its inclusion follow-up adds two turns. With the user's explicit approval, the existing actual rain SDK message is reused for the refund follow-up, adding one turn: 24 planned initial calls and at most one budget-fitting rerun. Real messages, including source/tool parts, are preserved in harness history; the shared pipeline still projects text only. All prior checks remain, with an added visible-language check for context/retrieved/source(s)/section(s). Source parts now come from server attribution, without requiring a model-written URL. Full provider-bound messages, raw answers, separate attributed sources, visible prose, tools, checks, call counts/timing and safe errors are captured.

Groq returned HTTP 429 on call 16; the script stopped. Ten automated passes, five model/tool omissions, one rate-limit failure; eight planned turns and all reruns were unattempted. Do not run the example rerun command for this stopped campaign. Manual review additionally flags the cancellation answer's unasked course rule despite its automated pass. Those observations are not waived by offline success; see source-attribution-report.md. No Llama/Google/OpenRouter call or deployment.

Offline checks:

```text
npm test -- tests/server/knowledge/attribution.test.ts tests/server/chat/attribution-replay.test.ts
npx tsx scripts/capture-attribution-quality.mjs
```

The evidence fixture contains 28 answer/chunk pairs (17 positive, 11 negative), spanning multiple topics and unrelated/near-topic/function-word cases. It compares threshold candidates and checks rank, URL deduplication, no mutation and the two-source limit. The threshold was selected on the pre-live 27-pair matrix; the added function-word regression did not change it. The evidence script saves tokens/matches/coefficients to quality-evidence.json and makes zero provider calls.

Exact saved replays cover URL-free VIP follow-up and mixed price prose, rain/cancel/altitude/VIP/ECO abstention. Both URL-free cases now accept and attribute VIP. Invented price/duration, unrelated text and a fabricated URL reject; an allowed model URL pointing to an unrelated retrieved page cannot choose the attributed page. Existing numeric/currency/unit/range tests remain. Additional OFFLINE attribution-only fixtures cover the quota-blocked DELUXE/refund chains; these are not live model success claims. Shared pipeline/trace parity, actual SDK source/tool history, stream-consumer, payload-shape and one-call tests remain.

After reviewing function-word filtering, offline replay verified all recorded delivered source parts remain unchanged; original live records were retained. The full final typecheck/lint/test/build output is pasted in the report. Historical media-gating/history-revision campaigns remain under their original directories and are not this campaign's budget. The pre-existing citation-report edit stays untouched.

## Required-media policy revision: offline only

No live verification is authorized for this revision. Do not run verify:live or reset its stopped campaign ledger. All new HTTP evidence replaces global fetch completely with MOCK replies and uses a fake key; .env.local is not loaded.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm test -- tests/server/chat/media-policy.test.ts tests/server/chat/groq-wire.test.ts tests/server/chat/prompt-cleanup.test.ts tests/server/knowledge/cancellation.test.ts
npx tsx scripts/capture-retrieval-quality.mjs
npx tsx scripts/capture-attribution-quality.mjs docs/examples/required-media/quality-evidence.json
python scripts/verify-source-anchors.py
npx tsx scripts/capture-prompt-cost.mjs
```

The 95-phrase policy fixture retains the original 42 rows and adds 53. It asserts state, matching tool names, SDK toolChoice and exactly one mock-provider generation per case. Actual Groq serialization tests assert no tools for none, auto for optional, required for requested matching tools, strict empty schemas, simultaneous tool execution and a safe failure without retry when a required response is only a promise. Required is at least one call, not all requested calls; a separate mixed tool-only case deliberately demonstrates lost factual prose. The recorded ECO instruction-describing answer is replayed through the unchanged guard and refused.

Cancellation tests compare four concatenated paragraphs against the saved original fixture, including URL/date/provenance, and test procedural tie ordering without changing scores. Retrieval quality is 38/38, including the four requested cancellation questions and seven no-match cases. Attribution calibration remains 28/28 at 0.5 with two matched words; the two cancellation fixture source titles change to Single-day activities without changing coefficients, matched words or classifications.

The prompt-cost script snapshots committed server/data files from 505b90a under ignored .next, imports both pipelines and completely mocks their HTTP transport. It performs 48 MOCK exchanges across all 24 scenarios, asserting one exchange per pipeline/turn. The same historical SDK histories are used before/after; the missing DELUXE root is explicitly MOCK text emitted through readUIMessageStream. It measures serialized messages + tool schemas + choice characters / 4, not billed tokens or latency. JSON overhead is included. See required-media-report.md for every scenario. The average is below 1,500, so no extra prompt optimization is proposed or implemented. Historical live captures and the stopped ledger remain unchanged.

## Request-form refinement (offline only)

```powershell
npm test -- tests/server/chat/media-policy.test.ts tests/server/chat/history.test.ts
npm run typecheck
npm run lint
npm test
npm run build
```

No live verifier or provider endpoint is called. The 95-row table in tests/fixtures/media-policy.json includes every supplied positive/negative, all question openers, mixed modal clauses, polite noun phrases, verb-less desires and whole-word boundaries. Eight original expectations change to optional; no existing phrase is removed. Every row still checks the one-call mocked provider choice and matching tool set. Will/would at sentence start remain optional under the question-opener precedence; later explicit modal clauses are the documented exception. Unknown verbs or forms are conservative optional/none, not a classifier call.

The additional exact SDK-history replay uses the saved media-history message from examples/history-revision/qwen-qwen3-8-27b-initial.json. Its actual step-start and completed brochure tool-result shape pass the request schema, but only “Here is the brochure (demo material).” becomes assistant model content. Existing end-to-end mocked HTTP tests still use DefaultChatTransport + readUIMessageStream for both structured-source and media histories. No server history conversion was changed. The new command output is in request-form-report.md; prior live records and the stopped campaign ledger are unchanged.

## Direct desires and negated file requests (Part A, offline)

The current media-policy table retains all previous 95 phrases and adds 32 (127 total). Six specified direct/file-action requests become required; Do not send a brochure becomes none with no tools. Direct I want / I'd like / I would like / I need / I'm after forms qualify, except when followed by an information verb. Every existing factual negative stays non-required. Bare Watch/Video/Brochure stay optional. The same mock-provider matrix asserts choice, tool set and one generation, including none/no-tools for explicit negation.

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. This phase must pass all four before commit/deployment. Complete captured output is in desire-form-report.md. No live verifier/provider endpoint is called during Part A. Deployment is separately authorized only after the Part A commit.

## Production deployment checks and smoke campaign

Production: https://sea-view-chatbot-prototype.vercel.app, backend commit d5caf53. Public static/error checks passed without provider calls; actual function metadata is Node 26 with chat/trace maxDuration 30 seconds, sources 10 seconds. The external video was checked once with HEAD only (200 video/mp4).

The verify:live harness now accepts a remote base URL:

```powershell
npm run verify:live -- --base-url https://sea-view-chatbot-prototype.vercel.app
```

**This campaign already stopped on its first 429. Do not rerun this command or reset its ledger in this task.** Remote mode uses a separate docs/examples/production-smoke/budget.json, cap eight, at least ten seconds between starts (10.1-second target), no retries and permanent immediate stop on any 429. It does not touch the previous stopped local campaign ledger. Eight initial scenarios fill the cap; no failure rerun is scheduled. It rejects duplicate remote runs. The SDK transport is restricted to the chosen public /api/chat URL, without credentials/bypass headers or redirects. VIP follow-up history uses the actual SDK message, including structured source parts.

Records include exact public wire/visible text, sources separately, executed tool results, latency, metadata and any retry-after/x-ratelimit-* response headers. Provider-private pre-guard text and wire call counts are not exposed by the unchanged API; they are explicitly null/unmeasured, with the one-call expectation based on the deployed code and offline provider tests. Do not describe the served answer as raw provider prose. The first production request returned the safe RATE_LIMIT body in 695 ms; no rate-limit headers were forwarded by the existing route, so the exhausted bucket cannot be identified. Seven scenarios and all reruns remain unattempted. No live model success or required-tool success is claimed.

Offline harness tests cover public answer/tool/source assertions and a MOCK 429 that proves a single request, header capture and immediate stop without retry. Run `npm test -- tests/server/chat/production-harness.test.ts tests/server/chat/production-budget.test.ts`; these tests make no network/provider calls. The complete final typecheck/lint/test/build output and scenario table are in production-deployment-report.md.

Non-inference deployment checks can be repeated in a separately authorized run with `npx tsx scripts/verify-deployed-static.mjs https://sea-view-chatbot-prototype.vercel.app d5caf5366eb8baa96272c0cc649c2e5fad8740fd`. First export actual Vercel function metadata to .vercel/production-runtime.json as an array of {path,runtime,maxDuration}; use `vercel inspect <immutable-url> --json`, select builds.output for the three API paths and project lambda.runtime/lambda.timeout. This script checks public sources against the committed public JSON, PDF signature, one video HEAD and invalid chat/trace bodies, never valid inference requests.

Quota: this is a shared free Groq quota. Exhaustion produces typed RATE_LIMIT with a retry-later message and no automatic mock fallback. The planned frontend can show a manual retry option. The Knowledge view is pending; its test-question button will use one live call to the same pipeline per valid test, sharing this quota.

## Rate-limit diagnostics and retry contract

The one-request direct diagnostic has already completed with HTTP 200. Do not rerun scripts/diagnose-rate-limit.mjs or reset docs/examples/rate-limit-diagnostics/direct-budget.json in this task. It read the key only through readEnv/.env.local, sent qwen/qwen3.8-27b with max_tokens:1 and no retries/redirects, and printed only status and safe quota/error fields. The success body was not printed or parsed. No second live request, production check or deployment occurred.

```powershell
npm test -- tests/server/chat/errors.test.ts
npm run typecheck
npm run lint
npm test
npm run build
```

The 32 new offline cases exercise unchanged status mapping, present/absent/garbage retry headers, clamping, HTTP dates, schema rejection of invalid integers or retry fields on other errors, actual mocked Groq HTTP through chat and trace, one log per mapped error, safe type/code fallback from response JSON, fixed header allowlisting, key/conversation exclusion and no input-error log. All HTTP in these tests is MOCK; no provider/network call occurs. Six separately captured mocked route responses are explicitly labelled OFFLINE MOCK in examples/rate-limit-diagnostics/mock-errors.json. Raw provider error messages are never made public. Both routes validate the same public error envelope.

Full diagnostic headers, interpretation and real final command output are in rate-limit-diagnostics-report.md. The observed header limits are daily requests and per-minute tokens; a later successful minimal call cannot identify the bucket behind the earlier production 429. This revision is not deployed.

## backend-v1: production redeployment plus labelled mock

Both deploy the clean 6710c21 archive, with no code changes:

- Live: https://sea-view-chatbot-prototype.vercel.app — live Groq qwen/qwen3.8-27b, reasoning none, unchanged environment/key, shared free quota.
- Mock: https://sea-view-chatbot-prototype-mock.vercel.app — explicit mock mode, no provider key, deterministic [MOCK] text and mode:mock metadata, zero provider calls.

Both are anonymously accessible with protection off. Public sources equal the committed 18-section dataset with no extra/env/conversation fields; PDF returns 200/application/pdf/%PDF-; external-video HEAD returns 200/video/mp4; invalid chat returns typed INVALID_INPUT/400. Actual Vercel metadata confirms nodejs26.x and maxDuration 30/30/10 for chat/trace/sources on both. The mock valid chat was consumed with DefaultChatTransport/readUIMessageStream, asserted both media tools and the mock label.

The unchanged verify:live harness was run from a fresh task-specific working directory, preserving every prior campaign ledger. Equivalent entry command used, with no .env.local/key needed in remote mode:

```powershell
# Working directory: C:\assignment\.next\release-checks
node C:\assignment\node_modules\tsx\dist\cli.mjs --tsconfig C:\assignment\tsconfig.json C:\assignment\scripts\verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
```

All eight requested turns passed; eight requests/provider calls expected from the one-step code, no retries, minimum measured start spacing 10.101 seconds. Brochure, video and both returned exactly the requested tools under required choice. No 429 occurred, so no retryAfterSeconds or request-specific provider_error event needed retrieval; logging was not deliberately triggered with an extra call. The cap is spent: do not rerun this campaign. Its files were copied to docs/examples/backend-v1/live before temporary directories were cleared by build. Existing root production-smoke, source-attribution and direct-diagnostic ledgers remain unchanged.

Raw public wire/visible answers, separate sources and executed results are preserved. Private pre-guard provider text and upstream HTTP count remain unobservable over the unchanged API; expected one provider call per turn is based on deployed code/offline tests, while eight public requests are directly measured. No direct provider requests were made in this deployment task. There is no automatic fallback between URLs. Mock is a separately selected, always-available scripted fallback independent of provider quota, not a live model substitute presented as live.

See backend-v1-release-report.md for the full table, every answer, deployment output and real final typecheck/lint/test/build output. The existing protected citation-report edit remains untouched. Source provenance remains real knowledge/video plus a demo PDF, independent of generation mode. The planned Knowledge test button uses one live call per valid test on the live site.
