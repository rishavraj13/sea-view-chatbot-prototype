# backend-v1 deployment and verification

2026-10-31. No application, script, test or configuration code changed. Both sites deploy clean git archive 6710c21ee3dcccd04b591e3b64031c4f3e0b009a. Environment files and the protected pre-existing docs/structured-citations-report.md edit were excluded from uploads. That root edit remains unchanged and outside the release commit.

## Deployments

| Site          | Production URL                                     | Mode / credentials                                                                          |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Live          | https://sea-view-chatbot-prototype.vercel.app      | live, Groq qwen/qwen3.8-27b, reasoning none; existing production environment unchanged      |
| Labelled mock | https://sea-view-chatbot-prototype-mock.vercel.app | explicit mock; same public model metadata, no provider keys, deterministic scripted answers |

Live immutable URL: https://sea-view-chatbot-prototype-j93w5onmm-rishiiwithai-4565.vercel.app (dpl_2aM7vssHSjsa2KmybFNXKgDj9TXd).

Mock immutable URL: https://sea-view-chatbot-prototype-mock-mvx3u2mrj-rishiiwithai-4565.vercel.app (dpl_FYt5GAnCSXNaJgv3hum53Kq5FW3V).

Both deployments are READY/production. Authentication/password protection is off, with no bypass cookies/tokens used. The mock project's only configured env names are MODEL_MODE, MODEL_PROVIDER, MODEL_ID, REASONING_EFFORT; its API environment inventory contained no provider key. Public settings and ids are in examples/backend-v1/deployments.json. No keys were printed or committed. No new direct provider call or provider switch occurred.

Actual successful deployment command output (excerpts):

```text
# Clean live snapshot
vercel deploy --prod --yes --no-color
Inspect         https://vercel.com/rishiiwithai-4565/sea-view-chatbot-prototype/2aM7vssHSjsa2KmybFNXKgDj9TXd
Production      https://sea-view-chatbot-prototype-j93w5onmm-rishiiwithai-4565.vercel.app
▲ Aliased         https://sea-view-chatbot-prototype.vercel.app

vercel project create sea-view-chatbot-prototype-mock --non-interactive
> Success! Project sea-view-chatbot-prototype-mock added (rishiiwithai-4565) [1s]

# Identical clean mock snapshot
vercel deploy --prod --yes --no-color
Inspect         https://vercel.com/rishiiwithai-4565/sea-view-chatbot-prototype-mock/FYt5GAnCSXNaJgv3hum53Kq5FW3V
Production      https://sea-view-chatbot-prototype-mock-mvx3u2mrj-rishiiwithai-4565.vercel.app
▲ Aliased         https://sea-view-chatbot-prototype-mock.vercel.app
```

The CLI's project-create command rejected --yes before any project mutation; its supported --non-interactive form then succeeded. This was an operator option correction, not a deployment/code defect. No code workaround was applied.

## Public checks without model calls

| Check                                     | Live                         | Mock                         |
| ----------------------------------------- | ---------------------------- | ---------------------------- |
| Anonymous homepage                        | 200                          | 200                          |
| Public sources only; exact committed data | 200, 18 sections             | 200, 18 sections             |
| Demo brochure                             | 200, application/pdf, %PDF-  | 200, application/pdf, %PDF-  |
| External video HEAD, no download          | 200, video/mp4               | 200, video/mp4               |
| Invalid chat                              | 400 INVALID_INPUT, mode live | 400 INVALID_INPUT, mode mock |
| Runtime                                   | nodejs26.x                   | nodejs26.x                   |
| maxDuration chat / trace / sources        | 30 / 30 / 10 seconds         | 30 / 30 / 10 seconds         |

Live invalid trace also returned 400 INVALID_INPUT with live/groq/qwen metadata. Actual deployed function metadata came from vercel inspect, not an assumption based on source exports. No environment/conversation fields were present in the sources response; entire data equals the committed public JSON. Full results are examples/backend-v1/live/static-checks.json and examples/backend-v1/mock/checks.json.

