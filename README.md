# Sea View Skydiving chatbot prototype (backend)

DEMO ONLY: fictional content, pricing, policies and location. No actual bookings.

Use Node >=22.12: npm ci, copy .env.example to .env.local, npm run dev. Run npm run typecheck, npm run lint, npm test and npm run build. Formatting: npm run format:check.

MODEL_MODE=mock is deterministic. MODEL_MODE=live with GOOGLE_GENERATIVE_AI_API_KEY enables Google; no key falls back to mock. GOOGLE_MODEL defaults to gemini-2.5-flash. Secrets are read only by src/server/config/env.ts and never returned. Restart after changing environment.

Agent flow: validate full client history -> keyword retrieval -> shared pipeline -> model tools -> registry -> grounded answer -> AI SDK UIMessage SSE. Trace uses the same pipeline. Sources are bundled JSON under data/knowledge; media manifest is under data/media. The generated PDF is public/demo/brochure.pdf; video is a labelled external sample.

Frontend: pending. Knowledge view: pending.

Limitations: lexical retrieval, extractive live answers, bounded text/tool history, static availability, public trace invokes the model, no application rate limiter (provider 429 mapped), no credentialed live validation, no database/auth/payments/crawler. No token-by-token emission: results are checked before SSE serialization. Backend is frozen at Phase 1 completion; contract changes need approval.

AI assistance: Codex authored code and docs; see docs/ai-assistance.md. See docs/architecture.md, docs/api.md, docs/knowledge-and-media.md, docs/testing.md and docs/progress-log.md. AGENTS.md is binding.

## Switching model providers (Phase 1.7)

Set MODEL_MODE=live, MODEL_PROVIDER and MODEL_ID in gitignored .env.local, with only the selected provider's matching key. Restart the server. Do not put secrets in MODEL_ID or client configuration. Provider failures never trigger another provider or mock fallback. Missing selected key is explicitly labelled mock. No deployment was made in this phase.

| Provider   | Example MODEL_ID                   | Key variable                 |
| ---------- | ---------------------------------- | ---------------------------- |
| google     | gemini-2.5-flash                   | GOOGLE_GENERATIVE_AI_API_KEY |
| groq       | llama-3.3-70b-versatile            | GROQ_API_KEY                 |
| openrouter | nvidia/nemotron-3.5-lightning:free | OPENROUTER_API_KEY           |

MODEL_MODE defaults to mock, MODEL_PROVIDER to google. MODEL_ID overrides the provider default. Legacy GOOGLE_MODEL remains the Google-only fallback when MODEL_ID is absent. Other provider defaults are the examples above. GOOGLE_THINKING_BUDGET=0 disables thinking on supported Gemini 2.5 Flash models; GOOGLE_THINKING_LEVEL=low applies to Gemini 3/4. REASONING_EFFORT=low controls supported Groq reasoning models and OpenRouter; applicability is model-specific (see docs/providers.md). The 20-second request deadline remains.

For a future deployment configure MODEL_MODE, MODEL_PROVIDER, MODEL_ID, the selected key, and any reasoning overrides in the hosting environment. Use .env.example as the local template; never upload .env.local. OpenRouter backend fallback is disabled. No Ollama adapter is implemented in this phase's approved provider set.

Live calls now use one generation step, including tools; the media summary is deterministic. Same-step text still must pass the grounding check. The live info example returned a refusal for a covered question: provider flexibility and lower latency do not solve that separate quality limitation. See docs/phase-1.7-report.md for real evidence.
