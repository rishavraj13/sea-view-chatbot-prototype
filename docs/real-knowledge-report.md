# Real website knowledge and property-based guard

Capture date: 2026-10-31. Backend only; no deployment or provider configuration change. Required checks pass. One static capture of two pages, one video HEAD, and exactly two Google inference calls. No video download, crawler or frontend player.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

The two pages were fetched directly again for this task. Only the requested logical sections were extracted; navigation, footer, clip galleries and unrelated marketing were excluded. Text is faithfully copied into the records below; the three package taglines and identical inclusion lists remain unreconciled. CapturedAt is exactly 2026-10-31 and every source has isDemo:false. [Capture metadata and HTML hashes](examples/real-knowledge/source-capture.json).

| Source section                                              | Citation URL                                                            | isDemo |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| ECO                                                         | https://www.greedyadventures.com/experiences/sea-view-skydiving#options | false  |
| DELUXE                                                      | https://www.greedyadventures.com/experiences/sea-view-skydiving#options | false  |
| VIP                                                         | https://www.greedyadventures.com/experiences/sea-view-skydiving#options | false  |
| What's included                                             | https://www.greedyadventures.com/experiences/sea-view-skydiving#details | false  |
| The plan                                                    | https://www.greedyadventures.com/experiences/sea-view-skydiving#the-day | false  |
| Jump facts: altitude, freefall, canopy, instructor and time | https://www.greedyadventures.com/experiences/sea-view-skydiving#details | false  |
| Location and operator                                       | https://www.greedyadventures.com/experiences/sea-view-skydiving#details | false  |
| Where does the activity take place?                         | https://www.greedyadventures.com/experiences/sea-view-skydiving#faqs    | false  |
| Which package should I choose?                              | https://www.greedyadventures.com/experiences/sea-view-skydiving#faqs    | false  |
| Is Bangkok pickup available?                                | https://www.greedyadventures.com/experiences/sea-view-skydiving#faqs    | false  |
| If the weather stops the activity                           | https://www.greedyadventures.com/cancellations#page-content             | false  |
| If you cancel                                               | https://www.greedyadventures.com/cancellations#page-content             | false  |
| If you do not turn up                                       | https://www.greedyadventures.com/cancellations#page-content             | false  |
| Refunds                                                     | https://www.greedyadventures.com/cancellations#page-content             | false  |
| Travel insurance                                            | https://www.greedyadventures.com/cancellations#page-content             | false  |

The old fictional knowledge records were removed/replaced. Obsolete historical captures and reports have explicit supersession notices; source material from those versions is no longer current evidence. Old helper scripts are retired to prevent replaying fictional knowledge. No Git history rewrite was performed. Adversarial test inputs are expressly negative fixtures, not knowledge claims.

## Media

Real video: https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4 (isDemo:false). Page-provided poster: https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg. Exactly one HTTP HEAD returned status 200, Content-Type video/mp4 and Content-Length 12777587. The response body was not read and no video file was downloaded. [HEAD record](examples/real-knowledge/video-head.json).

Embedding is unverified; the tool title explicitly labels an external link, and the URL remains the fallback if a client cannot embed it. No CORS/player/streaming-range claim is made.

public/demo/brochure.pdf is generated from the three real package records, titled DEMO MATERIAL and flagged isDemo:true. It is not an official site PDF. The existing retired entry stays unavailable and isDemo:true. A baht-capable font was checked and the rendered PDF visually reviewed; [preview](examples/real-knowledge/brochure-preview.png). The brochure preserves taglines and all four identical inclusion rows without adding benefits.

## Guard redesign

The model can use non-verbatim phrasing. evaluateGrounding requires at least one citation URL and every detected URL/Markdown target must equal a retrieved URL. It checks normalized numbers, currencies, currency/amount pairs, numeric unit pairs and ranges against the retrieved text. Comma/space grouping, decimal zeros, baht/THB aliases, bounded number words and duration/altitude spellings are normalized. Unsupported detected properties fail closed to the existing refusal. Source metadata is not treated as answer facts. Media summaries remain registry-only.

