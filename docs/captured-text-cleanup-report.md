# Captured-text cleanup — 2026-10-31

Audited all 15 source JSON records. Removed decorative leading plus/bullet icons from six records (ECO, DELUXE, VIP, inclusions, jump facts and location), consolidated the repeated inclusion labels into a single `Included` heading, and retained the original inclusion sentences. No other markup, image alt text or stray symbols were found. All factual wording, package taglines, amounts, source URLs, capture dates and flags are unchanged. The offline capture script now removes these presentation artifacts at their origin.

Regenerated `public/demo/brochure.pdf` from those cleaned records with its DEMO MATERIAL title intact. Rendered the one-page PDF with Poppler and visually checked text, spacing and baht glyphs; refreshed both saved previews. Added an artifact regression across the entire source corpus and an actual PDF extraction test comparing all three package names and prices with the package sections. The only new package is test-only `pdf2json` 4.0.2; its declared Node minimum is compatible with this project's minimum. It has no dependencies. The install audit retained the baseline 17 moderate findings; no runtime package changes.

Refreshed the public sources and affected OFFLINE MOCK route examples. Pure retrieval still passes 35/35 questions with seven no-matches and threshold 1. No server logic, API shapes, stream protocol, provider configuration or deployment changes. No additional live calls or website/video requests were made.

## Previous live answers, verbatim

Read directly from the unchanged `examples/real-knowledge/live-google.json` capture from the preceding run. These are saved LIVE Google responses, not reruns or mock output.

Question: How much is the VIP package?

```text
The VIP package is ฿14,000 per person. [https://www.greedyadventures.com/experiences/sea-view-skydiving#options]
```

HTTP 200; guard accepted; one provider call; provider latency 1491 ms; handler latency 1552 ms.

Question: What if it rains?

```text
Skydiving runs only in safe conditions, and the person on the ground decides what is safe. Diving is called on sea state and visibility. If your load, flight, or dive is held for weather you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund of anything you have paid. There is no charge and no admin fee for a weather move. It is the most common reason an activity does not run and it is nobody's fault. (https://www.greedyadventures.com/cancellations#page-content)
```

HTTP 200; guard accepted; one provider call; provider latency 2174 ms; handler latency 2187 ms.

## Actual required command output

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

 Test Files  15 passed (15)
      Tests  110 passed (110)
   Start at  14:10:51
   Duration  1.28s (import 66%, transform 21%, tests 6%, setup 4%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 31ms

  Creating an optimized production build ...
✓ Compiled successfully in 537ms
  Running TypeScript ...
  Finished TypeScript in 1615ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 668ms
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

All four commands completed successfully. Additional offline capture output:

```text
Captured public sources, four OFFLINE MOCK trace responses and media UIMessage SSE; zero provider calls.
Retrieval quality: 35/35 passed; 7 required no-matches; threshold=1
```

The `npx` registry lookup was unavailable in the sandbox (ENOTFOUND), so these capture scripts were executed successfully with the already cached tsx CLI; no script behavior was changed. Assumption: decorative icons and repeated presentation labels are not source facts. The retained prior live capture is historical evidence and does not establish a fresh provider result after cleanup.
