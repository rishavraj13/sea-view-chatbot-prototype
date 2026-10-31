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

## Media gating and repeatable live regression

`npm run verify:live` uses the committed dev-only tsx runner, invokes the actual chat route in-process, and consumes SSE with DefaultChatTransport/readUIMessageStream. It requires MODEL_MODE=live, MODEL_PROVIDER=groq, MODEL_ID and a private GROQ_API_KEY in .env.local through readEnv. For PowerShell process overrides:

```powershell
$env:MODEL_MODE='live'
$env:MODEL_PROVIDER='groq'
$env:MODEL_ID='qwen/qwen3.8-27b'
$env:REASONING_EFFORT='none'
npm run verify:live
npm run verify:live -- --failures
```

The second command is a separately recorded failure-only attempt, not an internal retry. A documented parallel-tool alternative can be selected explicitly if Qwen retains defects. All models/attempts share docs/examples/media-gating/live-budget.json: maximum forty provider HTTP calls, a 3.1-second scheduling target (measured minimum 3.097 seconds, above the required three seconds), maxRetries=0 and stop on the first 429. A completed model/attempt cannot run twice. `--resume` selects only unattempted initial cases after a process interruption; it never repeats recorded failures. VIP history retains the actual user request and includes an assistant reply only if one exists. No invented history. This campaign is exhausted: do not reset its ledger or make more calls. For a future independently authorized campaign, archive the complete previous capture directory before starting afresh.

The eighteen amended cases are in scripts/live-scenarios.mjs: the exact four brief examples, including the negative inclusion question; three extra brief positives; rain/cancellation; VIP plus dependent follow-up; ECO photos; altitude; retired brochure id; and age/weight/pickup-price/clothing refusals. Assertions cover status, one provider call, visible text, no raw URL/Cite/empty wrapper, model/executed tool choice, structured factual sources, refusal with no sources on missing knowledge, registry unavailability and demo-flag consistency. Prose is not matched exactly apart from detecting the established refusal. This is not semantic entailment: inspect raw answers too. Captures include raw model text, separate sources, tools/results, call-start timestamp, provider/route timing, check results and safe wire errors. No keys, authorization, hidden reasoning or upstream error bodies are logged. External request/capture/config/provider data are Zod-validated at their boundaries.

`npm test -- tests/server/chat/media-intent.test.ts tests/server/chat/single-call.test.ts tests/server/chat/citations.test.ts tests/server/chat/media-summary.test.ts tests/server/chat/live-assertions.test.ts` checks the intent table, absent tools for negatives even with prior media history, strict empty tool inputs/arbitrary-id rejection, one-call execution, exact saved VIP replay and each attached citation-label variant, normal source wording, customer-safe summaries and live-assertion failure detection. Existing trace/SDK-consumer/result-shape tests remain.

Real results and raw answers are in media-gating-report.md. Qwen passed 15/18 initially and 17/18 after three failure-only reruns. Retired media remained a failure. The alternative returned typed model errors; only one alternate failure could be rerun before forty calls. A harness bug after the failed alternate VIP request was corrected and only unattempted scenarios resumed. No backend/model workaround, Google/OpenRouter call or deployment.
