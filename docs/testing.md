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
