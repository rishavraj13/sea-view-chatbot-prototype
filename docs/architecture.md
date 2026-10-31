# Backend architecture

Phase 1 backend contract approved by the explicit backend request. No database, auth, payments, crawler, UI or server conversation state. The existing placeholder page is unchanged.

Routes validate Zod bodies, invoke chat.runPipeline, then serialize either UIMessage SSE or a JSON trace. Knowledge ranks immutable bundled JSON paragraphs by distinct keyword overlap (minimum score 1, top 3). The exact context is recorded in the trace. Chat owns model selection, server tools, deadlines and safe errors. Media owns the registry and result union. Trace owns request-local diagnostics.

Public module boundaries (TSDoc is in each index):

- config: readEnv() -> validated deployment settings; server only.
- knowledge: Source, Chunk, sources, retrieve(question, corpus?) -> Chunk[].
- media: MediaResult, mediaResultSchema, registry, resolveMedia(id, type, assets?) -> MediaResult.
- chat: ChatRequest, chatRequestSchema, traceRequestSchema, runPipeline(request, options?) -> Promise<Trace>, ChatError, mapError(error), modelMode().
- trace: Trace, buildTrace(mode, chunks) -> Trace.

Other layers import only public index files. No mutable cross-request data. Full history including completed media tool parts is validated and sent as untrusted text to the provider. Client system instructions and frontend tools are discarded. Tool outputs from prior turns are historical data, not executable calls.

Live generation finishes before SSE emission so timeout/provider errors retain typed HTTP statuses and unsupported prose can be rejected. This is streamed transport, not token-by-token model latency. A strict extractive guard only permits entire retrieved context lines; missing or unsupported answers become a refusal. Live generation and provider behavior have not been exercised with credentials.

SDK references checked before version/protocol selection: [AI SDK Google](https://ai-sdk.dev/providers/ai-sdk-providers/google), [UIMessage stream protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol), [generateText](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text), [assistant-ui v7](https://www.assistant-ui.com/docs/runtimes/ai-sdk/v7). Installed ai 7.0.158 and @ai-sdk/google 4.0.109. Future frontend should use @assistant-ui/ai-sdk with AI SDK 7. No frontend dependency installed.

## Approved conversational retrieval and media correction

The knowledge public boundary now also exports buildRetrievalQuery and QueryMessage. The pipeline derives a bounded deterministic query from user history before pure keyword retrieval; see ADR 008. Explicit media IDs resolve through the registry, respecting requested media type and unavailable status. Trace optionally accepts full chat-schema history; existing question-only calls still work. See approved-fixes-report.md for exact behavior and evidence.

## Phase 1.7 architecture

The shared pipeline invokes generateText once, with AI SDK's default single-step stop, maxRetries=0 and the existing deadline. Tool handlers execute locally in that step; no model continuation is requested. Explicit-ID registry binding and deduplication are unchanged. Pure chat.summarizeMedia(media) formats only returned title/URL or unavailable status. Grounded same-step model text is preserved; empty/rejected media text uses the summary.

config exports modelMetadataSchema and ModelMetadata in addition to readEnv. ModelMetadata is mode/provider/modelId; Trace extends it, and SSE start/finish metadata includes it. chat also exports publicModelMetadata for safe error envelopes. The provider factory builds only the selected adapter, with validated explicit keys and model-specific reasoning controls. No cross-provider or error-to-mock fallback. No request/stream/tool-result shape changes beyond additive public selection metadata. See ADR 009 and docs/providers.md.
