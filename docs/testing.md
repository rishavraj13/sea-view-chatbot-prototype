# Testing

Use Node >=22.12, npm ci, then npm run typecheck, npm run lint, npm test, npm run build and npm run format:check. Tests are offline and pin mock mode through tests/setup.ts; tests/server mirrors src/server.

Repeat endpoint captures: npm run dev -- --hostname 127.0.0.1, then node scripts/capture.mjs in another terminal. Inspect docs/examples/chat.txt and trace.txt: the question brochure video pricing must produce both PDF and video results. Ask pricing for text only; missing brochure for unavailable; quantum unicorn for refusal. POST /api/knowledge/trace with {"question":"missing brochure"} is a convenient manual check.

Fallback: leave the key blank and set MODEL_MODE=live, restart server, rerun capture; mode must remain mock. MODEL_MODE=mock always overrides a configured key. Live provider failures do not silently switch to mock. Test SDK parsing of SSE, history roundtrip, ranking/no match, media resolution, mock scenarios, invalid input, timeout/rate/model error sanitization and trace equivalence.

Limitations: no credentialed Google calls, browser frontend integration, Vercel deployment, external clip uptime or load tests were performed. The SDK stream parser is exercised offline. Real HTTP examples are captured from Next dev, not invented fixtures. See progress-log.md for final output.

## Reality verification follow-up

See [reality-verification.md](reality-verification.md) for actual HTTP captures, SDK consumer commands, mode safety results, known failures, and unverified credentialed live/deployment checks. No API contract change was made. The existing checked-answer behavior is documented in [ADR 007](decisions/007-checked-answer-after-generation.md). This verification is incomplete; do not interpret earlier scaffold/test passes as credentialed live acceptance.

### Credentialed live and Vercel follow-up

The live model was exercised: successful live info text, live chat with both media tools, live trace video, plus real 504 timeouts and 429 rate limits. See [credentialed captures](examples/verification/credentialed-live.json) and the [verification report](reality-verification.md). Preview deployment: https://sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app (protected, explicitly mock). Its three endpoints and PDF returned 200 through authenticated CLI. Deployed Node.js function timeouts are confirmed as 30/30/10 seconds. No API contract changed. Full live acceptance and commit remain pending.

### Live HTTP and preview commands

Run `node scripts/verify-http.mjs http://127.0.0.1:3000 credentialed-live live` against a locally started Next server that loaded `.env.local`. For a paced run, add `35000` as the fourth argument. Each endpoint call is spaced 35 seconds; a seven-case run therefore takes several minutes. The script uses `DefaultChatTransport` and `readUIMessageStream`, preserves raw SSE and parsed results, asserts discriminated media payloads and required tools, and exits nonzero when chat acceptance assertions fail. Trace statuses and actual tool calls are recorded independently and must also be reviewed; a successful chat does not imply successful trace.

Protected preview captures were fetched with `npx --yes vercel@latest curl /api/knowledge/sources --deployment sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app` and equivalent POSTs for chat/trace, with request fixtures from `docs/examples/verification/preview-*-request.json`. The CLI supplies protection authorization without printing it. `node scripts/verify-preview.mjs` parses the captured preview SSE through the actual SDK transport/parser, compares text/media to trace and validates the downloaded PDF signature. This script requires `.next/preview-brochure.pdf`, fetched with authenticated `vercel curl /demo/brochure.pdf` and curl's `--output` option.

Use `npx --yes vercel@latest inspect sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app --json` to verify actual lambda runtimes and timeout metadata. Do not commit `.env.local` or `.vercel/`. Both are confirmed ignored.

### Final live result

Both seven-case suites completed with real Google calls. Info, brochure, video, and combined chat tools have successful live captures, but remaining calls include 429/504 failures. The paced suite exited 1; acceptance and commit remain blocked. See the [complete table and command output](live-verification.md), [first captures](examples/verification/credentialed-live.json), and [paced captures](examples/verification/credentialed-paced.json). Preview endpoints, bundled JSON, SDK parsing and actual 30/30/10-second deployed settings passed. Git is initialized; secret files are ignored. API contracts are unchanged.

## Approved narrow fixes — 2026-10-30

See [approved-fixes-report.md](approved-fixes-report.md) for diagnosis, exact commands/output, full live captures, and separately labelled offline mock captures. All 25 tests, typecheck, lint and build pass. One diagnostic provider call confirms daily project/model quota 20 is exhausted; measured provider latency 671ms, handler 704ms. Exactly three post-fix live attempts, 61 seconds apart, return 429. No retries or quota bypass. The updated commit condition permits these explained live blocks.

Regressions cover dependent query/first turn/topic change; retired, unknown, wrong-type and model-substituted explicit IDs; optional trace history with identical chat validation and pipeline parity. Repeat offline: npm run typecheck, npm run lint, npm test, npm run build. Repeat labelled mock capture: npx --yes tsx --env-file=.env.local scripts/capture-approved-mock.mjs. Repeat live only after quota reset: node scripts/verify-approved.mjs http://127.0.0.1:3000 with a live Next server. Diagnostic script: npx --yes tsx --env-file=.env.local scripts/diagnose-chat.mjs (one chat request, provider call counter and safe quota fields only). ADR 008 records retrieval-query rules and limitations. No model/stream/retry/timeout changes were made.

## Phase 1.7 single-call and provider tests

Run npm run typecheck, npm run lint, npm test, npm run build, npm run format:check. single-call.test.ts injects AI SDK MockLanguageModelV4 through a mocked Google factory and runs the real generateText loop. For info, brochure, video, both, unavailable, unknown and follow-up it asserts exactly one doGenerate call and zero stream calls. It does not replace generateText with a stub. A same-step text-plus-tools case preserves grounded text. Mock-provider errors assert typed safe responses and one attempt. This is offline simulated-live behavior, explicitly labelled MOCK; application MODEL_MODE=mock still makes zero provider calls.

provider-wire.test.ts uses MOCK HTTP responses through each real provider adapter to verify selected MODEL_ID, Google budget, Groq effort and OpenRouter allow_fallbacks:false/require_parameters:true are actually serialized. No inference network calls are made. Other tests verify missing selected key produces explicit mock with selected public metadata.

The bounded live script is `npx --yes tsx --env-file=.env.local scripts/phase17-live.mjs`. It persists call counts in docs/examples/phase17/budget.json and refuses to rerun a provider with recorded task calls. Do not clear this ledger or run the old unbounded scenario scripts in this phase. It invokes the actual /api/chat handler with a Request, instruments real provider HTTP fetches, and reads the resulting SSE with DefaultChatTransport/readUIMessageStream. It does not run a separate HTTP listener. Order: both media, info, retired brochure. Requests are spaced 61 seconds; SDK maxRetries=0 and there are no retry loops. Exactly 3 Google calls, 0 Groq, 0 OpenRouter were made.

Live captures are under docs/examples/phase17. The live info question was refused by the exact grounding boundary; successful 200 status must not be reported as factual-answer success. Earlier safe error examples are historical actual endpoint captures, not new live quota-consuming tests. No deployment in this phase.
