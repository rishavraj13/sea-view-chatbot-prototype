# Request-form detection report

2026-10-31. Zero live provider calls. All model behavior is verified with clearly labelled offline mock providers/HTTP. No deployment. The pre-existing docs/structured-citations-report.md edit is unchanged and excluded from this commit.

## Changes

The pure latest-turn policy now requires a recognized request form, rather than finding please/get/see anywhere in the message. It recognizes imperative openers, modal requests, short noun phrases ending in please and desire + request verb + media noun. Question-form openers veto the opening clause. A separately introduced later modal request can qualify; the supplied mixed VIP-price/brochure sentence is required with sendBrochure only. See ADR 016 for the complete patterns, bounded modifiers, alternatives and English-only lexical limitations.

All 42 previous fixture phrases remain. Eight become optional under the new rules: View a clip; Could I access a film?; I want a video; I'd like a leaflet; I’d like a recording; I need the document; Watch; Do not send a brochure. There are 53 added rows, 95 total. Each row tests state, tool set, SDK toolChoice and one mocked generation. The noun-to-tool mapping, explicit-id resolution, strict empty inputs, summaries, provider behavior and request/stream/tool-result schemas are unchanged. No guard, retrieval, knowledge, deadline or package change.

One new test resends the exact recorded SDK media-history assistant object from docs/examples/history-revision/qwen-qwen3-8-27b-initial.json. It contains step-start and a completed tool-sendBrochure result. Validation accepts it; model history contains only its exact visible text, “Here is the brochure (demo material).” No JSON, type/sourceId keys or part names leak into projected messages. Runtime history code required no change. Existing transport/reader HTTP history tests remain.

## Assumptions and limitations

Question-opener precedence includes will/would at sentence start, so “Will I get a video of my jump?” stays optional; a later explicit modal clause is the mixed-sentence exception. A polite leading please before an imperative is retained to preserve the existing PLEASE ATTACH request. Desire forms accept optional to and bounded noun-phrase determiners/modifiers, including “I'd like to see the video”; a verb-less desire is optional. English-only lexical detection cannot infer every negation, indirect request, quotation or clause boundary. Unrecognized wording falls back to optional if a media noun exists, otherwise none. Required still means at least one selected tool, not necessarily both, and can lose mixed factual prose. No extra call or fallback is introduced.

## Policy fixture summary

- none: 10 phrases
- optional: 48 phrases
- required: 37 phrases

The full phrase table is tests/fixtures/media-policy.json. Testing instructions are in docs/testing.md; ADR 016 records the updated decision. README limitations, api.md, architecture.md and progress-log.md are updated. Historical reports, live captures and budget ledgers remain unchanged.

## Verification

All four commands passed. Output below is captured from the real commands, not illustrative output.

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
      Tests  362 passed (362)
   Start at  21:04:20
   Duration  3.14s (import 66%, transform 21%, tests 7%, setup 4%, worker 1%)

    Isolate  28 workers spawned · ~394ms startup each (spawn + environment, per file)
             at least ~454ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 37ms

  Creating an optimized production build ...
✓ Compiled successfully in 1571ms
  Running TypeScript ...
  Finished TypeScript in 3.0s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 831ms
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
