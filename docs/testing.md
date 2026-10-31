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
