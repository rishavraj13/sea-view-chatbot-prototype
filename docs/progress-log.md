# Progress log

## Real website knowledge and property-based guard — 2026-10-31

The former fictional knowledge, facts and response examples are retired. Original Git history is preserved; historical working-tree files now clearly identify supersession. Current data contains fifteen faithful logical sections from the two specified pages, isDemo:false and capture date 2026-10-31. Taglines and identical inclusion lists are not reconciled.

One video HEAD returned 200 video/mp4; video body was not read or stored. The page poster was observed. A demo-labelled PDF was generated from the package facts and rendered/visually checked with a baht-capable font. Retired asset remains unavailable.

Citation/numeric property guard replaces exact-line matching. Threshold remains 1. Retrieval quality and all required check output, plus raw live answers, are pasted in real-knowledge-report.md before commit. No deployment, request-schema, provider or stream changes beyond the approved additive source/provenance fields.

## Completed verification

Retrieval quality: 35/35, including seven no-matches. Google VIP price 200/accepted/1 call/1552ms; weather 200/accepted/1 call/2187ms. Exactly two live calls, no retries. All 108 tests pass; typecheck, lint and build exited 0. Full source list, quality table, raw answers and guard limits are in [real-knowledge-report.md](real-knowledge-report.md). Required real output:

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

 Test Files  14 passed (14)
      Tests  108 passed (108)
   Start at  13:50:34
   Duration  987ms (import 76%, transform 11%, tests 6%, setup 5%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 28ms

  Creating an optimized production build ...
✓ Compiled successfully in 1125ms
  Running TypeScript ...
  Finished TypeScript in 2.0s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 645ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```

# Captured-text cleanup — 2026-10-31

Completed the narrowly approved icon cleanup: audited 15 JSON sections, cleaned six, fixed the static authoring extractor, regenerated and rendered the demo PDF, and refreshed affected offline examples. Added corpus artifact and actual-PDF package/price regression tests. All facts and API behavior remain unchanged. No new live calls and no deployment. Previous VIP/rain raw answers are reproduced verbatim with guard/count/latency in [the cleanup report](captured-text-cleanup-report.md), which also pastes the actual typecheck, lint, test (110/110) and build output. Retrieval quality remains 35/35. The only added dependency is test-only pdf2json; no runtime dependency changes.

# Structured citations and concise answer style — 2026-10-31

Read the current API contract first: citations existed only as answer URL text. Implemented the approved additive source-url stream parts, trace.citations and validated history support; visible citation URLs are removed after the unchanged guard accepts the original model answer. Prompt now requests 1–3 short relevant sentences without unrequested activities. Fetched both authorized page HTML documents (HTTP 200); all five used anchors exist as element ids, so no source URL changed. Saved ids/hashes and added repeatable offline checks. Actual SDK transport/reader, shared-trace parity, citation-format and one-call paraphrase/unsupported-figure replay tests pass. Groq key absent: both requested live scenarios skipped; zero live calls to any provider, no deployment. Typecheck, lint, 128 tests across 17 files, and production build pass; real output and captured examples are in [the structured citations report](structured-citations-report.md). No package, provider, fact or media-result shape changes.

# Live Groq provider selection — 2026-10-31

Checked current official Groq rate-limit/tool/model/AI SDK docs and Vercel environment/protection docs. Selected Groq qwen/qwen3.8-27b with reasoning none via MODEL_ID and explicit live process configuration; .env.example reflects the candidate while remaining mock by default. Ran exactly four Groq calls, one per scenario with no retries: rain (474 ms), VIP (403 ms), both media tools (613 ms), dependent follow-up (454 ms). All HTTP 200; first three intended tasks passed, but the follow-up called sendBrochure with an unknown id and did not answer. Recorded dangling Cite: and duplicate DEMO presentation without fixes or fallback. Offline retrieval confirmed VIP first for the follow-up. Typecheck, lint, 128 tests across 17 files and build pass; real output, raw answers and separate citations/tools are in [the provider report](live-provider-report.md). Added a production environment/protection plan and README switch instructions. No backend/runtime/API/package changes, Google/OpenRouter calls or deployment. Preserved the pre-existing local citation-report edit outside the commit.

## Media gating and answer presentation — 2026-10-31

Removed attached citation labels/wrappers, replayed the exact live VIP answer, removed DEMO title prefixes, and made summaries derive one demo-material label from isDemo with customer-safe file errors and URLs only in payloads. Added a pure latest-turn media lexicon, omitted tools entirely for negatives, removed model id parameters with strict empty schemas, and preserved explicit customer-id selection. Added ADR 013 and npm verify:live with a shared forty-call ledger, spacing, 429 stop, explicit reruns and unattempted-case resume. Qwen passed 15/18 initially and 17/18 after reruns; retired media still included a guard refusal. Llama returned model failures in every scenario. Forty calls total, no 429, no fallback or subsequent backend workaround. Live evidence, per-attempt raw text/citations/tools/latency and real offline output are in media-gating-report.md. The pre-existing citation report remains untouched. No guard, retrieval, stream, provider enum, request or result-shape changes and no deployment.

## History serialization, media refusal and punctuation — 2026-10-31

Diagnosed cause (a): application history conversion serialized non-text SDK parts; saved harness history itself matched the SDK reader. Replaced it with a public text-only projection and tested real source/tool-bearing UI message round trips against captured provider HTTP contents. Failed media prose now drops without adding refusal; no-media failures still refuse. Fixed summaries ignore titles and unavailable demo flags; exact rain/inclusion/cancel punctuation replays pass. Added ADR 014 and strengthened live assertions, ECO acceptance and mixed/media-history scenarios. Qwen initial 19/21, follow-up recovered on its one rerun, mixed still failed on citation omission. Twenty-three calls, no Llama or fallback. Actual raw/provider-bound messages, separate citations, all visible texts, counts/timings and final offline outputs are in history-revision-report.md. The pre-existing citation report remains untouched; no guard rules, prompt, retrieval, schemas, stream, provider enum or deployment change.

## Server-side source attribution — 2026-10-31

Replaced the model-URL grounding dependency with pure normalized content-word attribution: overlap coefficient >=0.5, at least two distinct matched words, at most two supporting chunks ranked and deduplicated by URL. Selected from a broad pre-live evidence matrix (final 28 pairs: 17 positive, 11 negative). The numeric checker remains unchanged; foreign URLs still reject and optional model URLs are stripped. Updated the direct-customer prompt, source-part/trace population, old raw-answer replays, regression table and ADR 015 superseding citation clauses of 011/012. No mixed-request execution change; README documents its failure modes and semantic limits. Planned 24 initial Qwen turns by reusing rain as approved; Groq 429 stopped call 16. Ten passes, five model/tool omissions and one rate limit; eight unrun, no reruns permitted after the stop. Actual raw answers, attributed sources, visible text, token matrix, call timing and final offline output are in source-attribution-report.md. Protected citation report untouched; no deployment or other provider calls.

## 2026-10-31 — Required media choice and prompt cleanup (offline only)

Compared e587c72..505b90a: no tool description, same-step instruction or gate changes; implicit auto allowed the five saved media promises without execution. Added the approved none/optional/required policy, matching-only tools, general missing-info prompt, verbatim four-way cancellation split and capture/anchor safeguards. Required does not guarantee both tools or mixed factual prose. All request/stream/tool shapes and numerical thresholds stay unchanged. Retrieval is 38/38; attribution is 28/28 with identical classifications/coefficient outcomes. Approximate prompt average 722.3 → 672.6 tokens across 24 cases. Actual Groq HTTP is fully mocked; zero live calls and no deployment. See required-media-report.md for diagnosis, official support links, every token row, assumptions and final command output. Pre-existing structured-citations-report.md edit remains untouched.
