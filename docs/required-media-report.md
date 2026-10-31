# Required-media choice and prompt cleanup report

2026-10-31. All verification in this revision is OFFLINE. Zero live provider calls, deployments or provider switches. Requests, stream/source shapes, provider enum, tool-result shapes, deadlines, numeric guard and attribution threshold are unchanged. The pre-existing docs/structured-citations-report.md edit is untouched and excluded from the commit.

## Diagnosis

Command: `git diff e587c72..505b90a -- src/server/chat/answer.ts src/server/chat/pipeline.ts`. The complete diff is saved in examples/required-media/prompt-tool-diff.json (including the prior guard changes for context). Every prompt/tool-use-relevant difference:

1. Supplied-section facts with exact URL citations became supplied facts with no URLs/labels and server-provided references.
2. The concise-answer rule gained direct customer speech and prohibited context/retrieved/source/section language.
3. A new answer-only-what-was-asked rule prohibited unasked courses, multi-day trips and other product/activity rules, plus likely/probably inference.
4. Source numbers became supplied numbers; the explicit cite-before-or-after instruction was removed.

No tool descriptions, strict empty inputs, same-step sendBrochure/showVideo instruction, tool exposure gate, or toolChoice setting changed between those commits. ECO wording and the refusal instruction also stayed identical in that comparison. The five saved media omissions were brochure, video, brief-brochure, brief-pdf and media-history: natural-language promises/clarifications with no raw tool call. In e587c72 media-only omissions were absent, although a mixed request already omitted its tool.

Most likely actionable cause: implicit auto permitted a model to answer in prose instead of executing a requested file action. The more restrictive fact-focused prompt may have shifted behavior, but that correlation cannot establish why this model emitted those five answers. There was no removed tool instruction to restore, and no live experiment was run. Requiring tool use for explicit lexical requests addresses the permissive API choice directly.

## Supported protocol

Checked 2026-10-31: [AI SDK tool choice](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling), [Groq required/parallel local calls](https://console.groq.com/docs/tool-use/local-tool-calling), [Groq model support](https://console.groq.com/docs/tool-use/overview#supported-models). Required is documented to require at least one call; qwen/qwen3.8-27b is listed with parallel support. Installed ai 7.0.158 and @ai-sdk/groq 4.0.74 implement the choice mapping; actual mocked Groq HTTP confirms required and two calls in one step. No dependency change. This is documentation and offline evidence, not live reliability evidence.

## Diff and evidence

- Pure three-state policy and noun-specific tool sets; 42 table rows test state/choice/tools/call count. Strict empty schemas, explicit ids, summaries and one call remain.
- General missing-information rule replaces ECO-specific prose; a recorded ECO meta-answer fails closed with the existing guard.
- Four cancellation paragraphs replace the aggregate, with verbatim concatenation/provenance tests and capture/order/anchor updates. All 18 URLs pass the saved HTML-id inventory offline.
- New procedural heading tie-break for equal cancellation scores; duration inference from title units is disabled so “Single-day” does not outrank jump time. Explicit title time terms and body/query duration inference remain. Neither threshold changes.
- Retrieval quality 38/38 (seven no-matches). Attribution calibration 28/28, 17 positive/11 negative: coefficient >=0.5 and two distinct words, unchanged. Only the two cancellation source labels/chunk vocabularies change; coefficients, matched words and classifications do not. At .3/.4: FP1/FN0; .5: FP0/FN0; .6: FP0/FN1; .7/.8: FP0/FN2, same as before.

## Approximate prompt cost

Baseline 505b90a vs working revision, all 24 live-regression scenarios measured OFFLINE. Cost is serialized messages, tool schemas and choice characters / 4 (JSON overhead included), not model tokenizer/billing. Same SDK-produced histories before and after; DELUXE root is explicitly MOCK SDK-produced text because it was never reached live. 48 mocked HTTP exchanges, zero live calls. Full precision/evidence: examples/required-media/prompt-cost.json.

| Scenario              | Before chars | Before ~tokens | After chars | After ~tokens |
| --------------------- | -----------: | -------------: | ----------: | ------------: |
| included              |         3253 |          813.2 |        3277 |         819.2 |
| brochure              |         2463 |          615.8 |        2091 |         522.8 |
| video                 |         3396 |          849.0 |        3011 |         752.8 |
| both                  |         3306 |          826.5 |        3334 |         833.5 |
| brief-brochure        |         2451 |          612.8 |        2079 |         519.8 |
| brief-pdf             |         2451 |          612.8 |        2079 |         519.8 |
| brief-video           |         3288 |          822.0 |        2903 |         725.8 |
| rain                  |         3331 |          832.8 |        3355 |         838.8 |
| cancel                |         4088 |         1022.0 |        2596 |         649.0 |
| vip                   |         3310 |          827.5 |        3334 |         833.5 |
| follow-up             |         3473 |          868.2 |        3497 |         874.2 |
| eco-photos            |         2719 |          679.8 |        2743 |         685.8 |
| altitude              |         2885 |          721.2 |        2909 |         727.2 |
| mixed                 |         4187 |         1046.8 |        3815 |         953.8 |
| media-history         |         2456 |          614.0 |        2084 |         521.0 |
| after-media           |         2805 |          701.2 |        2829 |         707.2 |
| retired               |         3017 |          754.2 |        2645 |         661.2 |
| age                   |         1614 |          403.5 |        1638 |         409.5 |
| weight                |         1617 |          404.2 |        1641 |         410.2 |
| pickup-price          |         1625 |          406.2 |        1649 |         412.2 |
| clothing              |         1611 |          402.8 |        1635 |         408.8 |
| deluxe                |         2695 |          673.8 |        2719 |         679.8 |
| deluxe-follow-up      |         2585 |          646.2 |        2609 |         652.2 |
| rain-refund-follow-up |         4717 |         1179.2 |        4095 |        1023.8 |

Average: 722.3 → 672.6 approximate tokens. Below 1,500; no further reduction is proposed or implemented.

## Assumptions and limits

The already captured four paragraphs are the authoritative text for this offline-only revision; no page facts are refreshed. Their headings are descriptive source titles, not newly invented policy text. Documentation support is sufficient to implement the requested SDK choice; it does not guarantee this key/model will always produce both tools. Required can lose a mixed request’s text part or return a typed MODEL_FAILURE if the provider/SDK rejects a missing call. Lexical cues include negations and do not infer pronouns. Matching tool choice is applied to the live provider branch; explicit MODEL_MODE=mock retains its documented deterministic selection, while the policy tests inject a mock provider into the live branch. Splitting paragraphs reduces co-location but does not ensure all retrieved chunks share product scope. Historical live answers remain historical; no live result is claimed for this change.

## Verification output

All four commands passed. The following is captured command output (including PDF parser warnings).

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


 Test Files  28 passed (28)
      Tests  308 passed (308)
   Start at  20:47:01
   Duration  3.45s (import 65%, transform 22%, tests 7%, setup 5%, worker 2%)

    Isolate  28 workers spawned · ~502ms startup each (spawn + environment, per file)
             at least ~579ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 57ms

  Creating an optimized production build ...
✓ Compiled successfully in 1341ms
  Running TypeScript ...
  Finished TypeScript in 3.8s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 1042ms
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
