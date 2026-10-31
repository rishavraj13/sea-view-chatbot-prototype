# Covered info question: diagnosis and root-cause fix

Date: 2026-10-31. No deployment, model/provider switch, request change, stream-protocol change or tool-result change. One Google diagnostic generation total; zero Groq/OpenRouter calls because their keys are absent.

## Exact failed question and offline trace before changes

Question and retrieval query: `What is the demo tandem price?` (read directly from docs/examples/phase17/live-google.json, not reconstructed from memory).

The actual POST /api/knowledge/trace handler was invoked offline with a Request containing the original history and MODEL_MODE=mock. An outbound fetch trap would fail the run if generation were attempted. Response 200, mode mock, provider calls 0. Full [before trace](examples/covered-info/offline-before.json).

Threshold: 1. Original ranking:

| Chunk | Source             | Score |
| ----- | ------------------ | ----- |
| 1-0   | Pricing            | 3     |
| 0-0   | Package inclusions | 2     |
| 2-0   | Safety             | 1     |

Exact context block built by the original pipeline (the mock trace does not call a model; the same pure retrieval and formatting supplied this block to the subsequent live diagnostic):

```text
[https://example.com/sea-view-demo/pricing] DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer.
[https://example.com/sea-view-demo/packages] DEMO CONTENT: The tandem package includes a briefing, equipment, instructor and jump. Photos are not included.
[https://example.com/sea-view-demo/safety] DEMO CONTENT: Safety briefing is required. An instructor checks equipment. Eligibility requires operator confirmation; no medical advice is supplied.
```

## Case classification and single live diagnostic

Retrieval contains the explicit USD 250 answer. It is neither (a) empty retrieval nor (c) an uncovered question. It belongs to answering-stage case (b), with an important correction: the model itself did NOT refuse. Backend postprocessing rejected a correct answer solely because its citation was trailing instead of leading.

The original system requested complete canonical lines with leading URLs. The model returned the verbatim factual text and the right URL at the end. The original guard compared whole strings, failed, and replaced the answer with the information-missing sentence. This is an answer-format validation bug, not evidence of missing knowledge.

The single additional live call was permitted because offline retrieval had already succeeded. It used the original unfixed pipeline and exact question; no retries. Raw non-reasoning answer (not thought content):

```text
DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer. [https://example.com/sea-view-demo/pricing]
```

Client-visible text from that original call:

```text
I do not have that information.
```

Measured Google model gemini-2.5-flash: 1 provider call, HTTP 200, provider latency 1261 ms, handler latency 1325 ms. [Complete safe live diagnostic](examples/covered-info/live-before.json), [one-call ledger](examples/covered-info/live-budget.json). This consumes the task's entire additional Google info-call allowance. No post-fix live rerun was made; the recorded raw answer is replayed offline instead.

## Root-cause changes

- Add pure buildModelContext, shared by trace and prompt. Context source lines remain `[URL] exact text`; no response fields change.
- Extract buildSystemPrompt and clarify that covered facts must be answered with their URL, demo labels are not a reason to refuse, and the refusal is only for facts absent from context. Source data and history remain untrusted instructions.
- Extract groundedAnswer. A source line is accepted only when removing its exact bracketed source citation leaves the verbatim retrieved fact. Thus leading/trailing citation placement no longer causes a false refusal. Canonical output still has the original leading citation. Uncited prose, invented facts, unsupported paraphrases and unknown URLs remain rejected. Media summaries still depend only on registry results.
- Fix additional customer-phrasing retrieval gaps revealed by the requested quality cases using shared lexical normalization, not changes to data or lower thresholds.

## Retrieval normalization and scoring

Unique tokens are normalized on BOTH source and query sides. The bounded dictionary maps include/included/includes/inclusions, pricing/price/cost/fees, rain/weather variants, meet/meeting/location, booking/book, photos/photo and checks/check. `How much` adds price intent; `What do/will I/we get/receive` adds inclusion intent. Generic question/function words and non-discriminating DEMO labels are removed. No embeddings, model rewriting, external data or answer facts are produced by this vocabulary.

