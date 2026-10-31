# Backend API

Backend-only prototype. Requests and UIMessage SSE protocol remain unchanged. Static website knowledge was captured on 2026-10-31. The model is not a booking system and does not fetch web content at request time.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Capture date: 2026-10-31. Individual records cite actual page anchors observed in the HTML. Package taglines differ while all three list the same inclusions; no reconciliation or invented benefits are added.

## POST /api/chat

Body: `{messages: UIMessage[]}` with 1-30 messages; id <=128 chars; user/assistant roles; final role user; 1-8 parts each; trimmed text 1-4000 chars. Text, step-start and completed tool-sendBrochure/tool-showVideo output-available parts are supported. Resend full history; there is no server memory. Unknown client fields are stripped and client tools/system instructions are not executed.

Success uses AI SDK 7 UIMessage SSE: HTTP 200, Content-Type text/event-stream, x-vercel-ai-ui-message-stream:v1, x-model-mode:live|mock, Cache-Control:no-store. Each event is `data: JSON` plus two newlines; terminal event is `data: [DONE]`. Event order: start, start-step, zero or more tool-input-available/tool-output-available pairs, text-start, text-delta, text-end, finish-step, finish, DONE. Start/finish metadata is `{mode,provider,modelId,isDemo}`. `provider` is google|groq|openrouter. No legacy numbered data-stream protocol.

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

Response: `{mode,provider,modelId,isDemo,chunks,context,toolCalls,media,text}`. Each chunk contains `{id,text,score,source}` and source contains `{title,url,capturedAt,text,isDemo}`. Context is the exact shared model-context block. capturedAt is the requested date string YYYY-MM-DD; all current knowledge records are 2026-10-31 and isDemo:false. No conversations or environment values are returned.

Real mock route captures: [VIP](examples/real-knowledge/trace-vip.json), [weather](examples/real-knowledge/trace-weather.json), [ECO photos](examples/real-knowledge/trace-eco-photos.json), [unsupported pickup price](examples/real-knowledge/trace-unknown.json). Trace and chat use the identical pipeline.

## GET /api/knowledge/sources

Public response: `{isDemo:false,sources,media}`. The top flag describes the knowledge corpus; individual media flags are independent. Sources use the fields above. Public media include id, type, title, url, isDemo, available and optional posterUrl. No secrets/history. [Captured actual route response](examples/real-knowledge/sources.json).

## Media tool result union

- `{kind:"brochure",type:"pdf",id,title,url,isDemo,posterUrl?}`
- `{kind:"video",type:"video",id,title,url,isDemo,posterUrl?}`
- `{kind:"unavailable",id,title,url:"",isDemo,reason:"unknown"|"unavailable"|"wrong-type",posterUrl?}`

Both tools take `{id:string}` <=100 chars, default brochure/video. Explicit IDs always resolve through the registry, including unknown/retired IDs. `brochure` is a generated DEMO MATERIAL PDF under /demo/brochure.pdf (isDemo:true); no official site PDF was found in this capture. `video` is the actual page video (isDemo:false), with the page-provided poster URL. `retired` remains unavailable and demo-labelled. Unknown/wrong-type results never invent URLs. Known asset provenance is retained on unavailable results.

One HEAD request returned 200 video/mp4 for the video. It was not downloaded. Embedding/browser CORS compatibility was not tested; the title labels the result as an external link and the URL remains usable as a link if embedding fails. No frontend or player was added.

## Guard

Model prose needs at least one citation URL; every detected absolute URL and Markdown link target must equal a retrieved source URL, including anchors. Every recognized number, currency, currency amount, unit-bearing quantity and range must be present in the normalized retrieved context. Supported normalization includes comma/space-separated thousands, decimal trailing zeros, baht/THB aliases, bounded number words through ninety, common duration/altitude unit spellings, and range endpoints. Thus currency/number formatting can differ without requiring verbatim sentences. Missing/unknown citations or unsupported properties return the existing refusal. No arithmetic unit conversion or new numeric facts are inferred. An empty media-only generation is handled separately by a registry-only summary; model prose does not bypass the guard through that path.

This is not semantic entailment: it cannot prove nonnumeric claims, scope, negation, who cancels, which package owns a fact, or resolve contradictory source wording. Unknown linguistic quantity expressions outside the bounded normalizer may not be recognized. The prompt requires faithful facts, but the guard alone is not a guarantee of truth. See ADR 011.

## Typed errors and runtime

All routes runtime=nodejs. maxDuration chat/trace=30 seconds, sources=10. Request deadline remains 20 seconds. Errors before SSE: `{mode,provider,modelId,error:{code,message}}`. No stack, raw upstream payload, quota ID or key is exposed.

| Code          | HTTP | Safe message                                                       |
| ------------- | ---- | ------------------------------------------------------------------ |
| INVALID_INPUT | 400  | Invalid JSON., Invalid message history., or Invalid test question. |
| MODEL_FAILURE | 502  | The model is temporarily unavailable.                              |
| TIMEOUT       | 504  | The model timed out. Please retry.                                 |
| RATE_LIMIT    | 429  | The model rate limit was reached. Please retry later.              |

Unexpected post-start serialization failures use an SDK error event with a generic message. Offline MOCK-provider tests verify error sanitization and no retry/fallback. Obsolete fictional captures have explicit supersession notices rather than presenting old facts as current evidence.
