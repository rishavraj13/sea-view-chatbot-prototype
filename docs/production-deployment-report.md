# Production deployment report

2026-10-31. Part A commit: d5caf5366eb8baa96272c0cc649c2e5fad8740fd (`fix: desire-form media requests`). Part A passed real typecheck/lint/394 tests/build before deployment; complete output is in desire-form-report.md. Part B changes only authoring verification scripts/tests and documentation; deployed backend code is exactly the committed Part A snapshot. The pre-existing structured-citations-report.md edit remains byte-identical and excluded.

## Production

- URL: https://sea-view-chatbot-prototype.vercel.app
- Immutable deployment: https://sea-view-chatbot-prototype-rmstbksqm-rishiiwithai-4565.vercel.app
- Vercel deployment id: dpl_8VzVPqjj9XrQssEHBiEFxDjHAepD; READY, production.
- MODEL_MODE=live; MODEL_PROVIDER=groq; MODEL_ID=qwen/qwen3.8-27b; REASONING_EFFORT=none.
- GROQ_API_KEY configured as a production secret through authenticated CLI stdin from readEnv/.env.local. Its value was never printed, placed in command arguments or committed. No other provider was called.
- Vercel Authentication/password protection disabled through authenticated CLI API; trusted-IP restriction absent. No bypass tokens/cookies used for verification. Unrelated firewall settings unchanged.
- Actual Vercel API metadata: nodejs26.x; chat/trace maxDuration 30 seconds, sources 10. The backend request deadline stays 20 seconds.

