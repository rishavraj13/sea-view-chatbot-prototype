# Binding repository rules

- TypeScript strict, no `any`, small single-purpose modules, comments only for non-obvious "why".
- No patch work or workarounds: fix root causes.
- Secrets are read only via src/server/config/env.ts, validated with zod, and never exposed to the client.
- All external input is validated with zod.
- Anything mock is labelled in code, API responses, and docs.
- Docs are part of done: update docs/ and docs/progress-log.md in the same change as the code.
- Every phase ends with real typecheck, lint, and test output pasted into the report.
- No database, auth, payments, or crawler. No scope creep.
- Backend code is frozen after Phase 1 unless a contract change is approved.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