This does not prove semantic entailment: nonnumeric falsehoods, negation, policy scope and package/value associations can pass if they satisfy the literal properties. Bounded language/unit/currency parsing is not exhaustive. Unit conversions and new arithmetic are not inferred. The tests explicitly demonstrate the nonnumeric limitation rather than claiming it is prevented. See [ADR 011](decisions/011-real-capture-and-property-guard.md).

## Retrieval quality

Each logical section is an atomic chunk, keeping package names, taglines, inclusions and prices together. Threshold remains 1, top three. Bounded vocabulary adds the requested package/media/jump/location/policy terms. Named package requests exclude other package cards; unpriced pickup text is not a base-package price answer. The explicitly unsupported six facets abstain instead of matching generic jump words. Weather-modified cancellation queries use weather as their topic. Equal scores follow captured section order. These are documented static-capture coverage rules, not claims that all possible questions are solved.

35/35 realistic questions pass; 7 require no match. The table maps the expected top source, not merely any returned source. [Full scores](examples/real-knowledge/retrieval-quality.json).

| Question                                    | Expected section                                            | Actual top section                                          |
| ------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| How much is the VIP package?                | VIP                                                         | VIP                                                         |
| How much does ECO cost?                     | ECO                                                         | ECO                                                         |
| What is the DELUXE price?                   | DELUXE                                                      | DELUXE                                                      |
| What is included?                           | What's included                                             | What's included                                             |
| How high is the jump?                       | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| What if it rains?                           | If the weather stops the activity                           | If the weather stops the activity                           |
| Can I cancel?                               | If you cancel                                               | If you cancel                                               |
| Do I get photos with ECO?                   | ECO                                                         | ECO                                                         |
| Where do I meet?                            | Location and operator                                       | Location and operator                                       |
| How long does it take?                      | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| Who operates the dropzone?                  | Location and operator                                       | Location and operator                                       |
| Is Bangkok pickup available?                | Is Bangkok pickup available?                                | Is Bangkok pickup available?                                |
| Which package should I choose?              | Which package should I choose?                              | Which package should I choose?                              |
| Where does the activity take place?         | Where does the activity take place?                         | Where does the activity take place?                         |
| Is the instructor USPA certified?           | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| How long is the freefall?                   | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| How long is the canopy flight?              | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| Do I need previous experience?              | Jump facts: altitude, freefall, canopy, instructor and time | Jump facts: altitude, freefall, canopy, instructor and time |
| Is a certificate included?                  | What's included                                             | What's included                                             |
| Do I need photo ID for check-in?            | The plan                                                    | The plan                                                    |
| What are the five steps of the plan?        | The plan                                                    | The plan                                                    |
| What is the DELUXE tagline?                 | DELUXE                                                      | DELUXE                                                      |
| Does VIP have a personal cameraman?         | VIP                                                         | VIP                                                         |
| What happens if I do not turn up?           | If you do not turn up                                       | If you do not turn up                                       |
| How are refunds paid?                       | Refunds                                                     | Refunds                                                     |
| What travel insurance do you recommend?     | Travel insurance                                            | Travel insurance                                            |
| Can I reschedule if it rains?               | If the weather stops the activity                           | If the weather stops the activity                           |
| How much cancellation notice should I give? | If you cancel                                               | If you cancel                                               |
| What is the age limit for this jump?        | no match                                                    | no match                                                    |
| What is the weight limit?                   | no match                                                    | no match                                                    |
| Which health conditions prevent a jump?     | no match                                                    | no match                                                    |
| What should I wear for the jump?            | no match                                                    | no match                                                    |
| What is the Bangkok pickup price?           | no match                                                    | no match                                                    |
| What are the baggage rules?                 | no match                                                    | no match                                                    |
| Can a child jump?                           | no match                                                    | no match                                                    |

