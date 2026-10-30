# Approved backend fixes and diagnosis

The backend freeze was lifted only for diagnosis, follow-up retrieval, explicit registry ID handling, and the optional trace-history extension. Those are the only runtime changes. No change to model, retry count, stream protocol, secrets, modes or duration settings. The existing deployed preview predates these fixes; this task did not redeploy it.

## Diagnosis before fixes

One instrumented chat request asked for brochure and video. It used model gemini-2.5-flash, made exactly 1 Google provider call and returned 429. Provider latency was 671 ms; handler latency 704 ms (before reading the complete returned response). No retries were made. [Safe measured capture](examples/verification/provider-diagnosis.json).

Google's structured quota error identifies GenerateRequestsPerDayPerProjectPerModel-FreeTier with quotaValue 20 for generate_content_free_tier_requests. The daily project/model limit is exhausted. This is stronger evidence than inferring RPM from closely spaced calls. The response requested a 45636-second delay; spacing within a minute cannot restore daily quota.

[Current official rate-limit documentation](https://ai.google.dev/gemini-api/docs/rate-limits), checked 2026-10-30, says active quotas are project/tier/model specific and visible in AI Studio. The public page does not supply universal free-tier RPM/RPD figures for this model. Actual observed project RPD=20; RPM could not be established from the public docs or this error and is not guessed. Limits are per project, not per key; RPD resets at midnight Pacific.

A successful tool turn can make up to 3 provider calls because generateText uses stepCountIs(3): the first call selects tools, subsequent calls consume tool outputs and generate the answer or select more tools. Multiple tools can be selected in one step, so calls are not one-per-tool. A text-only turn normally needs 1 call. Each trace invocation repeats the pipeline and its provider calls. maxRetries=0, so this is multi-step execution rather than automatic retries. This request was stopped at the first call by quota: no claim is made that a successful turn's call count was measured today.

Previous logs show 504 responses at 20.0 seconds, matching the shared request abort deadline. That deadline covers all generateText steps, not 20 seconds per step. The earlier captures lack per-step timing, so we cannot distinguish slow inference from a particular continuation as the historical cause. The current diagnostic reproduces daily 429, not 504.

Proposed quota/latency improvement, NOT implemented: one media-selection provider step followed by a deterministic registry-result summary, avoiding an extra post-tool model call. The current multi-step limit remains unchanged because this task requests a proposal, not that behavior change.

## Approved diff summary

- Add pure buildRetrievalQuery in knowledge: first turn/new topic uses latest user text; referential follow-up uses preceding user text plus latest. No assistant claims become retrieval evidence. retrieve remains pure and unchanged.
- Add a shared media-selection module. Explicit id requests retain their IDs; named media type is respected, otherwise known registry type is used. Unknown, retired and wrong-type IDs reach the resolver. Explicit selections execute the same registry-backed tool handler and are deduplicated; a model cannot silently replace the requested ID with a default. Generic media requests remain model-selected in live mode, scripted in mock mode.
- Extend trace with optional messages using the identical chat history schema and limits. If supplied it is the complete authoritative history; its final user turn drives the pipeline. Required question remains for backward compatibility and is used only when messages is omitted. No new response fields or status codes.
- Add regression tests for first turn, follow-up, topic change, retired/unknown/wrong-type explicit IDs, model ID substitution (MOCK provider), and trace-history validation/parity.
- Add ADR 008 and update API/testing/progress and related architecture/knowledge documentation.

## Live evidence after fixes (not mock)

Exactly one attempt per scenario, 61 seconds between calls; no retries. The daily quota explains the blocked outcomes but does not prove successful live answers or media behavior.

```text
node scripts/verify-approved.mjs http://127.0.0.1:3000
unavailable: HTTP 429, 1854 ms; one attempt, no retries
follow-up: HTTP 429, 745 ms; one attempt, no retries
unknown: HTTP 429, 833 ms; one attempt, no retries
```

[Full live request/response captures](examples/verification/approved-live.json). Unavailable uses chat, dependent follow-up uses trace with the new optional history, unknown uses chat. All return mode:live, RATE_LIMIT; none silently fall back to mock. The follow-up trace body is accepted by validation, reaches the provider, then hits quota.

## Offline mock evidence (no provider calls)

```text
npx --yes tsx --env-file=.env.local scripts/capture-approved-mock.mjs
unavailable: mode=mock, chunks=0, media=unavailable
follow-up: mode=mock, chunks=2, media=
unknown: mode=mock, chunks=0, media=
```

[Explicitly labelled offline mock captures](examples/verification/approved-offline-mock.json). Retired output has id retired, kind unavailable, empty URL and reason unavailable; assistant text says unavailable. Follow-up includes the package inclusions paragraph with citation. Unknown says it does not have that information. These are deterministic shared-pipeline results, not live-model successes.

## Real verification output

All commands below exited 0:

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

 Test Files  8 passed (8)
      Tests  25 passed (25)
   Start at  23:53:23
   Duration  438ms (import 65%, transform 18%, tests 9%, setup 6%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 22ms

  Creating an optimized production build ...
✓ Compiled successfully in 941ms
  Running TypeScript ...
  Finished TypeScript in 1709ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 470ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```

Live behavior remains quota-blocked and explicitly explained. Offline acceptance passes. Commit is authorized under the user's updated condition; secrets and Vercel auth files must stay excluded.
