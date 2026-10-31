# Sea View Skydiving chatbot backend

Next.js App Router backend with static website knowledge, keyword retrieval, media tools, one-call generation and a citation/numeric property guard. No booking transactions or frontend features.

Use Node >=22.12: npm ci, copy .env.example to .env.local, then npm run dev. Verify with npm run typecheck, npm run lint, npm test, npm run build and npm run format:check. Secrets are read only by src/server/config/env.ts and never returned.

MODEL_MODE=mock is explicitly scripted and makes zero provider calls. Live selection uses MODEL_PROVIDER=google|groq|openrouter and MODEL_ID. Matching keys are GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY and OPENROUTER_API_KEY. Missing selected key is explicitly labelled mock; provider errors never trigger fallback. Model defaults/controls and compatibility are documented in docs/providers.md. Google 2.5 Flash budget defaults to 0; the existing 20-second deadline and one-step generation remain.

## Selected live provider and switching

The selected Groq configuration is `MODEL_MODE=live`, `MODEL_PROVIDER=groq`, `MODEL_ID=qwen/qwen3.8-27b`, `REASONING_EFFORT=none`, with `GROQ_API_KEY` privately in .env.local. The committed .env.example selects the same provider/model but keeps explicit mock mode until you enable live. The bounded live run used process overrides without rewriting .env.local. Rain, VIP pricing and simultaneous media tools passed, but the dependent follow-up failed; selection is not production-readiness approval. The raw results, limitations and exact check output are in docs/live-provider-report.md. Provider choice is configuration only; there is no automatic fallback.

To switch explicitly to Google, set `MODEL_PROVIDER=google`, `MODEL_ID=gemini-2.5-flash`, `MODEL_MODE=live` and provide `GOOGLE_GENERATIVE_AI_API_KEY` locally. Its existing thinking-budget default is 0. To select OpenRouter, set `MODEL_PROVIDER=openrouter`, an explicit currently supported tool-capable `MODEL_ID`, and `OPENROUTER_API_KEY`; its model/backend support must be verified before relying on it. `REASONING_EFFORT=none` disables OpenRouter reasoning where supported. Keep keys out of source control, restart the local server after changing configuration, and verify response metadata rather than assuming the provider switched. No Google/OpenRouter live calls were made in this phase. Vercel requires the same explicit provider/model and matching private key scoped to Production, followed by a future authorized redeployment. See docs/deployment-plan.md for exact live-Groq variables and protection-disable steps; no deployment or protection change was performed.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Captured 2026-10-31 as fifteen logical JSON sections with isDemo:false. Text is copied from the requested sections without reconciling differing taglines and identical package inclusions. Static capture is not a crawler or a promise of present-day pricing. Unsupported age/weight/health/clothing/pickup-price/baggage questions return no retrieval match.

The actual page video is linked with isDemo:false and a page-supplied poster. It was HEAD-verified but not downloaded or playback-tested. public/demo/brochure.pdf is generated DEMO MATERIAL from the real package facts (isDemo:true), not an official site PDF. The retired test asset remains unavailable. UI should render per-record badges.

Flow: full client history -> pure section retrieval -> source context -> one model step/tools -> property guard -> separate citations -> AI SDK UIMessage SSE. Knowledge citations are source-url parts and trace.citations; visible prose omits raw citation URLs. The prompt requests 1–3 short, question-relevant sentences. The trace endpoint runs the same pipeline. The unchanged guard checks citation and numeric properties, not complete factual entailment; see ADRs 011 and 012. Source flags distinguish real content from the demo brochure; mode:mock separately labels generation. All source anchors were verified against fresh HTML element ids; repeat the offline check with `python scripts/verify-source-anchors.py`.

Frontend: pending. Knowledge view: pending.

Docs: docs/api.md, knowledge-and-media.md, architecture.md, testing.md, providers.md, ai-assistance.md, progress-log.md and real-knowledge-report.md. AGENTS.md is binding. No database/auth/payments/crawler or deployment changes. Legacy fictional response reports are explicitly superseded; old Git history is retained for audit.
