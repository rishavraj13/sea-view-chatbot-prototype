# Structured citations and concise answer style — 2026-10-31

## Contract inspection and changes

Read docs/api.md before editing: citations were delivered solely as URL strings embedded in visible answer text, both in the chat text delta and trace.text. There were no structured source parts or trace citations.

The approved additive change emits supported AI SDK `source-url` parts and adds trace.citations with the same shape: `{type,sourceId,url,title?}`. The URL is the stable sourceId. Validate the original live model text with the unchanged guard first, then remove raw knowledge citation URLs from the visible answer, preserving other prose and Markdown labels. Deduplicate by URL; never promote uncited retrieved chunks. Invalid/missing citations or unsupported figures still fail closed to the existing refusal with an empty citations array. Media summaries are appended afterward from the registry and retain their asset links and unchanged tool-result shapes.

The Zod citation schema also accepts returned source parts in full client history within the existing limits. Client sources are untrusted history, never grounding evidence. Request envelopes, stream protocol, provider/model enums, numeric-property guard, retrieval, one-call behavior, deadlines, media, knowledge facts and package versions are unchanged. The prompt now asks for 1–3 short sentences in the model's own words, limited to relevant source facts, without other activities unless requested. This is a prompt instruction, not a new semantic guard guarantee.

Official [AI SDK source part documentation](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol#source-parts) was checked on 2026-10-31 and verified against the installed SDK and its actual consumer. ADR 012 records the decision and limitations.

## Anchor verification

Fetched exactly the two authorized pages' HTML; both returned HTTP 200. HTMLParser extracted element id attributes; the captured inventory includes the raw HTML SHA-256 hashes. No missing anchors and no URL replacements.

| Page                                                            | Verified source fragments       |
| --------------------------------------------------------------- | ------------------------------- |
| https://www.greedyadventures.com/experiences/sea-view-skydiving | options, details, the-day, faqs |
| https://www.greedyadventures.com/cancellations                  | page-content                    |

All 15 source URLs pass `python scripts/verify-source-anchors.py` and anchors.test.ts offline against `examples/citations/anchor-capture.json`. The script's optional --capture fetches only those two pages; normal execution makes no network requests. Future unverified anchors must be replaced by the plain page URL. An id existing at capture time does not prove future availability or section semantics. No source fact/capture-date changes or video requests were made.

## Real response captures and offline evidence

`examples/citations/chat-vip.json` contains the actual request, HTTP 200 SSE bytes, and the final message produced by DefaultChatTransport + readUIMessageStream through the real route in explicit MOCK mode. This is a diagnostic context dump with separate source parts, not live model prose or live-style evidence. Updated real-route mock trace files under examples/real-knowledge expose citations and URL-free visible prose while preserving exact context. Historical live-google.json remains unchanged.

The SDK consumer regression asserts text, brochure/video tool results, source-url parts and resendable assistant history. Shared-pipeline parity includes citations. Formatting tests cover bare, bracketed, parenthesized, angle-wrapped, Markdown and reference-definition URLs, leading/trailing placement, deduplication and refusal cases. One-call MOCK-provider replay accepts `If weather holds your jump, you can move to another date at no cost or receive a full refund.` with its valid weather citation; replacing the claim with an invented 99999-day refund produces the refusal and no sources. Prompt/context tests assert the concise/relevant style instructions and preserve package wording rules.

## Requested Groq checks

Presence-only inspection via readEnv found no GROQ_API_KEY in .env.local. No provider keys or values were printed.

| Scenario                         | Raw answer               | Citations    | Tool calls   | Provider calls | Latency      |
| -------------------------------- | ------------------------ | ------------ | ------------ | -------------- | ------------ |
| What if it rains?                | Not run: Groq key absent | Not observed | Not observed | 0              | Not measured |
| Send me the brochure and a video | Not run: Groq key absent | Not observed | Not observed | 0              | Not measured |

There were zero live calls to Groq, Google or OpenRouter. Offline MOCK replay/transport success is separate evidence, not a substitute live result. No deployment.

## Actual command output

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
   Start at  14:23:57
   Duration  1.29s (import 73%, transform 15%, tests 7%, setup 4%, worker 2%)

> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 28ms

  Creating an optimized production build ...
✓ Compiled successfully in 668ms
  Running TypeScript ...
  Finished TypeScript in 1558ms ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/6) ...
  Generating static pages using 7 workers (1/6)
  Generating static pages using 7 workers (2/6)
  Generating static pages using 7 workers (4/6)
✓ Generating static pages using 7 workers (6/6) in 666ms
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

All required checks completed successfully. Actual offline capture output:

```text
Captured public sources, four OFFLINE MOCK trace responses and media UIMessage SSE; zero provider calls.
OFFLINE MOCK citation capture: HTTP 200; source parts=3; zero provider calls.
Verified 15 source URLs against element ids from 2 captured pages (offline check).
```

Final checks also verified the grounding guard's code is unchanged from the preceding commit and scanned 163 workspace files for configured secret values without printing them; both passed. .env.local and .vercel remain ignored.

## Assumptions and limits

An anchor inventory plus original HTML hash is sufficient offline evidence without committing unrelated page content. Stable source IDs use exact citation URLs, so multiple cited sections sharing one anchor become one source part titled with the first matching retrieved section. Citation URLs are removed from final answer prose only; trace context/source records and registry media links retain their purposeful URLs. The explicitly scripted mock context dump is retained, and model style cannot be confirmed without a live Groq key. Guard limitations remain those in ADR 011.
