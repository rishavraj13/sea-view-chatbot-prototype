# Sea View Skydiving chatbot backend

Next.js App Router backend with static website knowledge, keyword retrieval, media tools, one-call generation and a citation/numeric property guard. No booking transactions or frontend features.

Use Node >=22.12: npm ci, copy .env.example to .env.local, then npm run dev. Verify with npm run typecheck, npm run lint, npm test, npm run build and npm run format:check. Secrets are read only by src/server/config/env.ts and never returned.

MODEL_MODE=mock is explicitly scripted and makes zero provider calls. Live selection uses MODEL_PROVIDER=google|groq|openrouter and MODEL_ID. Matching keys are GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY and OPENROUTER_API_KEY. Missing selected key is explicitly labelled mock; provider errors never trigger fallback. Model defaults/controls and compatibility are documented in docs/providers.md. Google 2.5 Flash budget defaults to 0; the existing 20-second deadline and one-step generation remain.

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Captured 2026-10-31 as fifteen logical JSON sections with isDemo:false. Text is copied from the requested sections without reconciling differing taglines and identical package inclusions. Static capture is not a crawler or a promise of present-day pricing. Unsupported age/weight/health/clothing/pickup-price/baggage questions return no retrieval match.

The actual page video is linked with isDemo:false and a page-supplied poster. It was HEAD-verified but not downloaded or playback-tested. public/demo/brochure.pdf is generated DEMO MATERIAL from the real package facts (isDemo:true), not an official site PDF. The retired test asset remains unavailable. UI should render per-record badges.

Flow: full client history -> pure section retrieval -> source context -> one model step/tools -> property guard -> AI SDK UIMessage SSE. The trace endpoint runs the same pipeline. The guard checks citation and numeric properties, not complete factual entailment; see ADR 011. Source flags distinguish real content from the demo brochure; mode:mock separately labels generation.

Frontend: pending. Knowledge view: pending.

Docs: docs/api.md, knowledge-and-media.md, architecture.md, testing.md, providers.md, ai-assistance.md, progress-log.md and real-knowledge-report.md. AGENTS.md is binding. No database/auth/payments/crawler or deployment changes. Legacy fictional response reports are explicitly superseded; old Git history is retained for audit.
