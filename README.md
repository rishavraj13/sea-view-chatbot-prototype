# Sea View Skydiving chatbot backend

Next.js App Router backend with static website knowledge, keyword retrieval, media tools, one-call generation and a citation/numeric property guard. No booking transactions or frontend features.

Use Node >=22.12: npm ci, copy .env.example to .env.local, then npm run dev. Verify with npm run typecheck, npm run lint, npm test, npm run build and npm run format:check. Secrets are read only by src/server/config/env.ts and never returned.

MODEL_MODE=mock is explicitly scripted and makes zero provider calls. Live selection uses MODEL_PROVIDER=google|groq|openrouter and MODEL_ID. Matching keys are GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY and OPENROUTER_API_KEY. Missing selected key is explicitly labelled mock; provider errors never trigger fallback. Model defaults/controls and compatibility are documented in docs/providers.md. Google 2.5 Flash budget defaults to 0; the existing 20-second deadline and one-step generation remain.

## Selected live provider and switching

The selected Groq configuration is `MODEL_MODE=live`, `MODEL_PROVIDER=groq`, `MODEL_ID=qwen/qwen3.8-27b`, `REASONING_EFFORT=none`, with `GROQ_API_KEY` privately in .env.local. The committed .env.example selects the same provider/model but keeps explicit mock mode until you enable live. The earlier provider-selection run recorded a failed dependent follow-up in docs/live-provider-report.md. The current backend-v1 release smoke passed all eight scenarios, including the VIP follow-up and required brochure/video tools; see docs/backend-v1-release-report.md for exact evidence and limits. Provider choice is configuration only; there is no automatic fallback.

To switch explicitly to Google, set `MODEL_PROVIDER=google`, `MODEL_ID=gemini-2.5-flash`, `MODEL_MODE=live` and provide `GOOGLE_GENERATIVE_AI_API_KEY` locally. Its existing thinking-budget default is 0. To select OpenRouter, set `MODEL_PROVIDER=openrouter`, an explicit currently supported tool-capable `MODEL_ID`, and `OPENROUTER_API_KEY`; its model/backend support must be verified before relying on it. `REASONING_EFFORT=none` disables OpenRouter reasoning where supported. Keep keys out of source control, restart the local server after changing configuration, and verify response metadata rather than assuming the provider switched. No Google/OpenRouter live calls were made in this phase. Vercel requires the same explicit provider/model and matching private key scoped to Production, followed by an authorized redeployment. See docs/deployment-plan.md for live-Groq variables and protection-disable steps; current deployment results are below.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Captured 2026-10-31 and organized as eighteen logical JSON sections with isDemo:false. Text is copied from the requested sections without reconciling differing taglines and identical package inclusions. Static capture is not a crawler or a promise of present-day pricing. Unsupported age/weight/health/clothing/pickup-price/baggage questions return no retrieval match.

The actual page video is linked with isDemo:false and a page-supplied poster. It was HEAD-verified but not downloaded or playback-tested. public/demo/brochure.pdf is generated DEMO MATERIAL from the real package facts (isDemo:true), not an official site PDF. The retired test asset remains unavailable. UI should render per-record badges.

Flow: full client history -> pure section retrieval -> source context -> one model step/tools -> property guard -> separate citations -> AI SDK UIMessage SSE. Knowledge citations are source-url parts and trace.citations; visible prose omits raw citation URLs. The prompt requests 1–3 short, question-relevant sentences. The trace endpoint runs the same pipeline. The unchanged guard checks citation and numeric properties, not complete factual entailment; see ADRs 011 and 012. Source flags distinguish real content from the demo brochure; mode:mock separately labels generation. All source anchors were verified against fresh HTML element ids; repeat the offline check with `python scripts/verify-source-anchors.py`.

Frontend: pending. Knowledge view: pending.

Docs: docs/api.md, knowledge-and-media.md, architecture.md, testing.md, providers.md, ai-assistance.md, progress-log.md and real-knowledge-report.md. AGENTS.md is binding. No database/auth/payments/crawler. Legacy fictional response reports are explicitly superseded; old Git history is retained for audit.

Latest-turn file vocabulary gates model tools; generic see/show/photos/included do not. Pronoun-only "send it" remains a limitation: name brochure/video. Explicit customer ids still resolve through the registry. Model history now uses only user/assistant text from the actual UI messages, omitting source/tool/step parts. A previous file is remembered only through the assistant's visible text; this does not create server memory. Registry summaries use fixed customer phrases, and failed model prose is dropped on media turns while text-only failures retain the refusal. The core guard still cannot prove nonnumeric entailment.

