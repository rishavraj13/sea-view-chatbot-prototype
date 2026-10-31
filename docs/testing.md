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