Score = sum across unique query tokens of (1 for a body match) + (2 / normalized title token count for a title match). Title-length normalization prevents a multiword title from receiving an arbitrary total-field advantage. Minimum score remains 1, top three and deterministic ties remain. No threshold was lowered. This is a domain-bounded lexical retriever, not semantic understanding; new synonyms require documented tests.

The exact original question now ranks Pricing 4 and Package inclusions 1; the generic DEMO match no longer retrieves Safety. The correct pricing paragraph was already present before this improvement. [After trace](examples/covered-info/offline-after.json).

## Repeatable offline quality evidence

21/21 questions pass, including four required no-matches.

| Question                                  | Expected top source  | Actual               |
| ----------------------------------------- | -------------------- | -------------------- |
| What is included in the package?          | Package inclusions   | Package inclusions   |
| What's in the package?                    | Package inclusions   | Package inclusions   |
| What do I get?                            | Package inclusions   | Package inclusions   |
| How much does it cost?                    | Pricing              | Pricing              |
| What if it rains?                         | Weather cancellation | Weather cancellation |
| Where do I meet?                          | Location booking     | Location booking     |
| What is the demo tandem price?            | Pricing              | Pricing              |
| What is the price of the tandem package?  | Pricing              | Pricing              |
| Are photos included?                      | Package inclusions   | Package inclusions   |
| How much per person?                      | Pricing              | Pricing              |
| Can I reschedule after rain?              | Weather cancellation | Weather cancellation |
| What happens if weather cancels the jump? | Weather cancellation | Weather cancellation |
| What are the refund terms?                | Weather cancellation | Weather cancellation |
| Where is the meeting point?               | Location booking     | Location booking     |
| How do I book?                            | Location booking     | Location booking     |
| Do I need a safety briefing?              | Safety               | Safety               |
| What equipment checks happen?             | Safety               | Safety               |
| Can I pay with Bitcoin?                   | no match             | no match             |
| Do you offer hotel accommodation?         | no match             | no match             |
| Is scuba diving available?                | no match             | no match             |
| When should I arrive?                     | no match             | no match             |

Dataset: tests/fixtures/retrieval-quality.json. Test: tests/server/knowledge/quality.test.ts. Repeat with `npm test -- tests/server/knowledge/quality.test.ts`. [Full scores and URLs](examples/covered-info/retrieval-quality.json). Expected sources are top-ranked, not merely somewhere in a returned list. Unknown test questions return an empty array, not low-confidence chunks.

The answer tests replay the exact recorded live text; a real-SDK MockLanguageModelV4 pipeline test asserts USD 250 plus the source URL, no refusal and exactly one provider call (simulated offline, never network). Context-building tests verify exact source records and prompt insertion. Negative tests reject fabricated prices, unknown URLs and uncited text. The unchanged media, history, mode-safety, provider-wire and one-call tests remain required.

## Provider availability

The validated environment reported Google key configured, Groq key absent, OpenRouter key absent. No key values were printed. Accordingly no brochure/video live comparison is claimed for those two providers. Their performance and reliability remain unverified. No fallback or provider enum changes.

## Limits

The historical failure's cause was unknown until this diagnostic reproduced a correct raw answer followed by backend rejection. The new prompt is tested offline but not separately sampled live because the one-call allowance was spent diagnosing the original behavior. The regression replay proves this exact previously rejected answer is now accepted. It does not prove that every future model paraphrase or unrelated question will be answered correctly. Source content remains fictional demo content, including the USD 250 price. Guard normalization permits citation placement, not arbitrary rewriting of factual content.

## Verification

All four commands exited 0. Output is pasted from execution.

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

 Test Files  13 passed (13)
      Tests  73 passed (73)
   Start at  13:08:59
   Duration  948ms (import 78%, transform 11%, tests 5%, setup 5%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 31ms

  Creating an optimized production build ...
✓ Compiled successfully in 1139ms
  Running TypeScript ...
  Finished TypeScript in 2.2s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 756ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
└ ƒ /api/knowledge/trace
```
