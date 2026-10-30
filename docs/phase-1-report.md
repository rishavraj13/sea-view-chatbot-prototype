# Phase 1 report

Backend complete. No new UI. Backend frozen pending approved contract changes.

## File tree

```text
.env.example
.gitignore
.prettierignore
.prettierrc.json
AGENTS.md
README.md
data/knowledge/booking.json
data/knowledge/packages.json
data/knowledge/pricing.json
data/knowledge/safety.json
data/knowledge/weather.json
data/media/manifest.json
docs/README.md
docs/ai-assistance.md
docs/api.md
docs/architecture.md
docs/decisions/001-media-tools.md
docs/decisions/002-keyword-retrieval.md
docs/decisions/003-full-history.md
docs/decisions/004-mock-mode.md
docs/decisions/005-shared-pipeline.md
docs/decisions/006-serverless-data.md
docs/examples/brochure-preview.png
docs/examples/chat.txt
docs/examples/invalid.txt
docs/examples/sources.txt
docs/examples/trace.txt
docs/knowledge-and-media.md
docs/progress-log.md
docs/testing.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package-lock.json
package.json
public/demo/README.md
public/demo/brochure.pdf
scripts/capture.mjs
src/app/api/chat/route.ts
src/app/api/knowledge/sources/route.ts
src/app/api/knowledge/trace/route.ts
src/app/layout.tsx
src/app/page.tsx
src/server/chat/errors.ts
src/server/chat/index.ts
src/server/chat/pipeline.ts
src/server/chat/provider.ts
src/server/chat/validation.ts
src/server/config/env.ts
src/server/config/index.ts
src/server/knowledge/index.ts
src/server/media/index.ts
src/server/trace/index.ts
tests/scaffold.test.tsx
tests/server/chat/pipeline.test.ts
tests/server/chat/route.test.ts
tests/server/knowledge/retrieval.test.ts
tests/server/media/resolver.test.ts
tests/server/trace/shared.test.ts
tests/setup.ts
tsconfig.json
vitest.config.ts
docs/phase-1-report.md
```

## Public interfaces

(TSDoc is in each index):

- config: readEnv() -> validated deployment settings; server only.
- knowledge: Source, Chunk, sources, retrieve(question, corpus?) -> Chunk[].
- media: MediaResult, mediaResultSchema, registry, resolveMedia(id, type, assets?) -> MediaResult.
- chat: ChatRequest, chatRequestSchema, traceRequestSchema, runPipeline(request, options?) -> Promise<Trace>, ChatError, mapError(error), modelMode().
- trace: Trace, buildTrace(mode, chunks) -> Trace.

## Environment example

```dotenv
MODEL_MODE=mock
# Set MODEL_MODE=live and a key to enable Google; missing key falls back to mock.
GOOGLE_GENERATIVE_AI_API_KEY=
GOOGLE_MODEL=gemini-2.5-flash

```

## Real verification output

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

Build and format check also passed.

## Documentation created or changed

README.md; docs/README.md; architecture.md; api.md; knowledge-and-media.md; testing.md; progress-log.md; ai-assistance.md; this report; six ADRs under docs/decisions; four raw captures and brochure preview under docs/examples; public/demo/README.md.

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
