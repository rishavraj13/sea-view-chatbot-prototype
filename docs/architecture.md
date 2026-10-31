# Backend architecture

Backend only. No database, auth, payments, crawler, UI features or server conversation state. The client sends bounded full history. Static website JSON is validated and imported as modules for serverless packaging.

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

The chat boundary additionally exports getMediaPolicy, MediaPolicy, MediaToolName and the compatible hasMediaIntent predicate. Only the latest user text controls model tool exposure, using the bounded vocabulary in ADR 013; earlier media turns cannot keep tools exposed. Matching nouns select strict empty-input tools, each resolving one fixed registry entry. No noun gives none/no tools; noun-only gives optional/auto; noun plus a request cue gives required/required (ADR 016). Explicit customer ids still resolve independently through selection. Streamed/resendable input remains {id}; tool-result and request shapes are unchanged. No classifier or extra model call. Citation labels/wrappers are removed after unchanged grounding. Summaries derive one demo-material label from isDemo and keep URLs in tool payloads only. The authoring-only verify:live harness records failures without runtime fallback.

## Text-only conversational projection

The chat public boundary now exports buildModelMessages for validated UI histories. It keeps only user/assistant text, preserving literal prose and omitting empty messages; step/source/tool data never becomes model conversational content. Both transport/reader-produced history variants are exercised against mocked provider HTTP and actual route handling. evaluateGrounding remains the same; groundedAnswer now discards rejected prose when media exist instead of manufacturing a refusal beside a registry result. Fixed summaries depend on kind/isDemo rather than title; unavailable summaries never carry a demo label. Citation-marker removal preserves punctuation. ADR 014 covers these decisions; current raw/provider-bound evidence is in history-revision-report.md.

## Server-side attribution

Knowledge now exports attributeSources, measureSourceOverlap, SourceOverlap and threshold constants. The pure lexical function reuses shared normalization without altering retrieval and selects at most two supporting chunks by coefficient >=0.5 plus two matched content words. The grounding boundary replaces URL presence with this support requirement while retaining the numeric checker and foreign-URL rejection. Presentation maps supporting chunks to the existing citation shape rather than trusting model link text. Mode/memory/media execution, deadlines and all public HTTP shapes remain unchanged. ADR 015 supersedes citation portions of ADRs 011/012. Lexical support is not semantic entailment.
