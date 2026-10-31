# Rate-limit diagnostics report

2026-10-31. One authorized direct provider request, then offline verification only. No deployment. The pre-existing docs/structured-citations-report.md edit remains untouched and excluded. Production still runs commit d5caf53; the additive observability/retry contract described here is local until a separately authorized deployment.

## Direct diagnostic

A ledger was saved before dispatch. One direct POST to Groq chat/completions used qwen/qwen3.8-27b, max_tokens:1, reasoning_effort:none, a neutral Hello prompt, no redirects and no retry loop. The API key came from .env.local through src/server/config/env.ts; it never appeared in arguments, output or captured files. Only allowed response fields were printed. The success body was not parsed or printed. No second request was made.

Exact output from `node --import tsx --env-file=.env.local scripts/diagnose-rate-limit.mjs`:

```json
{
  "httpStatus": 200,
  "headers": {
    "x-ratelimit-limit-requests": "1000",
    "x-ratelimit-limit-tokens": "8000",
    "x-ratelimit-remaining-requests": "999",
    "x-ratelimit-remaining-tokens": "7986",
    "x-ratelimit-reset-requests": "1m26.4s",
    "x-ratelimit-reset-tokens": "105ms"
  }
}
```

HTTP 200 means no limit blocked this minimal request. retry-after was absent; there was no error.type/code/message to print. The script would validate and check error text for key material before printing those fields on failure. The single-call ledger prevents another invocation in this task.

[Groq rate-limit documentation](https://console.groq.com/docs/rate-limits), checked 2026-10-31, identifies request headers as requests per day and token headers as tokens per minute. Interpretation of the actual response:

| Reported bucket   | Limit | Remaining | Implied usage (limit minus remaining) | Raw reset duration     |
| ----------------- | ----: | --------: | ------------------------------------: | ---------------------- |
| Requests per day  | 1,000 |       999 |                             1 request | 1m26.4s (86.4 seconds) |
| Tokens per minute | 8,000 |     7,986 |                             14 tokens | 105ms (0.105 seconds)  |

These are header bucket values, not completion-token usage or a promised midnight reset. Reset values are relative durations reported at the diagnostic capture; no absolute reset timestamp was provided. Groq's documented Qwen free-plan baseline also lists 30 RPM and 200,000 TPD, but this response does not expose those buckets or their usage/reset. Limits are shared at organization level. No exhausted bucket can be named for the earlier production 429: its upstream error/headers were not captured, and this later one-token success does not reproduce it. Daily-token/per-minute-request usage and the historical exhausted limit remain unverified; no second call was made to investigate further.

## Exact existing error mapping

Code path: runPipeline catch in src/server/chat/pipeline.ts -> mapError in src/server/chat/errors.ts -> chat/trace route catch -> public error response. This revision adds context/logging/retry metadata without changing classification:

1. Existing ChatError is returned as-is, with no new log.
2. Error with name TimeoutError/AbortError -> TIMEOUT, HTTP 504.
3. AI SDK APICallError.isInstance(error) AND statusCode exactly 429 -> RATE_LIMIT, HTTP 429. This covers 429s from any configured provider, regardless of error.type/code/message, including request, token, concurrency or other upstream 429 categories. It does not establish which category occurred.
4. Everything else -> MODEL_FAILURE, HTTP 502: SDK status400/401/403/408/500/503/504 or missing status; plain objects with status/code429; errors whose message merely says rate limit; nested causes are not unwrapped. Invalid input uses existing INVALID_INPUT ChatError handling.

The mapper never infers RATE_LIMIT from a provider-specific code such as rate_limit_exceeded, tokens or RESOURCE_EXHAUSTED without a top-level SDK HTTP429. Upstream APICallError 408/504 stays MODEL_FAILURE; only local abort/timeout names map to TIMEOUT. This preserves the approved scope.

## Additive implementation

- New provider-error.ts sanitizes one server-only JSON line per error reaching the provider boundary (or direct SDK API/abort/timeout mapping). Pipeline supplies selected provider/model. Mapping to ChatError before route catch prevents duplicate logging. Invalid request ChatError values do not log provider failures.
- Event fields: event, provider, modelId, upstreamStatus, errorType, errorCode, rateLimitHeaders. Status/type/code can be null when unavailable. Type/code use validated SDK data or bounded response-JSON fallback; installed @ai-sdk/groq 4.0.74 strips code from its typed error data, so the fallback preserves that diagnostic without logging the body. Error type falls back only to a bounded known exception name.
- Fixed header allowlist: retry-after and six x-ratelimit-{limit,remaining,reset}-{requests,tokens} headers. Counter/duration/date formats are bounded and secret-like values are dropped. Authorization, cookies, arbitrary x-ratelimit names, provider messages, bodies, conversations, URL and stack never enter the log. Known configured keys and common key prefixes are rejected from identifier/model/header values.
- New errorResponseSchema/buildErrorResponse is the shared chat/trace public envelope. Only RATE_LIMIT can have optional error.retryAfterSeconds, a Zod-validated integer 1..3600. Integer delta-seconds clamp (0 -> 1; 5000 -> 3600); valid HTTP dates become server-relative seconds rounded up then clamped. Missing/invalid/negative/fractional input is omitted, never replaced by an invented default. Date behavior depends on the server clock. No raw headers/type/code/message are forwarded to clients.
- No changes to provider choice, model generation, retry count, deadline, input shapes, stream protocol, tool shapes, prompts, knowledge or media. Module public interface adds errorResponseSchema/buildErrorResponse; mapError accepts optional server-side ProviderErrorContext. The two new helper modules have TSDoc.

## Offline evidence

32 new offline tests cover the mapping matrix, idempotence/no duplicate log, header grammar/allowlist/privacy, configured-key rejection, retry present/absent/garbage/0/large/HTTP dates, invalid public-schema values and actual mocked Groq chat+trace route behavior. The routes each perform one mocked provider exchange and one log; private error prose is absent from public response/logs. Six actual OFFLINE MOCK route responses and server log objects are in examples/rate-limit-diagnostics/mock-errors.json. Their mode:live metadata exercises the live code branch with a fake key and fully replaced HTTP; they are not live provider evidence.

Example actual OFFLINE MOCK log:

```json
{
  "event": "provider_error",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "upstreamStatus": 429,
  "errorType": "rate_limit_error",
  "errorCode": "tokens",
  "rateLimitHeaders": { "retry-after": "12" }
}
```

api.md documents both optional-field examples and exact classification/log allowlists; testing.md records repeatable offline commands; progress-log.md records the phase. Historical production smoke captures and its stopped ledger are unchanged. No deployment/tag change.

## Real final verification output

### npm run typecheck (exit 0)

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

### npm run lint (exit 0)

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

### npm run test (exit 0)

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  31 passed (31)
      Tests  435 passed (435)
   Start at  22:34:31
   Duration  6.00s (import 72%, transform 14%, tests 10%, setup 3%, worker 1%)

    Isolate  31 workers spawned · ~698ms startup each (spawn + environment, per file)
             at least ~966ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 45ms

  Creating an optimized production build ...
✓ Compiled successfully in 1900ms
  Running TypeScript ...
  Finished TypeScript in 3.0s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 882ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
