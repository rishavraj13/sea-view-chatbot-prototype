# Phase 1.7 backend revision report

Date checked: 2026-10-31 (Asia/Calcutta). No deployment was made. Provider and model switches are explicit; request shapes, SSE protocol and tool-result schemas are unchanged. Only approved public provider/modelId metadata is additive.

## Diff summary

- Remove stepCountIs(3): real live turns use the default single generateText step, maxRetries=0. All selected tools execute locally in that step, with no post-tool model continuation.
- Add pure summarizeMedia based solely on registry outputs. Retain grounded same-step text and supply the registry summary for media. Existing source-grounding checks remain.
- Add Zod-validated MODEL_PROVIDER, MODEL_ID, matching provider keys, and reasoning controls in env.ts. Google, Groq and OpenRouter use their matching provider packages. Missing selected key remains explicitly labelled mock; errors never switch providers or mode. OpenRouter backend fallbacks are disabled and tested on the wire.
- Add Zod public modelMetadataSchema, ModelMetadata, provider/modelId to chat start/finish metadata and trace, and public selection in typed error envelopes. No keys or reasoning content are exposed.
- Add real-SDK MOCK-language-provider tests for seven one-call scenarios, same-step grounded text, safe errors, provider wire controls, mode safety and metadata validation.
- Update ADRs 001/007 and add ADR 009; update README, api, architecture, testing, progress-log and ai-assistance. Provider research is in providers.md.

## Provider research and selection

See the [dated provider table](providers.md) for official doc links, exact limits and unverified items. Only Google had a locally configured key. Thus Google was the best available credentialed candidate, not a measured cross-provider winner. Groq/OpenRouter integration is verified offline through actual adapter wire serialization; credentialed reliability remains unverified. No credentials were requested in chat or printed.

Google's active free RPM/RPD is project-specific in AI Studio; the prior measured project RPD was 20, not a universal limit. Groq free limits for the default Llama model remain unverified in its current rendered table; displayed Qwen 30 RPM/1,000 RPD needs plan confirmation. OpenRouter's official free-model markdown table states 20 RPM and 50 RPD below 10 purchased credits, or 1,000 RPD at/above that threshold, subject to account rules.

## Diagnosis and latency

Earlier 504s hit the shared 20-second deadline. The old multi-step loop and default model reasoning were both potential contributors; historical captures do not contain enough per-step or thinking-token evidence to determine causation. We cannot truthfully claim that thinking was the proven cause.

The new Google 2.5 Flash budget defaults to 0, and all three successful provider responses reported 0 reasoning tokens. Their roughly 1.5-second latency is encouraging but is not a controlled old/new benchmark. Keep the existing 20-second deadline and route maxDuration. Known model-specific reasoning controls and unsupported-model limitations are documented in providers.md.

## Live calls — actual, not mock

The actual /api/chat handler was called in-process with Request objects; real provider HTTP fetches were instrumented. SSE was then consumed by the actual AI SDK client transport/parser. No separate HTTP listener was started. Only three Google inference calls were made, with 61-second spacing. Groq=0, OpenRouter=0. A persistent per-provider budget prevents automatic reruns. No request retries, provider continuations or fallback calls.

| Scenario    | Status | Provider calls | Handler latency | Provider latency | Reasoning tokens | Outcome                                                                                                                                                                              |
| ----------- | ------ | -------------- | --------------- | ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| both        | 200    | 1              | 1538 ms         | 1474 ms          | 0                | Both sendBrochure and showVideo selected in one model step; registry payloads and summary intact.                                                                                    |
| info        | 200    | 1              | 1459 ms         | 1447 ms          | 0                | Call/transport successful, but existing grounding behavior returns information-missing refusal for covered question. Factual-answer quality failure, not reported as answer success. |
| unavailable | 200    | 1              | 1480 ms         | 1476 ms          | 0                | Retired brochure resolved unavailable with empty URL; text explicitly says unavailable. Explicit-ID binding ensures resolution independently of model selection.                     |

