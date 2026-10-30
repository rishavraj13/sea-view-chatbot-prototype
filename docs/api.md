> Current approved extension: trace accepts optional messages with the same schema/limits as chat. See the approved contract below; earlier captured requests remain valid historical examples.

# API contract

All routes use runtime=nodejs. Chat/trace maxDuration=30 seconds; sources=10. No auth, persistence or application rate limiter. Provider 429 is mapped to RATE_LIMIT. Do not expose this prototype to uncontrolled traffic with paid credentials.

## POST /api/chat

Body: {messages: UIMessage[]}. 1-30 messages, id up to 128 chars, user/assistant roles only, 1-8 parts each, text 1-4000 trimmed chars. Final role must be user. Completed tool-sendBrochure/tool-showVideo parts (output-available state) and step-start parts are accepted, validated, and serialized into untrusted model history. No client system prompt or tools are executed. Send full history each time. Additional transport fields are stripped.

Success: HTTP 200, text/event-stream, x-vercel-ai-ui-message-stream: v1, x-model-mode: mock|live, Cache-Control: no-store. Uses AI SDK 7 UIMessage SSE via createUIMessageStreamResponse; compatible with assistant-ui @assistant-ui/ai-sdk useChatRuntime and AssistantChatTransport. Each event is data: JSON followed by two newlines. Order: start (mode/isDemo metadata), start-step, zero or more tool-input-available/tool-output-available pairs, text-start, text-delta, text-end, finish-step, finish (mode metadata), data: [DONE]. No legacy numbered data-stream protocol. One checked answer delta is emitted after generation; not provider token streaming. Tool names are sendBrochure and showVideo.

## POST /api/knowledge/trace

Body: {question: string, messages?: UIMessage[]}, question trimmed 1-4000 chars. Returns JSON {mode,chunks,context,toolCalls,media,text}. Uses exactly chat.runPipeline, with a single user history entry. For the same question/history and mode, retrieval and deterministic mock media agree. Live tool choices can vary. context is the exact retrieval block appended to the system prompt; chunks preserve source and exact text. No history or environment values are returned.

## GET /api/knowledge/sources

Returns {isDemo:true,sources,media}, public bundled records only.

## Tool result union

- {kind:"brochure",id,title,url,isDemo,type:"pdf"}
- {kind:"video",id,title,url,isDemo,type:"video"}
- {kind:"unavailable",id,title,url:"",isDemo,reason:"unknown"|"unavailable"|"wrong-type"}

All current assets have isDemo:true. Both tools accept {id:string} up to 100 chars; defaults brochure/video. Unavailable is an explicit output, never a fabricated link.

## Typed errors

Errors occur before SSE starts: JSON {mode:"mock"|"live",error:{code,message}}. No stack or provider body is exposed. Mode reflects deployment selection (invalid configuration receives the safe mock label).

| Code          | HTTP | Meaning / user message                                             |
| ------------- | ---- | ------------------------------------------------------------------ |
| INVALID_INPUT | 400  | Invalid JSON., Invalid message history., or Invalid test question. |
| MODEL_FAILURE | 502  | The model is temporarily unavailable.                              |
| TIMEOUT       | 504  | The model timed out. Please retry.                                 |
| RATE_LIMIT    | 429  | The model rate limit was reached. Please retry later.              |

The serializer's unexpected post-start failure is an SDK error event with a generic message. Timeout is 20 seconds, retries disabled. Mock fallback occurs for configured mock mode or absent key, not on provider failures.

## Captured local examples

These are actual endpoint requests/responses captured by scripts/capture.mjs against Next dev in mock mode. No live model error examples are fabricated; their contracts are covered offline.

### chat

```text
POST /api/chat
Request: {"messages":[{"id":"demo","role":"user","parts":[{"type":"text","text":"brochure video pricing"}]}]}
Status: 200
Content-Type: text/event-stream

data: {"type":"start","messageId":"a37d9cc7-5af9-4df1-ba65-88eb1030e3f2","messageMetadata":{"mode":"mock","isDemo":true}}

data: {"type":"start-step"}

data: {"type":"tool-input-available","toolCallId":"tool-0","toolName":"sendBrochure","input":{"id":"brochure"}}

data: {"type":"tool-output-available","toolCallId":"tool-0","output":{"id":"brochure","title":"DEMO brochure","url":"/demo/brochure.pdf","isDemo":true,"kind":"brochure","type":"pdf"}}

data: {"type":"tool-input-available","toolCallId":"tool-1","toolName":"showVideo","input":{"id":"video"}}

data: {"type":"tool-output-available","toolCallId":"tool-1","output":{"id":"video","title":"DEMO external sample video (not skydiving)","url":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4","isDemo":true,"kind":"video","type":"video"}}

data: {"type":"text-start","id":"answer"}

data: {"type":"text-delta","id":"answer","delta":"[MOCK DEMO] [https://example.com/sea-view-demo/pricing] DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer.\nDEMO DEMO brochure: /demo/brochure.pdf\nDEMO DEMO external sample video (not skydiving): https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}

data: {"type":"text-end","id":"answer"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"stop","messageMetadata":{"mode":"mock","isDemo":true}}

data: [DONE]


```

### trace

