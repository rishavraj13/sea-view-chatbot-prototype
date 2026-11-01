# Architecture

The frozen backend has no database, auth, payments, crawler or server conversation state. The client sends bounded full history. Static website JSON is validated and imported as modules for serverless packaging.

## Frontend chat runtime (Pass 2)

The root layout keeps server-rendered children inside a single client ChatProvider. useChatRuntime + DefaultChatTransport (/api/chat) runs under AssistantRuntimeProvider; ThreadPrimitive owns messages/scrolling, MessagePrimitive renders escaped text and validated media tool UIs, and ComposerPrimitive owns drafts and keyboard/IME handling. Native dialog/launcher and warm tokens remain. Closing or client route changes preserve the runtime. Cancellation precedes switching to a new thread, isolating late responses.

One Zod-validated transport projection coalesces/caps history text and keeps supported completed tools/source/step parts. It preserves every turn and refuses histories above the message limit; the composer prevents reaching the backend with an oversized turn. Error flow: SDK APICallError.responseBody → small Zod envelope → product copy by code → inline alert/countdown → runtime reload of the existing failed turn. No backend text is rendered as error copy. Latest message/error metadata determines mock mode; new conversation clears it. Page citations use an exact origin/path allow-list and dedupe by page. No runtime imports from src/server. See ADR 018 for contract tests, limits and honest projection/mock limitations. The read-only Knowledge implementation is described below (ADR 019).

## Read-only Knowledge view (Pass 3)

The server-rendered /knowledge page hosts a client ARIA tab controller. A shared validated catalog request supplies Sources and Media from GET /api/knowledge/sources. Catalog types and TraceResponse are inferred from frontend Zod schemas; neither runtime schemas nor data loaders import src/server. Sources use native details for exact captured text; Media uses actual manifest title/type/provenance/availability, with unavailable assets not clickable. Footer navigation uses absolute home section links.

TraceTab composes TraceForm, useKnowledgeRequest and six presentational result sections: submitted Question/history, exact API context in a labelled scrolling block, retrieved chunks, object tool calls (readable fields), resolved media, and returned answer/page citations. Metadata/pipeline banner follow. There is no Retrieval query display: the frozen API does not return it. Inputs enforce a complete earlier user/assistant pair and the existing text limit; successful form validation builds the same trace request shape. Pending requests disable submission, and a static note explains that a live deployment uses one model call. The request hook aborts obsolete/unmounted requests and validates unknown JSON before storing it. Errors reuse the chat parser/product copy/RequestError and absolute-deadline useCountdown hook; no raw backend errors or result objects are stringified into the UI. Retry repeats the previous submitted body. Unknown response shapes fail to a recoverable product error. Source chips reuse chat's exact origin/path allow-list. See ADR 019 for proof and honest empty/mock limitations.

Flow: route Zod validation -> deterministic conversation query -> pure normalized section retrieval -> shared source context -> one provider generation step/tool execution -> unchanged citation/numeric property guard -> citation presentation -> registry media summary -> UIMessage SSE or JSON trace. Trace invokes the identical chat pipeline. Citation presentation removes raw knowledge URLs from guarded prose and emits deduplicated source-url parts; rejected prose yields no citations. Media summaries retain registry links. Provider errors remain typed and user-safe; no automatic provider/model/mock fallback after an error.

Public module interfaces:

- config: readEnv, modelMetadataSchema, ModelMetadata. env.ts is the only environment reader.
- knowledge: Source (now includes isDemo and date-only capturedAt), Chunk, sources, RETRIEVAL_THRESHOLD, retrieve, buildRetrievalQuery, QueryMessage, buildModelContext, Citation and citationSchema.
- media: MediaResult, mediaResultSchema, registry, resolveMedia. Optional posterUrl is public and page-supplied.
- chat: runPipeline, request schemas/types, error mapping, publicModelMetadata, summarizeMedia, buildSystemPrompt, evaluateGrounding/GroundingResult, groundedAnswer, answerProperties, presentCitations.
- trace: Trace (mode/provider/modelId/isDemo, source-bearing chunks, exact context, executed tools/media, visible text and structured citations), buildTrace.

Other layers import public index boundaries. Capture and PDF scripts are authoring tools, not runtime loaders. Eighteen logical source sections are atomic chunks so package facts and policy scopes stay together. Threshold remains 1; source coverage abstains on the known absent facets rather than fabricating answers.

The guard now checks literal properties instead of exact source lines. It permits paraphrasing with allowed citations and normalized numeric properties; it cannot prove semantic entailment or fact associations. ADR 011 states these limitations and the deterministic fallback. Property sets and guard outcomes are internal diagnostics, not new HTTP request fields. Source/media isDemo data is additive; stream and media discriminants remain unchanged.

Google/Groq/OpenRouter selection, reasoning controls, single-step execution, 20-second deadline, route Node runtimes and maxDuration remain as before. No deployment in this change. See api.md, knowledge-and-media.md and real-knowledge-report.md.

## Latest-turn file gating and presentation

The chat boundary additionally exports getMediaPolicy, MediaPolicy, MediaToolName and the compatible hasMediaIntent predicate. Only the latest user text controls model tool exposure, using the bounded vocabulary in ADR 013; earlier media turns cannot keep tools exposed. Matching nouns select strict empty-input tools, each resolving one fixed registry entry. No noun gives none/no tools; noun-only gives optional/auto; noun in a recognized English request form gives required/required (ADR 016), with question-opener precedence and later-modal mixed-clause handling. Explicit customer ids still resolve independently through selection. Streamed/resendable input remains {id}; tool-result and request shapes are unchanged. No classifier or extra model call. Citation labels/wrappers are removed after unchanged grounding. Summaries derive one demo-material label from isDemo and keep URLs in tool payloads only. The authoring-only verify:live harness records failures without runtime fallback.

## Text-only conversational projection

The chat public boundary now exports buildModelMessages for validated UI histories. It keeps only user/assistant text, preserving literal prose and omitting empty messages; step/source/tool data never becomes model conversational content. Both transport/reader-produced history variants are exercised against mocked provider HTTP and actual route handling. evaluateGrounding remains the same; groundedAnswer now discards rejected prose when media exist instead of manufacturing a refusal beside a registry result. Fixed summaries depend on kind/isDemo rather than title; unavailable summaries never carry a demo label. Citation-marker removal preserves punctuation. ADR 014 covers these decisions; current raw/provider-bound evidence is in history-revision-report.md.

## Server-side attribution

Knowledge now exports attributeSources, measureSourceOverlap, SourceOverlap and threshold constants. The pure lexical function reuses shared normalization without altering retrieval and selects at most two supporting chunks by coefficient >=0.5 plus two matched content words. The grounding boundary replaces URL presence with this support requirement while retaining the numeric checker and foreign-URL rejection. Presentation maps supporting chunks to the existing citation shape rather than trusting model link text. Mode/memory/media execution, deadlines and all public HTTP shapes remain unchanged. ADR 015 supersedes citation portions of ADRs 011/012. Lexical support is not semantic entailment.