A clean `git archive HEAD` snapshot was deployed so the protected uncommitted edit and .env.local were excluded. Public settings evidence is examples/production-smoke/deployment.json. Official [Vercel CLI deployment](https://vercel.com/docs/cli/deploy), [CLI API](https://vercel.com/docs/cli/api), [project updates](https://vercel.com/docs/rest-api/projects/update-an-existing-project) and [Authentication management](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) were checked 2026-10-31. No package/provider or public API contract changed.

Actual CLI deployment output (excerpt; the full CLI also returned the same READY deployment as JSON):

```text
vercel deploy --prod --yes --no-color
Vercel CLI 65.8.0 (Node.js 24.18.0)
Inspect         https://vercel.com/rishiiwithai-4565/sea-view-chatbot-prototype/8VzVPqjj9XrQssEHBiEFxDjHAepD
Production      https://sea-view-chatbot-prototype-rmstbksqm-rishiiwithai-4565.vercel.app
▲ Aliased         https://sea-view-chatbot-prototype.vercel.app
```

## Checks without model calls

| Check                              | Actual result                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Unauthenticated homepage           | HTTP 200, no protection challenge                                                                                      |
| GET /api/knowledge/sources         | HTTP 200, exactly 18 sections; entire response equals committed public sources/media, no extra/env/conversation fields |
| /demo/brochure.pdf                 | HTTP 200, application/pdf, %PDF- signature                                                                             |
| External page video, one HEAD only | HTTP 200, video/mp4; no video downloaded                                                                               |
| Invalid POST /api/chat             | HTTP 400, INVALID_INPUT; live/groq/qwen/qwen3.8-27b metadata                                                           |
| Invalid POST /api/knowledge/trace  | HTTP 400, INVALID_INPUT; same metadata, no provider call                                                               |
| Actual deployed function settings  | nodejs26.x; chat 30s, trace 30s, sources 10s                                                                           |

Full actual bodies/settings: examples/production-smoke/static-checks.json. These are network checks without inference, not live model tests.

## Bounded live smoke

The base-URL harness uses the real deployed /api/chat with DefaultChatTransport/readUIMessageStream, actual SDK history, an independent eight-request budget and a 10.1-second spacing target (at least ten seconds). No retries; first 429 permanently stops the campaign. Previous campaign ledgers are untouched. Eight initial scenarios would exhaust the cap; no extra rerun is scheduled.

| Scenario                             | Result                         | Requests | Expected provider calls | Latency |
| ------------------------------------ | ------------------------------ | -------: | ----------------------: | ------: |
| Can you send me a brochure?          | BLOCKED: HTTP 429 / RATE_LIMIT |        1 |                       1 |  695 ms |
| Can I see a video of the experience? | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| Send me the brochure and a video.    | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| What is included in the package?     | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| How much is the VIP package?         | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| and what's included? (VIP follow-up) | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| What if it rains?                    | NOT RUN: stop-on-429           |        0 |                       0 |       — |
| What is the age limit?               | NOT RUN: stop-on-429           |        0 |                       0 |       — |

Total: one deployed request/provider attempt expected, zero reruns; seven unattempted. Single-call expectation follows the deployed one-step generateText/maxRetries=0 pipeline and offline measured provider mocks. Direct upstream HTTP call count is not exposed by the public API and is labelled unmeasured, rather than presented as instrumented evidence. Only one start occurred, so inter-call spacing is not applicable to this run.

The first attempted scenario uses toolChoice required by the offline-proven policy. **Live Groq required-tool behavior could not be verified because the request was rate-limited before an answer/tool response.** No workaround, provider fallback, mock fallback or later live request was made. No backend-v1 tag was created because smoke acceptance did not pass.

Exact public response:

```json
{
  "mode": "live",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "error": {
    "code": "RATE_LIMIT",
    "message": "The model rate limit was reached. Please retry later."
  }
}
```

Raw served answer: none (JSON error, no text stream). Sources: []. Tool calls/results: []. Private pre-guard provider answer: unavailable through the unchanged API, recorded null. The remote harness preserves exact public wire bytes and keeps visible text, sources and tools separate; it does not invent raw provider captures.

Rate-limit response headers captured from the deployed response: `{}`. Neither retry-after nor any x-ratelimit-* header was forwarded by the existing route. Upstream quota-limit headers are not observable through this API; the exhausted RPM/RPD/TPM bucket and reset time are unverified. No direct provider request was made to obtain them. The user-mentioned approximate 8,000 TPM cannot be confirmed from this response. The safe public message contains no provider internals, quota identifiers or keys.

Actual smoke command output:

```text
npm run verify:live -- --base-url https://sea-view-chatbot-prototype.vercel.app
> assignment@0.1.0 verify:live
> tsx --env-file=.env.local scripts/verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
{"id":"brochure","status":429,"passed":false,"transportRequests":1,"latencyMs":695,"rateLimitHeaders":{},"failures":["HTTP 200","live Groq Qwen metadata","nonempty answer","exact requested executed tools"]}
{"completed":1,"planned":8,"passed":0,"requests":1,"stopped429":true,"reruns":0}
Exit code: 1
```

The “live Groq Qwen metadata” assertion above checks a successful SDK message; none exists on an error, so it fails there. Both actual invalid-input responses and the 429 JSON independently confirm the deployed live/groq/model settings. This is a quota block, not evidence of a provider/model configuration mismatch.

## Quota and UI limitations

The demo uses a shared free Groq quota. Exhaustion returns typed RATE_LIMIT with a user-safe retry-later message and no automatic fallback to mock. The frontend can offer a manual retry option; no UI button is implemented by this backend. The Knowledge view remains pending; its planned test-question button invokes the shared trace pipeline and uses one live model call per valid test, consuming this same quota.

All observations are limited to the deployed Part A snapshot and this one smoke attempt. No inference success, factual answer quality or simultaneous live tool success is claimed. Deployment is public and functional for the non-inference endpoints, while the reviewer experience is currently quota-blocked.

## Final offline verification

The initial Part B authoring checks found missing harness declarations (TS7016/TS7006), then lint also traversed the temporary deployment snapshot under .vercel. Added the matching public .d.mts interface and removed only the verified temporary upload directory after successful deployment. Neither correction changed deployed backend code, lint rules or request contracts. No further deployment/live request occurred. Final outputs follow.

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


 Test Files  30 passed (30)
      Tests  403 passed (403)
   Start at  21:26:29
   Duration  2.22s (import 70%, transform 16%, tests 8%, setup 4%, worker 2%)

    Isolate  30 workers spawned · ~279ms startup each (spawn + environment, per file)
             at least ~364ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 29ms

  Creating an optimized production build ...
✓ Compiled successfully in 339ms
  Running TypeScript ...
  Finished TypeScript in 1515ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 616ms
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