Full real [live captures](examples/phase17/live-google.json), including SSE, parsed text and tool results, public metadata and measured fetch counts. [Budget ledger](examples/phase17/budget.json). No additional inference was used to manufacture an error or retry the info refusal. The unavailable result may be executed from the explicit-ID handler before generation, so it is not evidence that the model independently chose retired. The both case has no explicit IDs and demonstrates actual dual-tool selection.

```text
npx --yes tsx --env-file=.env.local scripts/phase17-live.mjs
both: google, HTTP 200, provider calls=1, latency=1538ms, tools=tool-sendBrochure,tool-showVideo
info: google, HTTP 200, provider calls=1, latency=1459ms, tools=
unavailable: google, HTTP 200, provider calls=1, latency=1480ms, tools=tool-sendBrochure
```

## Error UX

Current MOCK-provider route tests show 429 -> RATE_LIMIT, deadline abort -> TIMEOUT and other provider failures -> MODEL_FAILURE. They assert exactly one provider attempt, unchanged mode:live, and no secret, quota identifier, provider body or stack in the public JSON. Actual earlier real responses for all three are included in api.md and [historical-safe-errors.json](examples/phase17/historical-safe-errors.json); they are explicitly historical because no new error inference calls were spent this phase.

## Real offline check output

The following commands exited 0:

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

 Test Files  11 passed (11)
      Tests  47 passed (47)
   Start at  12:53:26
   Duration  820ms (import 77%, transform 10%, tests 7%, setup 5%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 32ms

  Creating an optimized production build ...
✓ Compiled successfully in 344ms
  Running TypeScript ...
  Finished TypeScript in 1705ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 711ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```

Offline call-count tests use the real SDK with MockLanguageModelV4, not a mocked generateText function. MODEL_MODE=mock itself intentionally makes zero provider calls; do not confuse that scripted mode with the MOCK-language-model tests of the live pipeline. The seven cases each assert exactly one doGenerate and zero streaming calls.

npm audit separately reports 17 moderate advisories in the existing lint dependency chain, no high/critical findings. Remediation of those unrelated packages was not included in this narrowly scoped phase. Package selection did not require changing the existing AI SDK or unrelated packages.

## Deployment variables (no deployment performed)

MODEL_MODE, MODEL_PROVIDER, MODEL_ID; exactly the selected key (GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY); optional GOOGLE_THINKING_BUDGET, GOOGLE_THINKING_LEVEL, REASONING_EFFORT. Legacy GOOGLE_MODEL is a Google-only fallback if MODEL_ID is absent. Never expose keys as NEXT_PUBLIC variables or in model IDs. Missing selected key is explicitly mock. Restart/redeploy when configuration changes in a future deployment task.

## Assumptions and limitations

- Provider/model defaults are examples, not permanent availability or reliability guarantees. Model choice and reasoning compatibility are deployment responsibilities.
- Groq/OpenRouter credentialed generation and comparative performance are unverified because no keys were supplied.
- Same-step text is retained only within the existing grounding boundary. This deliberately preserves the original no-guessing requirement, but the observed info refusal remains a quality limitation. The raw model prose was not captured, so its rejection vs the model's own refusal cannot be distinguished retrospectively.
- Explicit unavailable-ID pre-resolution remains authoritative, matching the previous approved registry fix. Trace toolCalls mean executed server handlers, not necessarily model-originated selections.
- One-step generation cannot reason over tool outputs in a second step; the registry summary replaces that call.
- Current metadata describes the configured selection even in explicit mock mode. It is not evidence of a network call.
- No frontend, database, auth, payments, crawler, automatic model/provider fallback, request deadline change or deployment was added.
- The user explicitly confirmed that local models are out of scope. No Ollama adapter or enum extension was made. Groq/OpenRouter remain unranked because their keys are absent; neither is claimed to have passed live verification.

Final provider-error adapter tests also verify one safe 429 attempt on each configured provider with all three MOCK keys present; none silently selects another provider or mock mode. Formatting and git diff --check passed.
