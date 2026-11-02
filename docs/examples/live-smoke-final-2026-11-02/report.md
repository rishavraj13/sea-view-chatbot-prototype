# Live production smoke — 2026-11-02, 02:40 UTC

Endpoint: https://sea-view-chatbot-prototype.vercel.app. Deployed source is unchanged34e8ab0; task started on master at46e8343. Existing verify:live --base-url harness and production scenario checker were run unchanged from a fresh outside-repo cwd (run.json). Old ledgers were neither edited nor reset. No code/config/dependency/deployment change, direct provider probe or other live request.

## Result

7/8 PASS, all HTTP200, eight transport requests, zero retries/reruns, minimum measured request-start spacing10.099 seconds. Budget8/8 consumed; no failures can be rerun inside this cap. No429 in this campaign, so no new public rate-limit body or corresponding provider_error event exists to fetch. Prior first-smoke evidence remains separately preserved.

Required toolChoice worked on Groq qwen/qwen3.8-27b, reasoning none (unchanged configured provider), for all three observed requests: brochure→sendBrochure, video→showVideo, both→both tools. Completed result kinds/ids/provenance validated through the existing AI SDK consumer. This is observed success for these turns, not a guarantee for arbitrary future wording.

The weather question failed: HTTP200 with a served refusal and no structured citations despite being a covered scenario. No raw pre-guard provider text is public, so this run does not establish whether generation or the guard caused the refusal. No diagnostic/live extra request, fallback, sanitizer or code workaround was added. Age-limit refusal is expected and passes. The VIP-dependent follow-up used the actual SDK VIP turn in history and passed.

## Exact scenario table

The unchanged harness orders brochure/video/both/inclusions first (rather than inclusions first in the brief), retaining the exact eight question strings and VIP→follow-up chain. No script was changed just to reorder. Table below is in actual execution order.

| Question | HTTP | Result | Tool calls | Latency | Started UTC |
|---|---:|---|---|---:|---|
| Can you send me a brochure? | 200 | PASS | sendBrochure | 633ms | 2026-11-02T02:40:18.438Z |
| Can I see a video of the experience? | 200 | PASS | showVideo | 722ms | 2026-11-02T02:40:28.537Z |
| Send me the brochure and a video. | 200 | PASS | sendBrochure, showVideo | 635ms | 2026-11-02T02:40:38.637Z |
| What is included in the package? | 200 | PASS | none | 743ms | 2026-11-02T02:40:48.748Z |
| How much is the VIP package? | 200 | PASS | none | 526ms | 2026-11-02T02:40:58.859Z |
| and what's included? | 200 | PASS | none | 695ms | 2026-11-02T02:41:08.974Z |
| What if it rains? | 200 | FAIL | none | 587ms | 2026-11-02T02:41:19.079Z |
| What is the age limit? | 200 | PASS | none | 575ms | 2026-11-02T02:41:29.181Z |

Provider-call count: eight endpoint requests directly measured; eight provider calls expected from the unchanged one-generateText/maxRetries0/no-continuation pipeline. Exact upstream dispatches are not instrumented through the public API; the harness honestly stores measured:null rather than fabricating an upstream measurement. Each record has one transport request and live/groq/qwen metadata.

## Raw served text, sources separately

These are exact text parts received from the production SSE response after server checking/presentation, not inaccessible raw upstream prose. No spelling, wording, capitalization, line break or figure is corrected here. Full wire/SDK histories/tool payloads/checks are in campaign/results.json.

### Can you send me a brochure?

```text
Here is the brochure (demo material).
```

Sources:

None.

Tools:

- sendBrochure: id=brochure, kind=brochure, isDemo=true, url=/demo/brochure.pdf

Latency: 633ms. One transport request; one provider call expected. Result: PASS.

### Can I see a video of the experience?

```text
Here is the video.
```

Sources:

None.

Tools:

- showVideo: id=video, kind=video, isDemo=false, url=https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4

Latency: 722ms. One transport request; one provider call expected. Result: PASS.

### Send me the brochure and a video.

```text
Here is the brochure (demo material).
Here is the video.
```

Sources:

None.

Tools:

- sendBrochure: id=brochure, kind=brochure, isDemo=true, url=/demo/brochure.pdf
- showVideo: id=video, kind=video, isDemo=false, url=https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4

Latency: 635ms. One transport request; one provider call expected. Result: PASS.

### What is included in the package?

```text
Your Sea View Skydive package Includes a tandem skydive in Pattaya, a safety briefing, instructor support for the ocean-view jump, and a certificate of completion.
```

Sources:

- What's included — https://www.greedyadventures.com/experiences/sea-view-skydiving#details

Tools:

None.

Latency: 743ms. One transport request; one provider call expected. Result: PASS.

### How much is the VIP package?

```text
The VIP package for the Sea View Skydiving experience costs ฿14,000 per person.
```

Sources:

- VIP — https://www.greedyadventures.com/experiences/sea-view-skydiving#options

Tools:

None.

Latency: 526ms. One transport request; one provider call expected. Result: PASS.

### and what's included?

```text
The VIP package includes a personal cameraman, an edited film, a tandem skydive experience in Pattaya, safety briefing and instructor support, an aircraft ascent with an ocean-view jump, and a certificate of completion.
```

Sources:

- VIP — https://www.greedyadventures.com/experiences/sea-view-skydiving#options
- What's included — https://www.greedyadventures.com/experiences/sea-view-skydiving#details

Tools:

None.

Latency: 695ms. One transport request; one provider call expected. Result: PASS.

### What if it rains?

```text
I do not have that information.
```

Sources:

None.

Tools:

None.

Latency: 587ms. One transport request; one provider call expected. Result: FAIL.

### What is the age limit?

```text
I do not have that information.
```

Sources:

None.

Tools:

None.

Latency: 575ms. One transport request; one provider call expected. Result: PASS.

## Prior first attempt — 02:16 UTC

The first release smoke attempt at2026-11-02T02:16:41.802Z returned HTTP429 on brochure, latency1315ms, and stopped immediately. Its provider_error event reported all advertised buckets full: requests limit1000/remaining1000, tokens limit8000/remaining8000, both resets1ms. Type tokens/code rate_limit_exceeded; no retry-after or public retryAfterSeconds. This does not prove which daily/minute bucket caused that earlier rejection, nor does it establish request-size causation. Historical public body/event are in ../release-v1/live-smoke/results.json and ../release-v1/provider-error-events.json, unchanged. The new successful calls do not retroactively change that evidence.

The shared free Groq quota remains a limitation with manual Retry and no automatic provider/mock fallback. The separate labelled scripted mock site remains available; mock behavior does not certify live quality. The current live campaign is7/8, not a fully green submission claim.

## Scope

Only README.md, docs/testing.md, docs/progress-log.md and this task's documentation/evidence are changed. No source, tests, configs, dependencies, prior ledgers or deployment changed. No new Vercel log query is needed because all new responses are200. Existing image-cache waiver and owner-supplied local Lighthouse scores stay unchanged. Eight-call cap is spent; no9th request or rerun.


## Real offline documentation-phase validation

These checks do not call a live model. No build/e2e/deployment or further smoke scenario was run in this task.

### npm run typecheck

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

### npm run lint

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

### npm test

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  47 passed (47)
      Tests  661 passed (661)
   Start at  08:14:30
   Duration  5.81s (import 36%, setup 22%, environment 19%, transform 14%, tests 9%, worker 1%)

     Import  236 modules were evaluated 1947 times · 20.79s total, 36% of tracked time
             ~654ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

