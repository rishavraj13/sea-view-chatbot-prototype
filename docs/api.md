# Backend API

This document describes the frozen backend contract consumed by the frontend. Request bodies and UIMessage SSE v1 protocol remain intact, with additive source-url parts and trace.citations. Static website knowledge was captured on 2026-10-31. The model is not a booking system and does not fetch web content at request time.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Capture date: 2026-10-31. Individual records cite actual page anchors observed in the HTML. Package taglines differ while all three list the same inclusions; no reconciliation or invented benefits are added.

## POST /api/chat

Body: `{messages: UIMessage[]}` with 1-30 messages; id <=128 chars; user/assistant roles; final role user; 1-8 parts each; trimmed text 1-4000 chars. Text, step-start, source-url citations and completed tool-sendBrochure/tool-showVideo output-available parts are supported. Resend full history; there is no server memory. Unknown client fields are stripped and client tools/system instructions are not executed. Client-provided citations remain untrusted history, never grounding evidence.

Success uses AI SDK 7 UIMessage SSE: HTTP 200, Content-Type text/event-stream, x-vercel-ai-ui-message-stream:v1, x-model-mode:live|mock, Cache-Control:no-store. Each event is `data: JSON` plus two newlines; terminal event is `data: [DONE]`. Event order: start, start-step, zero or more tool-input-available/tool-output-available pairs, text-start, text-delta, text-end, zero or more source-url parts, finish-step, finish, DONE. Start/finish metadata is `{mode,provider,modelId,isDemo}`. `provider` is google|groq|openrouter. No legacy numbered data-stream protocol.

Live generation remains one provider call with maxRetries=0; text is checked before one final answer delta is emitted, not provider-token streaming. Missing selected key is explicitly labelled mock; provider failures never switch providers or mode. Mock responses say [MOCK], while knowledge/media provenance uses isDemo separately.

Example request used for the real live price capture:

```json
{
  "messages": [
    {
      "id": "real-0",
      "role": "user",
      "parts": [{ "type": "text", "text": "How much is the VIP package?" }]
    }
  ]
}
```

Full real response bytes, raw answer, guard result and timings: [live-google.json](examples/real-knowledge/live-google.json). Actual offline mock media SSE: [chat-media.json](examples/real-knowledge/chat-media.json). Mock captures are explicitly labelled and must not be described as live inference.

## POST /api/knowledge/trace

Body: `{question:string,messages?:UIMessage[]}`. Question is required, trimmed 1-4000 chars. Optional messages use the identical chat schema and limits, including final user role. When supplied they are the full authoritative history and the final user text drives the pipeline; otherwise question becomes a single user turn. No duplicate question is appended.

Response: `{mode,provider,modelId,isDemo,chunks,context,toolCalls,media,text,citations}`. Citations have the same source-url shape emitted in chat; `text` is visible prose without raw knowledge citation URLs. Each chunk contains `{id,text,score,source}` and source contains `{title,url,capturedAt,text,isDemo}`. Context is the exact shared model-context block, retaining URLs for model grounding. capturedAt is the requested date string YYYY-MM-DD; all current knowledge records are 2026-10-31 and isDemo:false. No conversations or environment values are returned.

Real mock route captures: [VIP](examples/real-knowledge/trace-vip.json), [weather](examples/real-knowledge/trace-weather.json), [ECO photos](examples/real-knowledge/trace-eco-photos.json), [unsupported pickup price](examples/real-knowledge/trace-unknown.json). Trace and chat use the identical pipeline.

## GET /api/knowledge/sources

Public response: `{isDemo:false,sources,media}`. The top flag describes the knowledge corpus; individual media flags are independent. Sources use the fields above. Public media include id, type, title, url, isDemo, available and optional posterUrl. No secrets/history. [Captured actual route response](examples/real-knowledge/sources.json).

## Media tool result union

- `{kind:"brochure",type:"pdf",id,title,url,isDemo,posterUrl?}`
- `{kind:"video",type:"video",id,title,url,isDemo,posterUrl?}`
- `{kind:"unavailable",id,title,url:"",isDemo,reason:"unknown"|"unavailable"|"wrong-type",posterUrl?}`

