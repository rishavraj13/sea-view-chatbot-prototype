# Progress log

## Initial scaffold

Created strict Next.js tooling and binding rules, with successful checks reported in the initial delivery.

## Phase 1 backend completion - 2026-10-30

Added shared pipeline, five demo sources, media tools, generated and visually checked PDF, external sample video, validated routes, offline tests and six ADRs. No database/auth/payments/crawler or new UI.

All final check commands exited 0:

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

> assignment@0.1.0 test
> vitest run

 RUN  v5.0.5 C:/assignment

 Test Files  6 passed (6)
      Tests  16 passed (16)
   Start at  23:15:48
   Duration  627ms (import 76%, transform 10%, setup 6%, tests 6%, worker 2%)
```

Production build passed with all three API routes. Formatting passed. Real endpoint capture: chat 200, trace 200, sources 200, invalid input 400. See api.md and examples/. ESLint 9 remains required for the current Next plugin peer dependencies.

## Assumptions

- The explicit request approves the Phase 1 backend contracts after the original scaffold freeze; backend is frozen again on completion.
- All operator facts, USD 250 pricing, policies, location and example.com URLs are fictional. capturedAt is fixture creation time, not a website capture.
- Newline paragraph chunks, keyword score >=1 and top three are appropriate for this tiny demo corpus; synonyms and vague follow-ups can miss.
- History supports text, step-start and completed server media tool parts; attachments, client tools and incomplete tool states are outside scope.
- Gemini 2.5 Flash is a configurable default; live access depends on deployment credentials and provider model availability.
- Mock is the default and the missing-key fallback. Live errors remain typed errors instead of silently becoming mock.
- Streaming one checked answer delta after generation meets streamed transport; token-by-token latency is deferred for grounding and HTTP error semantics.
- Strict extractive live output may refuse otherwise answerable questions; this is an intentional prototype limitation.
- Static media availability is sufficient; the external short flower clip is a labelled demo, not skydiving footage, and its uptime is not monitored.
- Provider 429 mapping satisfies the rate-limit error requirement; there is no application rate limiter or persistence.
- Public trace intentionally invokes the paid provider in live mode and returns request-local diagnostics only.
- Existing scaffold page/layout are unchanged. Frontend and knowledge-view remain pending.
- No live credentials, Vercel deployment or browser integration were tested. Local HTTP captures and offline SDK stream parsing are the compatibility evidence.
- Next dev appended standard agent guidance to AGENTS.md, retaining all binding user rules.

## Reality verification follow-up

See [reality-verification.md](reality-verification.md) for actual HTTP captures, SDK consumer commands, mode safety results, known failures, and unverified credentialed live/deployment checks. No API contract change was made. The existing checked-answer behavior is documented in [ADR 007](decisions/007-checked-answer-after-generation.md). This verification is incomplete; do not interpret earlier scaffold/test passes as credentialed live acceptance.

### Credentialed live and Vercel follow-up

The live model was exercised: successful live info text, live chat with both media tools, live trace video, plus real 504 timeouts and 429 rate limits. See [credentialed captures](examples/verification/credentialed-live.json) and the [verification report](reality-verification.md). Preview deployment: https://sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app (protected, explicitly mock). Its three endpoints and PDF returned 200 through authenticated CLI. Deployed Node.js function timeouts are confirmed as 30/30/10 seconds. No API contract changed. Full live acceptance and commit remain pending.

### Final live result

Both seven-case suites completed with real Google calls. Info, brochure, video, and combined chat tools have successful live captures, but remaining calls include 429/504 failures. The paced suite exited 1; acceptance and commit remain blocked. See the [complete table and command output](live-verification.md), [first captures](examples/verification/credentialed-live.json), and [paced captures](examples/verification/credentialed-paced.json). Preview endpoints, bundled JSON, SDK parsing and actual 30/30/10-second deployed settings passed. Git is initialized; secret files are ignored. API contracts are unchanged.

## Approved narrow fixes — 2026-10-30

See [approved-fixes-report.md](approved-fixes-report.md) for diagnosis, exact commands/output, full live captures, and separately labelled offline mock captures. All 25 tests, typecheck, lint and build pass. One diagnostic provider call confirms daily project/model quota 20 is exhausted; measured provider latency 671ms, handler 704ms. Exactly three post-fix live attempts, 61 seconds apart, return 429. No retries or quota bypass. The updated commit condition permits these explained live blocks.

Regressions cover dependent query/first turn/topic change; retired, unknown, wrong-type and model-substituted explicit IDs; optional trace history with identical chat validation and pipeline parity. Repeat offline: npm run typecheck, npm run lint, npm test, npm run build. Repeat labelled mock capture: npx --yes tsx --env-file=.env.local scripts/capture-approved-mock.mjs. Repeat live only after quota reset: node scripts/verify-approved.mjs http://127.0.0.1:3000 with a live Next server. Diagnostic script: npx --yes tsx --env-file=.env.local scripts/diagnose-chat.mjs (one chat request, provider call counter and safe quota fields only). ADR 008 records retrieval-query rules and limitations. No model/stream/retry/timeout changes were made.

## Phase 1.7 — 2026-10-31

Implemented one-step provider generation, pure registry media summary, Google/Groq/OpenRouter env selection, configurable model-specific reasoning, and additive public provider/modelId metadata. Updated ADRs and all required docs. No deployment. All 47 tests, typecheck, lint and build pass; full real output is pasted in [phase-1.7-report.md](phase-1.7-report.md). Real-SDK MOCK-provider tests assert one call for seven scenarios and safe typed errors; provider-wire tests validate actual serialized controls.

Exactly three live Google calls, no retries/continuations: both 200/1538ms, info 200/1459ms, retired brochure 200/1480ms; each 1 provider call and 0 reasoning tokens. Groq/OpenRouter 0 calls. Both tools worked in one step; unavailable output worked. Info returned a refusal for a covered question, so factual-answer quality did not pass despite transport success. The old timeout thinking cause remains unproven. Public quota research, unverified limits, assumptions and deployment variables are in the report and providers.md.

## Covered questions — 2026-10-31

Replayed the exact failed question through the offline trace before changes. Retrieval already returned Pricing 3, Package inclusions 2 and Safety 1 at threshold 1. The one allowed additional Google call (1261ms provider / 1325ms handler) proved that the model answered correctly but the backend rejected the trailing URL citation. Answering-stage case (b), more precisely a guard refusal rather than model refusal. No additional live retry. Groq/OpenRouter keys were absent and neither was called.

Fixed citation-placement normalization for verbatim source facts, clarified the prompt and shared context construction. Added bounded source/query lexical normalization and title-length weighting for realistic customer phrasings; threshold stays 1. Retrieval-quality suite passes 21/21, including all six requested questions and four no-matches. Exact live raw output replay succeeds offline in the real SDK pipeline with one MOCK-provider call. Negative grounding tests still reject fabricated, uncited and unknown-source answers. No request/stream/tool-result/provider configuration/deployment change.

Full diagnosis, exact context, captures and assumptions: [covered-info-report.md](covered-info-report.md). All required checks passed:

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

> assignment@0.1.0 test
> vitest run

 RUN  v5.0.5 C:/assignment

 Test Files  13 passed (13)
      Tests  73 passed (73)
   Start at  13:08:59
   Duration  948ms (import 78%, transform 11%, tests 5%, setup 5%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 31ms

  Creating an optimized production build ...
✓ Compiled successfully in 1139ms
  Running TypeScript ...
  Finished TypeScript in 2.2s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 756ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```
