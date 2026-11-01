# ADR 018: Assistant-ui owns the client conversation

Date checked: 2026-11-02. Status: accepted for frontend Pass 2. Backend, protocol and installed versions unchanged.

## Context and references

The former ChatPanel manually kept messages, transport consumption, loading/errors, retries and mock state. It decoded a nonexistent response.json, duplicated the failed user turn on retry, and could accept a late result after reset. The adapter baseline is fixed by ADR 017: ai 7.0.158, gateway 4.0.131 and @ai-sdk/react 4.0.162.

Read current official documentation and installed source/types before implementation:

- [AI SDK integration](https://www.assistant-ui.com/docs/api-reference/integrations/ai-sdk), including useChatRuntime/useAISDKChat/useAISDKError and AssistantChatTransport.
- [Provider](https://www.assistant-ui.com/docs/api-reference/context-providers/assistant-runtime-provider), [Thread](https://www.assistant-ui.com/docs/api-reference/primitives/thread), [Message](https://www.assistant-ui.com/docs/api-reference/primitives/message), [Composer](https://www.assistant-ui.com/docs/api-reference/primitives/composer).
- [Tool rendering](https://www.assistant-ui.com/docs/api-reference/tools/rendering), [Errors](https://www.assistant-ui.com/docs/api-reference/primitives/error), [Thread actions](https://www.assistant-ui.com/docs/api-reference/runtimes/thread-runtime), [Composer actions](https://www.assistant-ui.com/docs/api-reference/runtimes/composer-runtime).
- Installed @assistant-ui/ai-sdk/src/runtime/{useChatRuntime,useChatThread,useAISDKRuntime}.ts, transport/AssistantChatTransport.ts, hooks.ts; core runtime/store types; React primitives and ComposerInput's IME guards; ai/src/ui/http-chat-transport.ts. Next's installed Server and Client Components guide was also read.

## Decision

Use useChatRuntime from the installed @assistant-ui/react-ai-sdk re-export, with DefaultChatTransport targeting /api/chat. ChatProvider is the single client owner in the existing root layout, above server-rendered page children. AssistantRuntimeProvider scopes ThreadPrimitive, MessagePrimitive and ComposerPrimitive. State actions use the supported useAui API. Closing the native dialog or client-side routing does not destroy the runtime. Nothing persists on the server or across a browser reload.

Use inline MessagePrimitive.Parts tool render overrides, the documented current alternative to deprecated makeAssistantToolUI. Tool results are Zod-validated before existing cards are rendered; text remains escaped React text, in full. Two part render passes retain the previous text → media → page chips order without executing a tool client-side or changing any answer text. Source chip identity is exact allow-listed URL origin and pathname; anchors/query strings do not create duplicate pages. Unknown/lookalike URLs are not promoted into citations.

The transport sends only `{messages:[{id,role,parts}]}`. AssistantChatTransport would add optional id/trigger/metadata plus system/config/callSettings/client tools; the frozen Zod schema strips extra top-level fields, but none are needed here because tools and prompt policy belong to the backend. DefaultChatTransport is supported directly by useChatRuntime and avoids sending unused client model context.

### One bounded projection

src/components/chat/request-projection.ts is the sole outgoing boundary. Keep every conversational turn. Merge adjacent/text fragments into one trimmed text part, capped at 4000 characters; keep one step-start marker, at most two distinct source URLs and the latest completed result for each of the two known tools. Drop unsupported/incomplete/invalid part types from resendable history; do not serialize them into text. The maximum projected turn has six parts (below eight). The UI continues to show complete incoming text; this is history projection, not an output sanitizer. Long assistant text can lose its tail in later model context, explicitly a limitation.

Composer maxLength=4000, blank drafts cannot send, and message count >=30 disables submission and offers a new conversation. The boundary Zod schema refuses oversized histories locally rather than dropping older turns. Normal 15 complete user/assistant turns fill the conversation. Retry does not add a turn. Backend exports its Zod schema but no named numeric limit constants; tests therefore prove exact allowed/rejected boundary values on that exported schema (30/31 messages, 8/9 parts, 4000/4001 characters), without modifying the frozen backend.

### Error and lifecycle flow

Use useAISDKError to access the actual APICallError; parse statusCode/responseBody through Zod. Only RATE_LIMIT/TIMEOUT/MODEL_FAILURE/INVALID_INPUT with valid metadata/delay fields are trusted. Non-JSON/network/abort/malformed errors become UNKNOWN. Raw backend messages are never rendered; the five product strings in src/content are authoritative. Inline role=alert remains visible until the SDK starts a new request or a new conversation.

Retry invokes the runtime thread startRun({parentId:lastUserId}) reload path. Installed useAISDKRuntime routes onReload through AI SDK regenerate with the existing user turn, verified by identical first/retry request bodies. Countdown uses an absolute deadline, sampled by a one-second UX timer; background throttling does not extend the delay. The only other timer is the required eight-second slow-loading hint. Composer primitives handle Enter/Shift+Enter/IME; native dialog retains focus trapping/return and Escape handling.

New conversation calls cancelRun before switching to a fresh in-memory runtime thread. Late completions belong to the old thread and cannot populate the new one. Its error/countdown/composer/mode state starts empty. Mock mode is derived from the latest assistant metadata or validated error metadata, with no latch; new threads have no mode. No fallback provider, mock conversion, response-text sanitizer, hidden provider error or automatic retry is introduced.

## Contract evidence

tests/components/chat-contract.test.tsx mounts the real useChatRuntime/AssistantRuntimeProvider and a transport whose fetch calls the actual POST route under MOCK mode, with zero network calls. Both real generated bodies pass the frozen chatRequestSchema unchanged. The returned assistant's SDK history contains step-start, source-url, tool-sendBrochure and tool-showVideo; all four survive the second request projection. Browser request captures in docs/examples/chat-runtime independently show the same messages-only envelope.

## Alternatives and consequences

Final mode detail: an error without metadata (for example a network failure) does not replace the latest validated response's mode. A validated error mode does replace it. New threads have no previous messages/errors and therefore no mode. Unit and browser reset coverage verifies this without a latch.

- Retain handwritten orchestration: rejected; duplicates the SDK state machine and caused lifecycle/error defects.
- AssistantChatTransport: supported but its extra model-context fields are unused here. No frontend tools are registered as executors.
- External-store runtime: unnecessary because the installed adapter satisfies the frozen SDK baseline.
- Truncate old conversation turns to keep chatting: rejected; full-history semantics would silently change. Users explicitly start a new conversation at the limit.

Knowledge view and its legacy error helper remain out of scope; their existing implementation/spec defects are not claimed fixed. Scripted MOCK answers can contain lengthy diagnostic source text or a refusal beside a media summary; the frontend preserves them and never invents a source to fill an absent citation. A real live provider is not contacted in this pass. Native media cards retain the existing poster probe and playback fallback.
