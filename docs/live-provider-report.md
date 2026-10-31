# Live provider selection — 2026-10-31

## Selection and official documentation

Selected candidate: Groq `qwen/qwen3.8-27b`, configured through MODEL_ID, with MODEL_MODE=live, MODEL_PROVIDER=groq and REASONING_EFFORT=none. The actual live run used explicit process overrides and read the private key from .env.local through the existing validated env module. Local dotenv selectors were not rewritten. The tracked .env.example selects Groq/Qwen while remaining explicitly mock until enabled. No backend code, package versions, guard, prompt, stream, request/tool shapes, deadline or provider fallback changed.

Checked 2026-10-31:

- [Groq limits](https://console.groq.com/docs/rate-limits): the rendered Free Plan tab is selected and lists Qwen at 30 RPM, 1,000 RPD, 8,000 TPM and 200,000 TPD. The page also describes the table as Developer base limits in nearby prose; this inconsistency is not silently reconciled. Saved tab styling, exact row and HTML hash in examples/live-provider/research.json. Exact account RPM/TPD and plan membership remain unverified; live headers confirm 1,000 RPD and 8,000 TPM for this key. Organization limits can apply across users and token/request dimensions.
- [Groq tools](https://console.groq.com/docs/tool-use/overview#supported-models): Qwen 3.8, Minimax M2.7, Muse Spark Open, Llama 3.3 70B and Llama 3.1 8B are listed with parallel tools. GPT-OSS 20B/120B/Safeguard 20B support tools but not parallel calls. Full exact IDs are listed in providers.md. Qwen was chosen for the two-tools-in-one-step requirement. Other models were not called.
- [Qwen model](https://console.groq.com/docs/model/qwen/qwen3.8-27b), [reasoning](https://console.groq.com/docs/reasoning) and [AI SDK Groq integration](https://ai-sdk.dev/providers/ai-sdk-providers/groq): compatible with the existing provider path and reasoning none; no dependency/control changes.
- [Vercel environment variables](https://vercel.com/docs/environment-variables) and [authentication protection](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication): used for a written plan only; no hosted setting changed.

## Method and live outcome

Exactly four provider HTTP calls, spaced by 25 seconds, maximum four enforced by a persistent budget ledger. No retries or additional trace/model call. The actual chat route ran with Request/Response objects and the SDK DefaultChatTransport/readUIMessageStream consumer; latency below includes route and stream consumption, not a remote Vercel/browser network round trip. Provider latency includes reading a cloned successful JSON response. The host/path allowlist permitted only Groq chat completions. Raw upstream error bodies, secrets, authorization headers and hidden reasoning were not logged. All four calls returned HTTP 200; no quota or timeout failures. Google/OpenRouter live calls: zero. No deployment.

| Question                         | HTTP | Provider calls | Provider ms | Route + consumer ms | Result                                                                                                |
| -------------------------------- | ---- | -------------- | ----------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| What if it rains?                | 200  | 1              | 408         | 474                 | PASS: concise weather answer, valid structured citation, no other activities.                         |
| How much is the VIP package?     | 200  | 1              | 351         | 403                 | PASS on price/grounding; presentation defect: dangling Cite: remains.                                 |
| Send me the brochure and a video | 200  | 1              | 574         | 613                 | PASS: both requested tools selected and resolved in one call; existing summary repeats DEMO.          |
| and what's included?             | 200  | 1              | 430         | 454                 | FAIL: no answer or citation; unsolicited brochure tool with unknown id instead of package inclusions. |

The follow-up sent the actual VIP user/assistant exchange (including source parts) before "and what's included?". An offline-only recheck produced query `How much is the VIP package?\nand what's included?` and ranked VIP at 5, What's included at 3, Refunds at 3 (threshold unchanged at 1). Correct package context was available; the observed failure was inappropriate model tool selection rather than an empty retrieval. The tool returned an unknown id consisting of a quote followed by greater-than (`">`); the registry correctly produced an explicit unavailable result. No corrective provider call, switch or code workaround was attempted. Four calls exhaust this task's budget.

Qwen is the configured candidate, not a production-ready recommendation: it failed a required follow-up. These four samples are not a reliability benchmark or a speed comparison with another provider. The dangling `Cite:` and duplicated `DEMO` are reported exactly as observed and remain unchanged.

Full raw machine-readable evidence: [groq.json](examples/live-provider/groq.json). The raw answer blocks below preserve provider prose including its original citation formatting; structured citation URLs are then shown separately. Empty provider text on a successful tool step is shown as an empty JSON string, not misrepresented as generated prose.

## 1. What if it rains?

Raw provider answer:

```text
If your activity is held for weather, you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund. https://www.greedyadventures.com/cancellations#page-content
```

Structured citations:

```json
[
  {
    "type": "source-url",
    "sourceId": "https://www.greedyadventures.com/cancellations#page-content",
    "url": "https://www.greedyadventures.com/cancellations#page-content",
    "title": "If the weather stops the activity"
  }
]
```

Raw provider tool calls:

```json
[]
```

Visible route answer (after existing guard/presentation/registry summary):

```text
If your activity is held for weather, you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund.
```

PASS: concise weather answer, valid structured citation, no other activities. Provider calls: 1; provider 408 ms; route + consumer 474 ms. Guard: accepted. Executed tool results are preserved in groq.json.

## 2. How much is the VIP package?

Raw provider answer:

```text
The VIP package is ฿14,000 per person. Cite: [https://www.greedyadventures.com/experiences/sea-view-skydiving#options]
```

Structured citations:

```json
[
  {
    "type": "source-url",
    "sourceId": "https://www.greedyadventures.com/experiences/sea-view-skydiving#options",
    "url": "https://www.greedyadventures.com/experiences/sea-view-skydiving#options",
    "title": "VIP"
  }
]
```

Raw provider tool calls:

```json
[]
```

Visible route answer (after existing guard/presentation/registry summary):

```text
The VIP package is ฿14,000 per person. Cite:
```

PASS on price/grounding; presentation defect: dangling Cite: remains. Provider calls: 1; provider 351 ms; route + consumer 403 ms. Guard: accepted. Executed tool results are preserved in groq.json.

## 3. Send me the brochure and a video

Raw provider answer:

```text
""
```

Structured citations:

```json
[]
```

Raw provider tool calls:

```json
[
  {
    "id": "qe3n52k9z",
    "type": "function",
    "function": {
      "name": "sendBrochure",
      "arguments": "{}"
    }
  },
  {
    "id": "ph72pk881",
    "type": "function",
    "function": {
      "name": "showVideo",
      "arguments": "{}"
    }
  }
]
```

Visible route answer (after existing guard/presentation/registry summary):

```text
DEMO DEMO brochure - Sea View Skydiving package facts: /demo/brochure.pdf
Sea View Skydiving - page video (external link): https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4
```

PASS: both requested tools selected and resolved in one call; existing summary repeats DEMO. Provider calls: 1; provider 574 ms; route + consumer 613 ms. Guard: not applicable: empty media-tool-only model text. Executed tool results are preserved in groq.json.

## 4. and what's included?

Raw provider answer:

```text
""
```

Structured citations:

```json
[]
```

Raw provider tool calls:

```json
[
  {
    "id": "ztcja56sv",
    "type": "function",
    "function": {
      "name": "sendBrochure",
      "arguments": "{\"id\":\"\\\"\\u003e\"}"
    }
  }
]
```

Visible route answer (after existing guard/presentation/registry summary):

```text
Unknown asset: unavailable.
```

FAIL: no answer or citation; unsolicited brochure tool with unknown id instead of package inclusions. Provider calls: 1; provider 430 ms; route + consumer 454 ms. Guard: not applicable: empty media-tool-only model text. Executed tool results are preserved in groq.json.

## Deployment plan and provider switch

Exact Vercel Production variables:

```dotenv
MODEL_MODE=live
MODEL_PROVIDER=groq
MODEL_ID=qwen/qwen3.8-27b
REASONING_EFFORT=none
GROQ_API_KEY=<private value entered securely in Vercel; never committed>
```

No other provider keys or NEXT_PUBLIC_ variables are required. The key line is a placeholder, not a credential or a literal deployment value. Future deployment/redeployment is required after setting variables; none was performed. docs/deployment-plan.md records the exact dashboard steps to turn off Vercel Authentication and any independently enabled Password Protection/Trusted IP restriction, save, then verify anonymously. README documents explicit Google/OpenRouter switching; there is no automatic provider fallback.

## Assumptions and limitations

The four-call budget counts actual provider HTTP requests, with all application calls routed through the unchanged backend. Using process overrides satisfies the requested MODEL_ID selection without rewriting the local secret file. The production plan specifies intended future configuration, not a readiness endorsement after the failed follow-up. Limits are time/account dependent; table-tab evidence and confirmed header values are separated from unverified account RPM/TPD. A pre-existing user edit to docs/structured-citations-report.md is preserved and excluded from this commit. No live failures were hidden or fixed.

## Real offline command output

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

 Test Files  17 passed (17)
      Tests  128 passed (128)
   Start at  15:35:25
   Duration  1.71s (import 66%, transform 22%, tests 7%, setup 4%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 38ms

  Creating an optimized production build ...
✓ Compiled successfully in 666ms
  Running TypeScript ...
  Finished TypeScript in 1756ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 713ms
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

All four offline checks completed successfully. They do not override the failed live follow-up.
