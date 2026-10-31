# Backend architecture

Backend only. No database, auth, payments, crawler, UI features or server conversation state. The client sends bounded full history. Static website JSON is validated and imported as modules for serverless packaging.

Flow: route Zod validation -> deterministic conversation query -> pure normalized section retrieval -> shared source context -> one provider generation step/tool execution -> citation/numeric property guard -> UIMessage SSE or JSON trace. Trace invokes the identical chat pipeline. Media summaries bypass model prose only when built from registry outputs. Provider errors remain typed and user-safe; no automatic provider/model/mock fallback after an error.

Public module interfaces:

- config: readEnv, modelMetadataSchema, ModelMetadata. env.ts is the only environment reader.
- knowledge: Source (now includes isDemo and date-only capturedAt), Chunk, sources, RETRIEVAL_THRESHOLD, retrieve, buildRetrievalQuery, QueryMessage, buildModelContext.
- media: MediaResult, mediaResultSchema, registry, resolveMedia. Optional posterUrl is public and page-supplied.
- chat: runPipeline, request schemas/types, error mapping, publicModelMetadata, summarizeMedia, buildSystemPrompt, evaluateGrounding/GroundingResult, groundedAnswer, answerProperties.
- trace: Trace (mode/provider/modelId/isDemo, source-bearing chunks, exact context and executed tools/media), buildTrace.

Other layers import public index boundaries. Capture and PDF scripts are authoring tools, not runtime loaders. Fifteen logical source sections are atomic chunks so package facts and policy scopes stay together. Threshold remains 1; source coverage abstains on the known absent facets rather than fabricating answers.

The guard now checks literal properties instead of exact source lines. It permits paraphrasing with allowed citations and normalized numeric properties; it cannot prove semantic entailment or fact associations. ADR 011 states these limitations and the deterministic fallback. Property sets and guard outcomes are internal diagnostics, not new HTTP request fields. Source/media isDemo data is additive; stream and media discriminants remain unchanged.

Google/Groq/OpenRouter selection, reasoning controls, single-step execution, 20-second deadline, route Node runtimes and maxDuration remain as before. No deployment in this change. See api.md, knowledge-and-media.md and real-knowledge-report.md.
