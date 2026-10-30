# Credentialed live verification results

No API contract or backend runtime code changed. A valid local Google key and Vercel authentication were supplied. Google credentials were never printed, committed or uploaded. Vercel preview uses explicit mock mode.

## Live results

Each row contains actual independent chat and trace calls. 200 means successful HTTP transport, not necessarily a satisfactory factual answer. Inspect full SSE/parsed messages and trace JSON in the linked captures. A trace call has only the question, so the follow-up trace cannot reproduce chat history under the current contract.

| Scenario    | First chat / trace | Paced chat / trace | Live tool calling observed                                           |
| ----------- | ------------------ | ------------------ | -------------------------------------------------------------------- |
| info        | 200 / 504          | 200 / 200          | No tools requested; live answer text received.                       |
| brochure    | 504 / 504          | 200 / 200          | sendBrochure succeeded in paced chat and trace.                      |
| video       | 504 / 200          | 200 / 429          | showVideo succeeded in paced chat and first-run trace.               |
| both        | 200 / 429          | 429 / 429          | Both tools succeeded together in first-run chat; trace rate-limited. |
| follow-up   | 429 / 429          | 429 / 429          | Unverified: provider 429; no live tool call observed.                |
| unknown     | 429 / 429          | 429 / 429          | Unverified: provider 429; no live tool call observed.                |
| unavailable | 429 / 429          | 429 / 429          | Unverified: provider 429; no live unavailable result observed.       |

Full real outputs: [first run](examples/verification/credentialed-live.json), [paced run](examples/verification/credentialed-paced.json). Both runs exited 1 because not all chat assertions passed. Trace failures additionally prevent full acceptance. The 35-second-paced run still encountered 429; no further quota-consuming retries were attempted.

## Real command output

```text
node scripts/verify-http.mjs http://127.0.0.1:3000 credentialed-live live
credentialed-live info: chat=200 trace=504 mode=live tools=
credentialed-live brochure: chat=504 trace=504 mode=live tools=
credentialed-live video: chat=504 trace=200 mode=live tools=showVideo
credentialed-live both: chat=200 trace=429 mode=live tools=
credentialed-live follow-up: chat=429 trace=429 mode=live tools=
credentialed-live unknown: chat=429 trace=429 mode=live tools=
credentialed-live unavailable: chat=429 trace=429 mode=live tools=
SDK DefaultChatTransport + readUIMessageStream verification completed.
AssertionError [ERR_ASSERTION]: 5 !== 0
Exit code: 1

node scripts/verify-http.mjs http://127.0.0.1:3000 credentialed-paced live 35000
credentialed-paced info: chat=200 trace=200 mode=live tools=
credentialed-paced brochure: chat=200 trace=200 mode=live tools=sendBrochure
credentialed-paced video: chat=200 trace=429 mode=live tools=
credentialed-paced both: chat=429 trace=429 mode=live tools=
credentialed-paced follow-up: chat=429 trace=429 mode=live tools=
credentialed-paced unknown: chat=429 trace=429 mode=live tools=
credentialed-paced unavailable: chat=429 trace=429 mode=live tools=
SDK DefaultChatTransport + readUIMessageStream verification completed.
AssertionError [ERR_ASSERTION]: 4 !== 0
Exit code: 1
```

## Deployed preview

[Preview URL](https://sea-view-chatbot-prototype-3i05o5oyk-rishiiwithai-4565.vercel.app), project rishiiwithai-4565/sea-view-chatbot-prototype. Deployment Protection is enabled; endpoint checks used authenticated Vercel CLI. It is READY with target=preview. Inspect evidence: [deployment summary](examples/verification/preview-deployment.json).

Actual deployed runtimes: nodejs26.x. Function timeouts: chat 30s, trace 30s, sources 10s. All three endpoints and /demo/brochure.pdf returned HTTP 200. Five JSON sources loaded. Preview SSE has explicit mock mode, and official SDK transport/parser preserved text and both media outputs equal to trace. This does not verify live credentials on Vercel: they were intentionally not uploaded.

```text
sources HTTP 200
chat HTTP 200
trace HTTP 200
brochure HTTP 200
node scripts/verify-preview.mjs
Preview captures verified: 5 bundled sources; mock mode explicit; SSE text and both media payloads intact and equal to trace; PDF signature valid.
```

Vercel assigned the first deployment to production automatically during project creation; its separate initial URL is https://sea-view-chatbot-prototype.vercel.app. The explicit preview above is the verification target.

## Mode safety and SDK consumer

Existing [missing-key](examples/verification/missing-key.json) responses explicitly report mock in metadata/header and MOCK answer text. Existing [invalid-key](examples/verification/invalid-key.json) responses return 502 MODEL_FAILURE with mode:live. No silent live-to-mock transition on provider errors. Real credentialed 429 and 504 responses remain mode:live with RATE_LIMIT/TIMEOUT, never mock.

The HTTP consumer uses DefaultChatTransport and readUIMessageStream, validates discriminated media result shapes, asserts requested tools and captures exact response text. The preview consumer parses actual captured server bytes through those same SDK components.

## Acceptance and contract

All 16 offline tests, typecheck and lint pass (exact output in reality-verification.md). Full live acceptance fails due to observed timeouts/rate limits and unresolved behavior defects. No feat: backend pipeline commit was created because the user explicitly conditioned that commit on everything passing. Git was initialized and .env.local plus .vercel/project.json are confirmed ignored.

Known defects from earlier checks remain: mock intent ignores explicitly requested retired asset IDs, and latest-question-only retrieval lacks follow-up context. Backend remains frozen; these have not been fixed secretly.

Proposed contract extension, not implemented: optional messages on POST /api/knowledge/trace so trace can reproduce history-dependent chat. No schema changes are needed for the SDK consumer or the existing mode flags. Registry-ID selection and history-aware retrieval are proposed implementation fixes within the existing chat schema; no such runtime changes were made in this verification task.