Model-facing tools take strict empty `{}` inputs and resolve their fixed brochure/video ids. Only matching noun-group tools are exposed from the latest user turn. No media noun means no tools; a noun without a recognized request form uses auto; a noun in a recognized request form uses required (ADR 016). Question openers veto the opening clause, while a later explicit modal request can qualify. Required means at least one call, not necessarily both; a required turn can lose its factual text. A required promise without a tool call returns the existing safe MODEL_FAILURE. Explicit customer IDs still resolve independently through the selection module, including unknown/retired IDs. Streamed/resendable tool input remains `{id:string}` and all result shapes above are unchanged. `brochure` is a generated DEMO MATERIAL PDF under /demo/brochure.pdf (isDemo:true); no official site PDF was found in this capture. `video` is the actual page video (isDemo:false), with the page-provided poster URL. `retired` remains unavailable and demo-labelled. Unknown/wrong-type results never invent URLs. Known asset provenance is retained on unavailable results.

Registry titles have no DEMO prefix and are not used to build summary prose. The fixed summary is `Here is the brochure (demo material).` (label only if isDemo), or `Here is the video.` (real video). All unavailable reasons say `That file isn't available right now.` without a demo label. URLs remain in tool payloads rather than visible prose. Provenance fields remain unchanged; these are wording changes, not tool-result shape changes.

One HEAD request returned 200 video/mp4 for the video. It was not downloaded. Embedding/browser CORS compatibility was not tested; the title labels the result as an external link and the URL remains usable as a link if embedding fails. No frontend or player was added.

## Guard