ECO photos: the captured mock trace contains its literal tagline and listed inclusions; no new photo entitlement is asserted. The prompt explicitly requires that wording instead of reconciling package contradictions. That specific semantic behavior is tested offline, not claimed as an extra live check.

## Live Google checks

Exactly one provider call per question, no retries, 61 seconds between calls. The actual chat handler was invoked with Request objects and called the real Google provider; no separate HTTP listener was started. Raw non-reasoning text, guard decisions and response bytes are recorded, without credentials or provider error internals. [Full live captures](examples/real-knowledge/live-google.json), [two-call ledger](examples/real-knowledge/live-budget.json).

| Question                     | HTTP | Guard    | Calls | Handler latency | Provider latency |
| ---------------------------- | ---- | -------- | ----- | --------------- | ---------------- |
| How much is the VIP package? | 200  | accepted | 1     | 1552 ms         | 1491 ms          |
| What if it rains?            | 200  | accepted | 1     | 2187 ms         | 2174 ms          |

### Raw answer: How much is the VIP package?

```text
The VIP package is à¸¿14,000 per person. [https://www.greedyadventures.com/experiences/sea-view-skydiving#options]
```

### Raw answer: What if it rains?

```text
Skydiving runs only in safe conditions, and the person on the ground decides what is safe. Diving is called on sea state and visibility. If your load, flight, or dive is held for weather you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund of anything you have paid. There is no charge and no admin fee for a weather move. It is the most common reason an activity does not run and it is nobody's fault. (https://www.greedyadventures.com/cancellations#page-content)
```

Both calls succeeded and were accepted; quota did not block either. No further live generation was made. The weather raw answer paraphrases the page; the underlying static JSON remains faithfully copied. Property acceptance is not presented as an entailment proof.

## Captured route responses (separately labelled offline mock)

[sources.json](examples/real-knowledge/sources.json) is the actual public source handler response. Four trace captures cover VIP, weather, ECO photos and unsupported pickup price. [chat-media.json](examples/real-knowledge/chat-media.json) is an actual UIMessage response with demo PDF and real video flags. All generation captures from capture-real-examples.mjs are explicitly OFFLINE MOCK; provider access is blocked. They are not relabelled as real inference. Historical examples are superseded rather than silently changed into invented current transcripts.

## Diff summary

- Replace the former corpus with 15 real anchored date-only, isDemo:false records and section-aware retrieval.
- Add bounded coverage/vocabulary, named-package filtering and no-match regressions without lowering threshold.
- Replace verbatim sentence checks with citation and numeric-property validation; document exact guarantees/limitations.
- Propagate source/media isDemo through source and trace data; chat metadata reflects retrieved/media provenance. Keep mode:mock separate. Add optional page-supplied posterUrl; video remains a labelled link.
- Regenerate the clearly demo-labelled PDF from real package facts. Keep retired unavailable. No video file stored.
- Refresh all affected tests, real response examples, README sources, API/schema docs, architecture, testing and ADRs. .env.example needs no change because no configuration was added.

## Real verification output

All required commands exited 0. The final test run includes the explicit four-inclusion-list assertion; runtime code is the same code compiled by the build below.

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

## Limitations and assumptions

- Static capture does not guarantee future pricing/availability. Packages and FAQ wording are preserved even where implications differ.
- The six absent-facet rules apply to these two captured pages, not to every possible operator policy. Unknown questions outside that bounded vocabulary can still have weak matches.
- Source isDemo:false describes provenance; the generated brochure remains demo material. Unknown assets do not invent provenance or URLs.
- Embedding and browser playback were not tested. HEAD is not proof of CORS compatibility.
- Guard checking is bounded and lexical/property-based, not a full grounding theorem. Unsupported semantic claims or wrong relationships can pass. Never treat isDemo:false as a correctness certificate.
- Existing provider-error behavior, one-step generation, timeouts, request schemas and UIMessage protocol are unchanged. No deployment or unrelated backend feature work.
