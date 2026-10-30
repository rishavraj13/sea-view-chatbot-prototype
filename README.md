# Sea View Skydiving chatbot prototype (backend)

DEMO ONLY: fictional content, pricing, policies and location. No actual bookings.

Use Node >=22.12: npm ci, copy .env.example to .env.local, npm run dev. Run npm run typecheck, npm run lint, npm test and npm run build. Formatting: npm run format:check.

MODEL_MODE=mock is deterministic. MODEL_MODE=live with GOOGLE_GENERATIVE_AI_API_KEY enables Google; no key falls back to mock. GOOGLE_MODEL defaults to gemini-2.5-flash. Secrets are read only by src/server/config/env.ts and never returned. Restart after changing environment.

Agent flow: validate full client history -> keyword retrieval -> shared pipeline -> model tools -> registry -> grounded answer -> AI SDK UIMessage SSE. Trace uses the same pipeline. Sources are bundled JSON under data/knowledge; media manifest is under data/media. The generated PDF is public/demo/brochure.pdf; video is a labelled external sample.

Frontend: pending. Knowledge view: pending.

Limitations: lexical retrieval, extractive live answers, bounded text/tool history, static availability, public trace invokes the model, no application rate limiter (provider 429 mapped), no credentialed live validation, no database/auth/payments/crawler. No token-by-token emission: results are checked before SSE serialization. Backend is frozen at Phase 1 completion; contract changes need approval.

AI assistance: Codex authored code and docs; see docs/ai-assistance.md. See docs/architecture.md, docs/api.md, docs/knowledge-and-media.md, docs/testing.md and docs/progress-log.md. AGENTS.md is binding.