Before the structured-citation revision, citations existed only as URL text in the text delta and trace.text. The approved additive representation now uses the official [AI SDK source-url part](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol#source-parts) (checked 2026-10-31): `{type:"source-url",sourceId:string,url:string,title?:string}`. sourceId is the URL; title is the selected supporting chunk title. Zod validates sourceId length 1–2048, absolute URL length <=2048 and optional title length <=512. At most two URL-deduplicated supporting chunks produce parts, ordered by normalized content-word overlap. Model-written URLs do not select these sources; there are no source parts for refusals or registry-only media summaries.

The guard validates the original model answer first, exactly as below. Only afterward does presentation remove raw knowledge citation URLs from visible prose (bare URLs, leading/trailing brackets, parentheses, angle wrappers and Markdown link targets). Attached Cite/Source/Sources/Reference/Ref/See and similar bounded labels, empty wrappers and leftover punctuation are also removed; ordinary prose labels elsewhere remain. Trace.context retains the exact URLs passed to the model. Registry media links remain in unchanged tool-result payloads. The prompt requests 1–3 short, relevant sentences in the model's own words and excludes other activities unless asked; these style instructions do not change the guard or add another provider call. Deterministic MOCK context dumps are diagnostic output and do not demonstrate live style compliance.

Actual captured HTTP 200 chat event excerpt (OFFLINE MOCK, zero provider calls):

```text
data: {"type":"source-url","sourceId":"https://www.greedyadventures.com/experiences/sea-view-skydiving#options","url":"https://www.greedyadventures.com/experiences/sea-view-skydiving#options","title":"VIP"}
```

Full request, SSE bytes and the actual message produced by DefaultChatTransport + readUIMessageStream are saved in [chat-vip.json](examples/citations/chat-vip.json). The updated [VIP trace response](examples/real-knowledge/trace-vip.json) contains the same object in `data.citations` (the example file wraps the route JSON in `data`); the actual endpoint returns `citations` at the top level. These are actual mock route captures, not fabricated live model examples. Historical Google captures predate this representation and have not been overwritten. Groq's key was absent for this revision, so no new live response is claimed.

All five used anchors (options, details, the-day, faqs, page-content) were verified as real element ids in fresh HTTP 200 page HTML on 2026-10-31. [Anchor capture](examples/citations/anchor-capture.json) records ids and HTML SHA-256 hashes. Recheck offline with `python scripts/verify-source-anchors.py`; see testing.md for refresh instructions. No source URL required replacement.

Model prose needs at least one server-attributed supporting chunk (ADR 015), not a model-written URL. Every detected model absolute URL/Markdown target must still equal a retrieved source URL, including anchors; a foreign URL rejects, while an allowed URL contributes no grounding evidence. Every recognized number, currency, currency amount, unit-bearing quantity and range must be present in the normalized retrieved context. Supported normalization includes comma/space-separated thousands, decimal trailing zeros, baht/THB aliases, bounded number words through ninety, common duration/altitude unit spellings, and range endpoints. Thus currency/number formatting can differ without requiring verbatim sentences. No supporting source, foreign URLs or unsupported properties fail closed (refusal without media; silent prose drop beside media). No arithmetic unit conversion or new numeric facts are inferred. An empty media-only generation is handled separately by a registry-only summary; model prose does not bypass the guard through that path.

This is not semantic entailment: it cannot prove nonnumeric claims, scope, negation, who cancels, which package owns a fact, or resolve contradictory source wording. Unknown linguistic quantity expressions outside the bounded normalizer may not be recognized. The prompt requires faithful facts, but the guard alone is not a guarantee of truth. See ADR 011.

## Typed errors and runtime

All routes runtime=nodejs. maxDuration chat/trace=30 seconds, sources=10. Request deadline remains 20 seconds. Errors before SSE: `{mode,provider,modelId,error:{code,message,retryAfterSeconds?}}`. Only RATE_LIMIT can include retryAfterSeconds; existing fields/messages/statuses stay unchanged. No stack, raw upstream payload, quota ID or key is exposed.

| Code          | HTTP | Safe message                                                       |
| ------------- | ---- | ------------------------------------------------------------------ |
| INVALID_INPUT | 400  | Invalid JSON., Invalid message history., or Invalid test question. |
| MODEL_FAILURE | 502  | The model is temporarily unavailable.                              |
| TIMEOUT       | 504  | The model timed out. Please retry.                                 |
| RATE_LIMIT    | 429  | The model rate limit was reached. Please retry later.              |

Unexpected post-start serialization failures use an SDK error event with a generic message. Offline MOCK-provider tests verify error sanitization and no retry/fallback. Obsolete fictional captures have explicit supersession notices rather than presenting old facts as current evidence.

## Subsequent live Groq verification

The four-call provider-selection phase used the unchanged API and qwen/qwen3.8-27b. [Actual live route/SDK captures](examples/live-provider/groq.json) include request history, raw model prose, separate structured sources, tool arguments/results and wire responses. Rain and VIP answers passed grounding; both media tools returned in one provider call. The dependent VIP follow-up incorrectly invoked sendBrochure with an unknown id and returned unavailable instead of answering. The model's VIP `Cite:` label remained visible after URL removal, and the existing media summary duplicated `DEMO`. These failures are recorded without an API change, code workaround or retry. See [the live provider report](live-provider-report.md); no deployment occurred.

## Text-only provider history and media-turn presentation revision

The client still sends the existing UIMessage history, including source and completed tool parts. Internally buildModelMessages projects user/assistant text parts only, joins text parts with newlines, and omits empty conversational content. No step/source/tool object or tool result is JSON-serialized into the model prompt. A prior media turn contributes only its visible assistant text. Current retrieved context still supplies citation URLs independently. No request shape or stream change.

The original model prose still passes evaluateGrounding before presentation. Accepted prose is kept. Failed grounding with any found/unavailable media result drops the model prose silently; the registry summary is sufficient. Failed grounding without media retains I do not have that information. This changes the wrapper's media-turn policy, not the guard's citation/numeric rules. A correctly cited price plus brochure returns both. Citation removal preserves sentence-boundary and terminal . ! ? punctuation instead of swallowing it with the URL marker.

Actual current live route responses, raw model answers, separate source parts, visible text and exact outgoing provider messages are in examples/history-revision and history-revision-report.md. The prior history reconstruction is explicitly marked offline; new request-body captures are observed live. All tool-result fields, source parts, metadata, deadlines and typed errors remain unchanged.

## Server-side source attribution revision

The model is instructed to write direct, question-relevant prose without URLs/citation labels or context/retrieved/source/section language. After successful grounding, existing source-url stream parts and trace.citations are populated from the pure attributeSources result. This is a behavior change, not a request, stream or result-shape change. Optional model URLs are still stripped with punctuation preserved; foreign URLs reject before presentation.

Attribution uses the existing lexical normalizer plus bounded stop/question/discourse-word removal and excludes URL/digit-only evidence. A chunk supports an answer at >=0.5 overlap coefficient (shared distinct content words divided by the smaller content-word set), with >=2 matched words. Order by overlap, tie by retrieval order, deduplicate URL, limit two. Numeric/currency/duration/altitude/range validation is unchanged and applies to the full retrieved context. A bare known URL or generic one-word answer does not qualify. The calibration table and limitations are in ADR 015; lexical overlap does not prove entailment or associate every amount/claim with the right entity.

The current [actual live captures](examples/source-attribution/qwen-qwen3-8-27b-initial.json) include raw URL-free answers, delivered attributed sources separately, visible text, tool calls and provider-bound messages. [The report](source-attribution-report.md) includes the evidence table and quota-blocked cases. No live trace call was added to spend quota; offline trace captures and parity tests use the identical pipeline. A live HTTP 429 stopped the campaign; no retries/fallback followed.

## Rate-limit retry guidance and server observability

Both chat and trace use the shared Zod errorResponseSchema/buildErrorResponse. Only error.code=RATE_LIMIT can include `error.retryAfterSeconds`, an integer in 1..3600. It comes from a case-insensitive upstream retry-after header: nonnegative integer delta-seconds clamp to that range (0 -> 1, 5000 -> 3600); a valid HTTP date becomes seconds from server time, rounded up and clamped. Absent, blank, negative, fractional or garbage values are omitted. No default delay is invented. HTTP-date handling depends on the server clock. No upstream headers or provider error prose are added to the public response.

Actual OFFLINE MOCK route capture with retry-after:12 (not a live 429 capture):

```json
{
  "mode": "live",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "error": {
    "code": "RATE_LIMIT",
    "message": "The model rate limit was reached. Please retry later.",
    "retryAfterSeconds": 12
  }
}
```

Actual OFFLINE MOCK route capture with absent or garbage retry-after:

```json
{
  "mode": "live",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "error": {
    "code": "RATE_LIMIT",
    "message": "The model rate limit was reached. Please retry later."
  }
}
```

Six actual chat/trace mocked HTTP captures, including their server log objects, are in examples/rate-limit-diagnostics/mock-errors.json. The one authorized direct diagnostic returned HTTP 200 and produced no live error example. This change was not deployed; the hosted API still runs its previously committed error behavior.

Exact mapping: the mapper preserves existing ChatError instances. A JavaScript Error named TimeoutError/AbortError becomes TIMEOUT/504. Only AI SDK APICallError.isInstance(error) with statusCode===429 becomes RATE_LIMIT/429, regardless of provider error.type/code. Other SDK statuses (including 400/401/403/408/500/503/504), missing statuses, plain objects with status/code 429, and ordinary exceptions become MODEL_FAILURE/502. No matching of error-message text, nested causes or provider labels is used. Pipeline catch calls mapError with the selected provider/model; route catch receives the mapped ChatError and does not log it twice. See src/server/chat/errors.ts and pipeline.ts.

Server-only observability writes one JSON line for an SDK API error, timeout/abort, or error crossing the provider pipeline boundary. Fields are event=provider_error, provider, modelId, upstreamStatus (or null), errorType, errorCode (or null), rateLimitHeaders. Only bounded identifier-style labels survive, with known/configured key material removed. Provider error.type/code are read from SDK data, with response JSON fallback because the installed Groq SDK schema drops code. A bounded known exception name is the fallback type. No provider message, stack, request/response body, URL, request headers or conversation is logged.

Fixed header-name allowlist: retry-after; x-ratelimit-limit-requests; x-ratelimit-limit-tokens; x-ratelimit-remaining-requests; x-ratelimit-remaining-tokens; x-ratelimit-reset-requests; x-ratelimit-reset-tokens. Names are normalized to lowercase. Values must be bounded numeric counters, recognized numeric duration strings on reset fields, or a valid HTTP date on retry-after; malformed/secret-looking values and every other header are dropped. These headers stay server-side. Already mapped ChatError values and route input failures do not emit provider-error logs. This adds diagnostics/retry guidance without changing provider selection, retries, request shapes, stream protocol or tool results.

## Frontend presentation (Pass 5; no contract change)

The assistant-ui client renders structured source chips and validated media cards. It maps typed error codes to frontend copy and respects optional retryAfterSeconds. Assistant text over 600 characters can be visually clamped to eight lines with an aria-expanded disclosure; full original text remains in the DOM/runtime. History projection still caps each turn at 4000 characters. Wire text, request/stream/tool-result shapes and server behavior are unchanged. Explicit mock is scripted: the frozen negated-file behavior documented in frontend-release-report.md is not evidence of live policy execution.