## Live smoke results

Used the existing verify:live --base-url entry with a fresh task working directory, preserving all historical stopped ledgers. No code changes or ledger reset. Eight scenarios, eight actual production requests, eight provider calls expected from the deployed one-step/maxRetries=0 code; direct upstream count is not instrumented by the public API. Minimum measured start spacing: **10.101 seconds**. No retries, no reruns, no 429. All eight passed.

| Scenario                             | Result | Tool calls              | Requests | End-to-end latency |
| ------------------------------------ | ------ | ----------------------- | -------: | -----------------: |
| Can you send me a brochure?          | PASS   | sendBrochure            |        1 |            1362 ms |
| Can I see a video of the experience? | PASS   | showVideo               |        1 |             765 ms |
| Send me the brochure and a video.    | PASS   | sendBrochure, showVideo |        1 |             714 ms |
| What is included in the package?     | PASS   | none                    |        1 |            1329 ms |
| How much is the VIP package?         | PASS   | none                    |        1 |            1029 ms |
| and what's included?                 | PASS   | none                    |        1 |             700 ms |
| What if it rains?                    | PASS   | none                    |        1 |            1601 ms |
| What is the age limit?               | PASS   | none                    |        1 |            1445 ms |

**toolChoice required worked live on Groq qwen/qwen3.8-27b for all three file scenarios:** brochure selected sendBrochure, video selected showVideo, both selected both tools in the one generation step. Found registry results retained correct PDF/video kinds and demo provenance. This establishes success for these three observed turns, not a guarantee over arbitrary wording/future calls.

No 429 occurred. error.retryAfterSeconds and a corresponding provider_error runtime event are therefore not applicable; no extra call was made to trigger one. The observability/retry code from 6710c21 is deployed, but live error behavior was not newly exercised by this successful campaign. No failures or omitted scenarios remain in this campaign.

### Exact served answers, with citations separate

These are exact public text deltas/visible answers after the existing guard/presentation, not private pre-guard provider prose. The unchanged API does not expose raw upstream text. Complete public SSE and SDK message objects are preserved in examples/backend-v1/live/results.json, including actual VIP history resent for the follow-up.

**brochure** — Can you send me a brochure?

```text
Here is the brochure (demo material).
```

Sources: none.

Executed tools: sendBrochure (id=brochure, kind=brochure, isDemo=true).

**video** — Can I see a video of the experience?

```text
Here is the video.
```

Sources: none.

Executed tools: showVideo (id=video, kind=video, isDemo=false).

**both** — Send me the brochure and a video.

```text
Here is the brochure (demo material).
Here is the video.
```

Sources: none.

Executed tools: sendBrochure (id=brochure, kind=brochure, isDemo=true), showVideo (id=video, kind=video, isDemo=false).

**included** — What is included in the package?

```text
The Sea View Skydiving package includes a tandem skydive in Pattaya, a safety briefing, a tandem instructor, the aircraft ascent with an ocean-view jump, and a certificate of completion.
```

