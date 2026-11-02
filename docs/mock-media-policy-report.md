# Explicit mock media-policy correction

Date: 2026-11-02. Branch: frontend. This is the one owner-approved backend behavior change after backend-v1: explicit mock execution now uses the same already-computed media policy as the live branch. No dependency changes or live calls.

## Root cause and correction

runPipeline computed getMediaPolicy once, but its explicit mock branch iterated selectMedia's noun matches directly. The historical Pass 5 trace “Do not send a brochure” therefore returned a brochure despite policy none/tools []. That historical capture is retained unchanged in examples/release-readiness/mock-negation.json.

The mock loop now gates by policy.state and iterates policy.tools. None executes no implicit media; optional deterministically uses permitted matching tools; required executes only permitted tools. Existing selected ids retain missing-asset scripting; aliases not recognized by the old selection parser use the matching tool's fixed registry id. No vocabulary or request-form rule is duplicated or changed.

Explicit-id resolution still runs independently before either mode branch, with the same resolver and deduplication. This intentional exception preserves found/unavailable/unknown/wrong-type behavior, including noun-free “id retired”. A media noun inside an explicit id must not synthesize a second asset: “Send PDF id video” remains one wrong-type unavailable result. The initial targeted test exposed this edge while implementing defaults; the final loop defers to explicit selection types when no selection exists for a policy tool. The regression remains, rather than relaxing the expected result.

## Verification coverage

New tests/server/chat/mock-media-policy.test.ts validates and runs **all 127 rows** from tests/fixtures/media-policy.json through explicit MODEL_MODE=mock runPipeline, POST /api/knowledge/trace and POST /api/chat via DefaultChatTransport/readUIMessageStream. It asserts the fixture's exact policy/state and executed tool names/count, trace/pipeline media/calls/text equality, completed SDK tool inputs/results, text equality and mock metadata. Network fetch is a rejecting spy and must have zero calls after every case. No provider calls can be hidden in these tests.

Six additional explicit-id route/pipeline cases cover available brochure/video, retired/unknown, PDF-with-video-id wrong type and a noun-free explicit retired id. Together: **133 new cases**. Existing live-branch mock-provider policy coverage, request/stream/tool-result shapes, guard, retrieval, static knowledge/media, model count and explicit missing-media tests remain unchanged. No prior unit/e2e expectation was changed; none needed adjustment for the bug.

Optional mock chooses deterministic execution, while a live model's auto choice can omit tools; this is not a live-reliability claim. Explicit ids remain an independent registry action even at policy none. Scripted text/context/refusal behavior outside media execution is untouched. ADR 020 records alternatives and consequences.

## Real command output

Each command ran serially with MODEL_MODE=mock and GIT_PAGER=cat; 3000/3100 were checked free before/after. No server was started in live mode. Full transcripts are preserved under examples/mock-media-policy/.

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
   Start at  07:17:32
   Duration  4.84s (import 38%, setup 22%, environment 22%, tests 10%, transform 8%, worker 1%)

     Import  236 modules were evaluated 1946 times · 17.01s total, 38% of tracked time
             ~535ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

### npm run build

```text
> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 21ms

  Creating an optimized production build ...
✓ Compiled successfully in 992ms
  Running TypeScript ...
  Finished TypeScript in 2.2s ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 619ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
├ ƒ /api/knowledge/trace
└ ○ /knowledge


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

## Scope and dependency proof

The only files within the frozen-path diff against backend-v1 are:

- src/server/chat/pipeline.ts — the mock policy execution correction.
- tests/server/chat/mock-media-policy.test.ts — every-fixture pipeline/chat/trace regression and preserved explicit ids.

No src/app/api, data, public/demo or scripts file changed, nor any prior server test. The new test is included in the staged/committed proof; an unstaged git diff alone would omit a new untracked test. Exact file list/stat: examples/mock-media-policy/frozen-diff.txt.

Lock version/integrity comparison: 511 baseline entries, 157 historical frontend additions, **0 changed, 0 removed**. package.json and package-lock.json are unchanged since task start 0e1b806; ai remains 7.0.158 and @ai-sdk/gateway remains 4.0.131. The protected citation report is unchanged. See lock-proof.json and sdk.txt. No npm install, overrides, audit fix, protocol/data change or deployment.

Full e2e result and current trace capture are recorded below. The requested release-candidate tag records this tested source state, not a deployment or a claim that the prior Lighthouse gap has been closed.

## Full matrix and corrected trace

```text
npx playwright test
240 passed (2.4m)
```

Desktop/Tablet/Mobile: 80 cases each, zero failures/retries/skips, existing 15s test/5s expect timeouts. No e2e or existing unit expectations changed. Output: examples/mock-media-policy/e2e.txt. Browser server was production next start on 3100 with MODEL_MODE=mock and reuseExistingServer:false. Both ports were free after termination.

Actual in-process OFFLINE trace capture for the exact defect question:

```json
{
  "status": 200,
  "mode": "mock",
  "policy": { "state": "none", "tools": [] },
  "toolCalls": [],
  "media": [],
  "networkCalls": 0
}
```

Full public trace: examples/mock-media-policy/trace-negation-after.json. Historical before capture stays unchanged. The request used explicit mock, a network-rejecting tripwire and no server/live API. Every fixture also compares the real SDK-consumed chat route to trace and pipeline.

The final frozen-path diff lists only the two approved files above (2 files, 146 insertions, 1 deletion). All pre-existing tests passed without altered expectations. The protected citation report, package.json and lockfile remain byte-identical to the start. Only adjacent documentation was corrected to stop describing this resolved defect as current; historical reports/captures retain their original evidence with a supersession note. English lexical limits, optional mock scripting and unrelated mock prose remain as documented, not inferred fixed.

The requested commit is `fix: mock mode honours the media policy`; tag `v1.0-rc1` identifies that exact tested commit. No deployment, provider call or dependency change. Release-candidate naming does not resolve the existing Lighthouse tool/verification gap from Pass 5.
