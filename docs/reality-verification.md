# Reality verification (incomplete)

No runtime backend code or API contract was changed. New verification script and documentation only.

Historical first verification lacked credentials. Credentials and Vercel authentication were subsequently supplied. See the credentialed follow-up below for real live results and preview evidence. No API contract or runtime backend behavior has been changed. No acceptance commit is permitted until all required checks pass.

## Captured commands

```text
node scripts/verify-http.mjs http://127.0.0.1:3000 missing-key mock
missing-key info: chat=200 trace=200 mode=mock tools=
missing-key brochure: chat=200 trace=200 mode=mock tools=sendBrochure
missing-key video: chat=200 trace=200 mode=mock tools=showVideo
missing-key both: chat=200 trace=200 mode=mock tools=sendBrochure,showVideo
missing-key follow-up: chat=200 trace=200 mode=mock tools=
missing-key unknown: chat=200 trace=200 mode=mock tools=
missing-key unavailable: chat=200 trace=200 mode=mock tools=sendBrochure
SDK DefaultChatTransport + readUIMessageStream verification completed.

node scripts/verify-http.mjs http://127.0.0.1:3000 invalid-key error
invalid-key info: chat=502 trace=502 mode=live tools=none
invalid-key brochure: chat=502 trace=502 mode=live tools=none
invalid-key video: chat=502 trace=502 mode=live tools=none
invalid-key both: chat=502 trace=502 mode=live tools=none
invalid-key follow-up: chat=502 trace=502 mode=live tools=none
invalid-key unknown: chat=502 trace=502 mode=live tools=none
invalid-key unavailable: chat=502 trace=502 mode=live tools=none
SDK DefaultChatTransport + readUIMessageStream verification completed.

npx --yes vercel@latest whoami
Vercel CLI 65.8.0 (Node.js 24.18.0)
> Logged out.
> Run `vercel deploy --temporary` to create a temporary deployment you can claim later, or `vercel login` to log in.

git status --short
fatal: not a git repository (or any of the parent directories): .git
```

## Evidence and results

Full raw SSE and parsed UIMessage objects: [missing-key](examples/verification/missing-key.json). Sanitized real invalid-key endpoint errors: [invalid-key](examples/verification/invalid-key.json). The invalid-key test deliberately uses a placeholder, not a real credential. All seven cases get 502 from both endpoints: no successful live model calls or model tool calls can be claimed.

Missing-key mode is explicit in start/finish metadata, x-model-mode and MOCK text. This is the documented existing fallback, not a silent live answer. Invalid credentials produce {"mode":"live","error":{"code":"MODEL_FAILURE","message":"The model is temporarily unavailable."}}. No provider payloads or credentials are captured.

The SDK consumer uses DefaultChatTransport.sendMessages and readUIMessageStream over real HTTP, rather than manually splitting SSE. It asserts mode, nonempty text, and both completed tool outputs with demo flags for the both case. Captures preserve complete output objects, including URLs and discriminants. Successful transport checks do not prove successful live tool selection.

Observed defect: requesting retired (an existing manifest entry marked unavailable) in mock mode returns the available brochure instead. The mock branch only recognizes the word missing for ID selection. This is not a successful unavailable-asset behavior check.

Follow-up chat resends the actual prior assistant response with client history. Trace cannot receive history: its approved body contains only question. It cannot reproduce a history-dependent chat invocation. The latest question alone drives retrieval, so pronoun-only follow-ups can lack context. No API change made to conceal that limitation.

## Proposed changes requiring approval before implementation

No contract changes are needed for the SDK consumer or ADR. Proposed behavior fixes: resolve explicitly requested registry IDs in mock mode, and use validated conversational context for follow-up retrieval. If trace must reproduce a history-dependent call, approve an optional messages field in POST /api/knowledge/trace; that would be an API contract extension and is NOT implemented.

## Repeat after setup

Place the valid key in gitignored .env.local locally, set MODEL_MODE=live and restart without shell environment overrides. Run node scripts/verify-http.mjs http://127.0.0.1:3000 credentialed-live live. It fails if the server silently reports mock. For an authenticated Vercel preview, authenticate CLI and choose the project; deploy using vercel deploy, then run the same script against the preview URL and verify GET /api/knowledge/sources and the PDF. Confirm deployed function configuration includes 30-second chat/trace and 10-second sources maxDuration; local constants alone are not deployment evidence.

## Real check output

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

> assignment@0.1.0 test
> vitest run
 RUN  v5.0.5 C:/assignment
 Test Files  6 passed (6)
      Tests  16 passed (16)
   Start at  23:21:31
   Duration  787ms (import 75%, transform 12%, tests 5%, setup 5%, worker 2%)
```

These offline tests pass; they do not cover the newly observed behavioral defects. Phase verification remains incomplete.

## Credentialed follow-up

The renamed GOOGLE_GENERATIVE_AI_API_KEY is configured locally (only a boolean presence check was printed). The key is never included in captures. Local Next uses .env.local in live mode. The first live suite produced chat info=200, brochure=504, video=504, both=200, follow-up=429, unknown=429, unavailable=429. Trace returned respectively 504, 504, 200, 429, 429, 429, 429. Full real SSE, typed errors and parsed tool parts are in [credentialed-live.json](examples/verification/credentialed-live.json). Live chat executed both sendBrochure and showVideo together; trace executed showVideo. Other cases cannot be called successful. A paced retry is recorded separately when complete.

### Vercel preview

Approved account/project: rishiiwithai-4565/sea-view-chatbot-prototype.
Preview: https://sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app

Authenticated vercel curl returned HTTP 200 for GET /api/knowledge/sources, POST /api/chat, POST /api/knowledge/trace and GET /demo/brochure.pdf. Preview is explicitly mock: local credentials were not uploaded. This verifies serverless data loading and transport, not live Google availability on Vercel. Deployment Protection remains enabled; authenticated CLI bypass was used for verification.

Vercel inspect --json confirms target=preview, state=READY, runtime=nodejs26.x for all routes, timeout=30 for api/chat and api/knowledge/trace, timeout=10 for api/knowledge/sources. Minimal deployment evidence is in [preview-deployment.json](examples/verification/preview-deployment.json).

Vercel assigned the first deployment to production automatically during project creation. That initial URL is https://sea-view-chatbot-prototype.vercel.app; it is separate from the explicit preview above. No key was uploaded to either deployment.

```text
node scripts/verify-preview.mjs
Preview captures verified: 5 bundled sources; mock mode explicit; SSE text and both media payloads intact and equal to trace; PDF signature valid.

> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0

> assignment@0.1.0 test
> vitest run
 RUN  v5.0.5 C:/assignment
 Test Files  6 passed (6)
      Tests  16 passed (16)
   Start at  23:36:44
   Duration  547ms (import 74%, transform 11%, setup 6%, tests 6%, worker 3%)
```

## Final credentialed results

See [live-verification.md](live-verification.md) for the completed seven-scenario result table, both full capture files, the confirmed preview URL/settings, and failed acceptance status. No commit was made.