Sources: [What's included](https://www.greedyadventures.com/experiences/sea-view-skydiving#details).

Executed tools: none.

**vip** — How much is the VIP package?

```text
The VIP package costs ฿14,000 per person and includes a personal cameraman and edited film.
```

Sources: [VIP](https://www.greedyadventures.com/experiences/sea-view-skydiving#options).

Executed tools: none.

**follow-up** — and what's included?

```text
The VIP package includes a tandem skydive in Pattaya, a personal cameraman with an edited film, a safety briefing, tandem instructor support, an aircraft ascent with an ocean-view jump, and a certificate of completion.
```

Sources: [VIP](https://www.greedyadventures.com/experiences/sea-view-skydiving#options), [What's included](https://www.greedyadventures.com/experiences/sea-view-skydiving#details).

Executed tools: none.

**rain** — What if it rains?

```text
Skydiving only runs in safe conditions, so rain could lead to a hold. If your activity is held for weather, you can wait for the next window the same day, move to any other date, or receive a full refund at no cost. There are no charges or admin fees for weather-related moves.
```

Sources: [If the weather stops the activity](https://www.greedyadventures.com/cancellations#page-content).

Executed tools: none.

**age** — What is the age limit?

```text
I do not have that information.
```

Sources: none.

Executed tools: none.

### Actual smoke output

```text
node C:\assignment\node_modules\tsx\dist\cli.mjs --tsconfig C:\assignment\tsconfig.json C:\assignment\scripts\verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
{"id":"brochure","status":200,"passed":true,"transportRequests":1,"latencyMs":1362,"rateLimitHeaders":{},"failures":[]}
{"id":"video","status":200,"passed":true,"transportRequests":1,"latencyMs":765,"rateLimitHeaders":{},"failures":[]}
{"id":"both","status":200,"passed":true,"transportRequests":1,"latencyMs":714,"rateLimitHeaders":{},"failures":[]}
{"id":"included","status":200,"passed":true,"transportRequests":1,"latencyMs":1329,"rateLimitHeaders":{},"failures":[]}
{"id":"vip","status":200,"passed":true,"transportRequests":1,"latencyMs":1029,"rateLimitHeaders":{},"failures":[]}
{"id":"follow-up","status":200,"passed":true,"transportRequests":1,"latencyMs":700,"rateLimitHeaders":{},"failures":[]}
{"id":"rain","status":200,"passed":true,"transportRequests":1,"latencyMs":1601,"rateLimitHeaders":{},"failures":[]}
{"id":"age","status":200,"passed":true,"transportRequests":1,"latencyMs":1445,"rateLimitHeaders":{},"failures":[]}
{"completed":8,"planned":8,"passed":8,"requests":8,"stopped429":false,"reruns":0}
Exit code: 0
```

## Labelled mock verification

An anonymous valid chat request to the mock URL was consumed by DefaultChatTransport/readUIMessageStream. Metadata reports mode:mock; visible text starts `[MOCK] DELUXE` and contains the scripted exact context plus registry summaries, rather than pretending to be live generated prose. Both brochure/video tool outputs arrived intact. Expected provider calls: zero, backed by explicit mock configuration and no provider key. The full response/wire is in examples/backend-v1/mock/checks.json. Source/media provenance remains the same real static knowledge/video and demo brochure; generation mode is independently mock.

Actual assertion output (summary):

```json
{
  "baseUrl": "https://sea-view-chatbot-prototype-mock.vercel.app",
  "mode": "mock",
  "hasMockLabel": true,
  "tools": ["tool-sendBrochure", "tool-showVideo"],
  "providerCalls": 0,
  "passed": true
}
```

The mock deployment is the always-available scripted fallback independent of Groq quota, selected explicitly via its URL. There is **no automatic fallback between sites or from live errors to mock**. Live uses a shared free Groq quota and can return typed RATE_LIMIT with optional retryAfterSeconds; the client can offer manual retry. Frontend/Knowledge view remain pending, and a valid planned Knowledge test consumes one live call on the live site. No UI was added.

## Release decision and scope

All eight smoke scenarios and both deployment check sets passed; no deployment defect required a code change. Release tag: backend-v1 on the final docs-only release commit. Its application/script/test/config source is identical to deployed 6710c21; the later commit adds documentation/evidence only. Existing lexical grounding and model limitations remain: this finite smoke test is not semantic entailment or complete reliability proof. Historical quota-blocked reports remain preserved.

## Real final offline command output

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
   Start at  22:58:50
   Duration  4.95s (import 64%, transform 23%, tests 8%, setup 4%, worker 1%)

    Isolate  31 workers spawned · ~498ms startup each (spawn + environment, per file)
             at least ~689ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 39ms

  Creating an optimized production build ...
✓ Compiled successfully in 459ms
  Running TypeScript ...
  Finished TypeScript in 1956ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 894ms
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
