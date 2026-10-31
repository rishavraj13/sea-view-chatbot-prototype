# Direct-desire media policy — Part A

2026-10-31. Offline only: zero live provider calls. Explicit direct desires now qualify without requiring a request verb; nine information-verb prefixes retain optional classification. View/watch/play/open/access qualify as file-action verbs, and explicit negation returns none with no offered tools. Bare media words stay optional. All prior 95 table rows remain, with the specified state corrections; 32 additions bring the matrix to 127. Every row asserts model toolChoice, matching tool set and one mocked provider generation.

The change is confined to the media policy, fixtures and documentation. Noun mapping, strict tool inputs, explicit-id selection, one-call pipeline, guard, request/stream/tool-result shapes and providers are unchanged. ADR 016 explains the decision and English/lexical limitations; README and testing.md are updated. Negation is a conservative whole-turn veto; semantic mixed per-file negation is not implemented. The pre-existing structured-citations-report.md edit is untouched and excluded.

## Real verification output

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
      Tests  394 passed (394)
   Start at  21:13:52
   Duration  2.10s (import 68%, transform 19%, tests 8%, setup 4%, worker 2%)

    Isolate  28 workers spawned · ~279ms startup each (spawn + environment, per file)
             at least ~322ms faster with isolate: false — reuses workers across files instead of one per file
```

### npm run build (exit 0)

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 29ms

  Creating an optimized production build ...
✓ Compiled successfully in 1252ms
  Running TypeScript ...
  Finished TypeScript in 2.0s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 642ms
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