The earlier Qwen-only regression passed 19/21 initially and 20/21 after failure-only reruns; the mixed price/file case still omitted a citation on rerun, so visible prose correctly kept only the file summary. Prior Llama returned HTTP 404 for this key (cause unverified); no Llama call in this phase. No production-readiness claim, extra generation or fallback. See ADR 014, docs/history-revision-report.md and the bounded `npm run verify:live` instructions in docs/testing.md.

Server-side source attribution now supplies source parts from lexical answer/chunk overlap; the model is not required to write URLs. The numeric guard remains unchanged. See ADR 015 and docs/source-attribution-report.md for the threshold evidence, raw live answers and quota-blocked cases. The earlier source-attribution campaign stopped at its first 429 after 16 calls; no further scenarios or reruns were attempted.

A message combining a factual question and a media request can lose one part if the model skips a tool call or writes prose that fails grounding. Detected failures fail closed: the backend refuses or keeps only the registry summary, and never invents a replacement fact. This is not a semantic proof that every surviving model clause is true: lexical attribution cannot validate negation, scope or fact/amount ownership. There is no automatic fallback or extra model call to fill missing parts.

The latest offline revision uses three-state media selection (ADR 016): no media noun means no tools, a noun alone permits matching tools, and a noun in a recognized request form requires at least one matching tool call. It cannot guarantee both requested tools or factual prose on a mixed turn. The request forms are English-only and lexical: factual question openers stay optional, but a later explicit modal request can qualify. Wording the forms do not recognize falls back to optional with a media noun, otherwise none; pronoun-only requests do not qualify. Negation and indirect wording are not semantically understood. Provider rejection stays a typed error, without a fallback or second call. This revision made no live provider calls and does not establish improved live reliability. Cancellation knowledge is now four verbatim paragraphs rather than one cross-product chunk; lexical ranking/attribution can still include a different product’s paragraph.

Direct file desires (“I want a video”, “I'd like a brochure”, “I'm after the PDF”) now require a matching media tool; desires to know/ask/find out/understand/learn/check/confirm/clarify/wonder remain optional. Explicit negated file requests offer no model tools, while bare media words remain optional. The English lexical detector is bounded: unrecognized wording is optional with a media noun, otherwise none; negation vetoes the whole turn rather than resolving per-file mixed negation. Request/stream/tool-result shapes remain unchanged.

## Live and labelled mock deployments

Both were deployed from clean commit 6710c21 on 2026-10-31; no code changed during deployment/verification. Authentication/password protection is off and anonymous access passed.

| URL                                                                          | Behavior                                                                                                                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Live Groq](https://sea-view-chatbot-prototype.vercel.app)                   | MODEL_MODE=live, MODEL_PROVIDER=groq, MODEL_ID=qwen/qwen3.8-27b, REASONING_EFFORT=none; existing private Groq key and shared free quota.               |
| [Labelled mock fallback](https://sea-view-chatbot-prototype-mock.vercel.app) | Explicit MODEL_MODE=mock, no provider keys, scripted deterministic answers with mode:mock metadata and a [MOCK] text label; independent of Groq quota. |

The mock deployment is the always-available scripted fallback for quota-independent demonstrations. Users/reviewers choose its separate URL explicitly: there is **no automatic fallback between sites or from live errors to mock**. It uses the same captured real website knowledge and demo brochure; generation mode is separate from source/media isDemo provenance. Mock output is diagnostic/scripted, not evidence of live model quality.

All eight current live smoke scenarios passed, using eight calls, no retries, and >=10-second spacing. Required tool choice worked for brochure, video and both together. Inclusions, VIP price, a dependent follow-up and weather answered with structured citations; age-limit information was refused. Both sites passed public sources (18), PDF signature, video HEAD, invalid-input, runtime/maxDuration checks. Complete exact answers, separate sources/tools, latency and command output are in [the backend-v1 release report](docs/backend-v1-release-report.md). Historical quota-blocked runs remain preserved in their reports.

The live demo shares a free Groq quota. Exhaustion returns a typed RATE_LIMIT message, with optional retryAfterSeconds when supplied upstream, and no automatic mock fallback. A frontend can offer manual retry; this backend does not implement a retry button. The Knowledge view remains pending; its planned test-question button calls the shared trace pipeline and uses one live model call per valid test, consuming the same quota.