```text
POST /api/knowledge/trace
Request: {"question":"brochure video pricing"}
Status: 200
Content-Type: application/json

{"mode":"mock","chunks":[{"id":"1-0","text":"DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer.","source":{"title":"Pricing","url":"https://example.com/sea-view-demo/pricing","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer."},"score":1}],"context":"[https://example.com/sea-view-demo/pricing] DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer.","toolCalls":[{"name":"sendBrochure","input":{"id":"brochure"},"result":{"id":"brochure","title":"DEMO brochure","url":"/demo/brochure.pdf","isDemo":true,"kind":"brochure","type":"pdf"}},{"name":"showVideo","input":{"id":"video"},"result":{"id":"video","title":"DEMO external sample video (not skydiving)","url":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4","isDemo":true,"kind":"video","type":"video"}}],"media":[{"id":"brochure","title":"DEMO brochure","url":"/demo/brochure.pdf","isDemo":true,"kind":"brochure","type":"pdf"},{"id":"video","title":"DEMO external sample video (not skydiving)","url":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4","isDemo":true,"kind":"video","type":"video"}],"text":"[MOCK DEMO] [https://example.com/sea-view-demo/pricing] DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer.\nDEMO DEMO brochure: /demo/brochure.pdf\nDEMO DEMO external sample video (not skydiving): https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}
```

### sources

```text
GET /api/knowledge/sources
Request: null
Status: 200
Content-Type: application/json

{"isDemo":true,"sources":[{"title":"Package inclusions","url":"https://example.com/sea-view-demo/packages","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: The tandem package includes a briefing, equipment, instructor and jump. Photos are not included."},{"title":"Pricing","url":"https://example.com/sea-view-demo/pricing","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: The tandem price is USD 250 per person. This fictional price is not a real offer."},{"title":"Safety","url":"https://example.com/sea-view-demo/safety","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: Safety briefing is required. An instructor checks equipment. Eligibility requires operator confirmation; no medical advice is supplied."},{"title":"Weather cancellation","url":"https://example.com/sea-view-demo/weather","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: Weather cancellation allows rescheduling. Refund terms are not supplied in this demo."},{"title":"Location booking","url":"https://example.com/sea-view-demo/booking","capturedAt":"2026-10-30T00:00:00Z","text":"DEMO CONTENT: The fictional meeting location is Sea View Demo Airfield. Booking enquiries use the demo booking page; no actual reservations are accepted."}],"media":[{"id":"brochure","title":"DEMO brochure","url":"/demo/brochure.pdf","isDemo":true,"type":"pdf","available":true},{"id":"video","title":"DEMO external sample video (not skydiving)","url":"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4","isDemo":true,"type":"video","available":true},{"id":"retired","title":"DEMO retired brochure","url":"","isDemo":true,"type":"pdf","available":false}]}
```

### invalid

```text
POST /api/chat
Request: {"messages":[]}
Status: 400
Content-Type: application/json

{"mode":"mock","error":{"code":"INVALID_INPUT","message":"Invalid message history."}}
```

## Reality verification follow-up

See [reality-verification.md](reality-verification.md) for actual HTTP captures, SDK consumer commands, mode safety results, known failures, and unverified credentialed live/deployment checks. No API contract change was made. The existing checked-answer behavior is documented in [ADR 007](decisions/007-checked-answer-after-generation.md). This verification is incomplete; do not interpret earlier scaffold/test passes as credentialed live acceptance.

### Credentialed live and Vercel follow-up

The live model was exercised: successful live info text, live chat with both media tools, live trace video, plus real 504 timeouts and 429 rate limits. See [credentialed captures](examples/verification/credentialed-live.json) and the [verification report](reality-verification.md). Preview deployment: https://sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app (protected, explicitly mock). Its three endpoints and PDF returned 200 through authenticated CLI. Deployed Node.js function timeouts are confirmed as 30/30/10 seconds. No API contract changed. Full live acceptance and commit remain pending.

### Final live result

Both seven-case suites completed with real Google calls. Info, brochure, video, and combined chat tools have successful live captures, but remaining calls include 429/504 failures. The paced suite exited 1; acceptance and commit remain blocked. See the [complete table and command output](live-verification.md), [first captures](examples/verification/credentialed-live.json), and [paced captures](examples/verification/credentialed-paced.json). Preview endpoints, bundled JSON, SDK parsing and actual 30/30/10-second deployed settings passed. Git is initialized; secret files are ignored. API contracts are unchanged.

## Approved trace-history extension

`POST /api/knowledge/trace` now accepts `{question, messages?}`. Question stays required (trimmed 1-4000 chars). When messages is absent the question becomes a single user turn exactly as before. When messages is present it is the full authoritative history, validated through the same chat schema: 1-30 messages, user/assistant roles, final user role, id <=128 chars, 1-8 supported parts per message, trimmed text 1-4000 chars. The final supplied user text is the test question used by the shared pipeline; send the same value in question for clarity. The server does not append or duplicate question. Responses, errors, stream protocol and limits are unchanged. Invalid histories return existing 400 INVALID_INPUT.

```json
{
  "question": "What does that include?",
  "messages": [
    {
      "id": "1",
      "role": "user",
      "parts": [{ "type": "text", "text": "What is the tandem package price?" }]
    },
    {
      "id": "2",
      "role": "user",
      "parts": [{ "type": "text", "text": "What does that include?" }]
    }
  ]
}
```

An actual history-bearing live trace request and its quota-blocked response are in [approved-live.json](examples/verification/approved-live.json). Offline route tests assert exact equality to the shared chat pipeline with that history. Follow-up query construction is deterministic (ADR 008). Explicit asset IDs are bound to registry resolution before model completion, using the same tool execution handler; resulting trace toolCalls describe server handler executions, not proof that a model emitted each explicit selection.

See [diagnosis, test output, and evidence](approved-fixes-report.md).
