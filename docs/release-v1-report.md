# v1.0 release deployment report

Date: 2026-11-02. master was fast-forwarded from backend-v1 to frontend / v1.0-rc1, commit 34e8ab05cce1dc3b0b102391a4af502fcaae3800. Tag v1.0 initially selected that exact source. No application, test, script, config or dependency code changed during release. The owner later supplied Lighthouse results and instructed continuing verification after the image-cache failure; no cache/performance change was authorized or made. The final docs-only commit moves v1.0 without another deployment; it has identical executable source to the deployed commit.

## Production deployments

| Site                   | Public URL                                         | Immutable deployment                                                           | Deployment id                    |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| Live Groq              | https://sea-view-chatbot-prototype.vercel.app      | https://sea-view-chatbot-prototype-qwqm9j2pv-rishiiwithai-4565.vercel.app      | dpl_WgjFesrR2iDH7zDB7a1ard9TNNgK |
| Explicit labelled mock | https://sea-view-chatbot-prototype-mock.vercel.app | https://sea-view-chatbot-prototype-mock-ppcr32eec-rishiiwithai-4565.vercel.app | dpl_4YCmMiMJSoDi2cYWjasVdpQhut9J |

Both deploy the same clean git archive of 34e8ab0, excluding local private envs, .vercel, node_modules, ignored output and untracked files. The committed historical citation report is included; no uncommitted owner edit was archived or staged. At release start lh-home.json was untracked and port3000 occupied; it was left untouched and excluded. After the owner's server shutdown, later local runs checked both ports free. The owner subsequently removed that untracked artifact and ran their measurement server on 3100; that too was left untouched until the owner stopped it. No process was killed by the agent.

CLI 65.8.0 commands from separate clean live/mock extracted folders:

```text
vercel link --yes --project sea-view-chatbot-prototype --scope rishiiwithai-4565
vercel deploy --prod --yes --no-color
vercel link --yes --project sea-view-chatbot-prototype-mock --scope rishiiwithai-4565
vercel deploy --prod --yes --no-color
```

Link wrote an OIDC .env.local automatically; it was removed before upload. No local provider-key file was copied. Existing Vercel production environment stayed unchanged. Live variable NAMES: GROQ_API_KEY, REASONING_EFFORT, MODEL_ID, MODEL_PROVIDER, MODEL_MODE. Mock: REASONING_EFFORT, MODEL_ID, MODEL_PROVIDER, MODEL_MODE; no provider key. No values or CLI credentials were printed. SSO/password/trusted-IP protection is off, Node26.x unchanged; no Vercel project setting needed changes. Deployment stdout confirms READY, production alias and deploymentProtection:[] (deploy-live.txt/deploy-mock.txt).

Current official CLI references checked: [deploy](https://vercel.com/docs/cli/deploy), [inspect](https://vercel.com/docs/cli/inspect), [env](https://vercel.com/docs/cli/env), [deployment protection](https://vercel.com/docs/deployment-protection). Actual installed CLI output/source metadata, not documentation alone, establishes this deployment's settings.

## Anonymous no-model checks

No auth/bypass cookie/header was used. Valid chat requests were restricted to the explicit mock site. Exact results are no-model-checks.json; both public page responses are HTTP200 rather than Vercel auth challenges.

| Check                                                                                | Live                  | Mock                  |
| ------------------------------------------------------------------------------------ | --------------------- | --------------------- |
| / and /knowledge, correct title/description, one h1 each                             | PASS                  | PASS                  |
| #packages / #plan / #faq anchors exist                                               | PASS                  | PASS                  |
| Public sources, exactly 18 committed sections + manifest, no env/conversation fields | PASS                  | PASS                  |
| Demo PDF HTTP200/application/pdf/%PDF-                                               | PASS                  | PASS                  |
| All five source images and optimized URLs HTTP200/correct type                       | PASS                  | PASS                  |
| Image long-cache requirement                                                         | FAIL: max-age=0       | FAIL: max-age=0       |
| Three hashed local fonts HTTP200/font type/long immutable cache                      | PASS                  | PASS                  |
| Invalid chat HTTP400/INVALID_INPUT, correct mode/groq/qwen metadata                  | PASS                  | PASS                  |
| Every footer/demo link HTTP200 or followed normal redirect; anchors valid            | PASS                  | PASS                  |
| nodejs26.x runtime; maxDuration chat30 / trace30 / sources10                         | PASS (actual inspect) | PASS (actual inspect) |
| Brochure+video, labelled mock, both completed SDK tool results                       | Not called            | PASS                  |
| Negated brochure, labelled mock, no tool result                                      | Not called            | PASS                  |

External video: one HTTP HEAD total, 200/video/mp4, body not downloaded. This is a media availability check, not playback/codec certification. Its result is shared by both sites because the registry URL is identical.

All image responses checked (public originals and optimized /_next/image) expose `Cache-Control: public, max-age=0, must-revalidate`; all hashed fonts expose `public,max-age=31536000,immutable`. Image long-cache verification remains failed. No unverified cache/CDN/performance cause is claimed. After reporting this deployment-verification defect and stopping, the owner explicitly directed continuing runtime/smoke/docs/archive. No configuration workaround or asset mutation was made.

An initial throwaway verifier incorrectly expected only media/sources top-level keys; the documented endpoint also returns isDemo. That test assumption was corrected and exact data rechecked with no extra model/video request. The source data was correct throughout; initial stdout remains for transparency and corrected no-model-checks.json is authoritative (live25/30, mock27/32 with only five image-cache failures each). Runtime inspection was subsequently completed with safe field projection in runtime-and-projects.json.

Remote Playwright was skipped under the brief's explicit condition: the existing config hardcodes baseURL and local webServer, with no CLI/env override. No config file was changed to bypass port/server behavior. Anonymous network checks and actual DefaultChatTransport/readUIMessageStream consumption prove the scoped remote results, not a full remote browser test suite pass.

## Live smoke — stopped on first 429

The unchanged remote verifier ran from a FRESH task-specific cwd; its ledger lives at docs/examples/production-smoke/budget.json relative to that cwd, copied into examples/release-v1/live-smoke. Historical stopped/spent ledgers were neither edited nor reset.

```powershell
node C:\assignment\node_modules\tsx\dist\cli.mjs --tsconfig C:\assignment\tsconfig.json C:\assignment\scripts\verify-live.mjs --base-url https://sea-view-chatbot-prototype.vercel.app
```

This is the existing verify:live entry without loading a local credential file in remote mode. No direct one-token quota probe was made because this harness's ledger has no accounting path for that extra direct request; the eight-call cap was reserved for scenarios. Existing harness order starts brochure/video/both/inclusions rather than the order in the question list, preserving exact wording and VIP→follow-up dependency. No script/test/config code was changed.

Cap8, minimum spacing10000ms, maxRetries0; STOP on first429. One actual endpoint request/provider error occurred, zero retries/reruns. With only one start, inter-call spacing is not applicable rather than a fabricated measured minimum. Seven scenarios were NOT RUN because of the mandatory stop. No fallback or extra request attempted to produce passing evidence.

| Question                             | Result                  | Served answer / public error  | Executed tools | Requests / expected provider calls | Latency |
| ------------------------------------ | ----------------------- | ----------------------------- | -------------- | ---------------------------------- | ------- |
| What is included in the package?     | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| Can you send me a brochure?          | QUOTA BLOCKED (HTTP429) | RATE_LIMIT; no answer         | none           | 1 / 1                              | 1315ms  |
| Can I see a video of the experience? | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| Send me the brochure and a video.    | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| How much is the VIP package?         | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| and what's included?                 | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| What if it rains?                    | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |
| What is the age limit?               | NOT RUN                 | mandatory stop after first429 | not observed   | 0 / 0                              | —       |

Public raw error body (no served assistant text, no citations or tool-result parts):

```json
{
  "mode": "live",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "error": {
    "code": "RATE_LIMIT",
    "message": "The model rate limit was reached. Please retry later."
  }
}
```

`error.retryAfterSeconds` is absent, not zero. Public response exposed no quota internals. The request started 2026-11-02T02:16:41.802Z, latency1315ms. Public endpoint dispatch count is1; code has one generation step/maxRetries0 and one matching upstream429 log was observed. No private upstream answer or token usage is exposed by the public API. ToolChoice required could NOT be validated live for brochure/video/both in this run because quota blocked the first call.

Only the matching structured runtime event is reported, obtained with vercel logs filtered to provider_error:

```json
{
  "event": "provider_error",
  "provider": "groq",
  "modelId": "qwen/qwen3.8-27b",
  "upstreamStatus": 429,
  "errorType": "tokens",
  "errorCode": "rate_limit_exceeded",
  "rateLimitHeaders": {
    "x-ratelimit-limit-requests": "1000",
    "x-ratelimit-limit-tokens": "8000",
    "x-ratelimit-remaining-requests": "1000",
    "x-ratelimit-remaining-tokens": "8000",
    "x-ratelimit-reset-requests": "1ms",
    "x-ratelimit-reset-tokens": "1ms"
  }
}
```

The event contains only event/provider/modelId/upstreamStatus/errorType/errorCode and the fixed quota-header allowlist. No key, request/response body, conversation text, provider message or stack trace appears. Type tokens identifies a token-limit rejection, but these remaining/reset headers alone do not establish whether the rejecting bucket was TPM/TPD or actual usage; do not infer the cause from a fully remaining advertised bucket. There is no retry-after in the event, hence the public omission. No retry was made. The first request is recorded as failed/quota-blocked, not a passed model scenario.

## Owner-supplied Lighthouse results

## Owner-supplied Lighthouse measurement — 2026-11-02

The owner supplied these measured results verbatim; no scores were altered, rounded or estimated. Tool: Lighthouse `<VERSION>` (the supplied version placeholder is retained; the actual version was not specified).

Command supplied by the owner:

```text
npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new"
```

Method: default mobile emulation and simulated throttling, 3 runs per page, median reported. Target: local production build (`npm run build; npm run start -- -p 3100`) in explicit mock mode on the owner's Windows machine.

```text
Date: 2026-11-02. Tool: Lighthouse <VERSION>. Command: npx lighthouse <url> --only-categories=performance,
accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new" (default mobile
emulation and simulated throttling), 3 runs per page, median reported. Target: local production build
(npm run build; npm run start -- -p 3100) in explicit mock mode on the owner's Windows machine.
/ : Performance 84 (runs 82, 84, 84), Accessibility 100 (100, 100, 100), Best Practices 96 (96, 96, 96),
SEO 100 (100, 100, 100).
/knowledge : Performance 77 (runs 76, 77, 79), Accessibility 100 (100, 100, 100), Best Practices 96
(96, 96, 96), SEO 100 (100, 100, 100).
```

Performance is below the **85 internal target on both pages**. These are local Lighthouse measurements under simulated mobile throttling, **not field data** or deployed-production scores. No performance work was done after measurement. No unverified cause is attributed to the scores. This replaces the earlier “not measured” status; it does not establish universal Lighthouse certification or a passing performance target.

The numbers are now measured owner-supplied results, not “not measured”. Actual tool version remains the literal supplied <VERSION> placeholder; no inferred version/causes/field score. No application/config/performance work occurred after the measurement in this release task.

## Clean archive and independent build

The tagged deployment-source ZIP was unzipped into a fresh temp tree with no .env.local or .vercel. Actual commands there with MODEL_MODE=mock:

```text
npm ci
npm run verify:offline
```

npm ci succeeded with the committed lockfile, reporting17 moderate advisories and no dependency fix. It also warned about pending install-script approval; no approval/config/dependency change was made and the build still passed. Real output:

```text
> assignment@0.1.0 verify:offline
> npm run typecheck && npm run lint && npm test && npm run build


> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully

> assignment@0.1.0 lint
> eslint . --max-warnings=0


> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/Users/risha/AppData/Local/Temp/sea-view-v1-archive-check-05orm3xy


 Test Files  47 passed (47)
      Tests  661 passed (661)
   Start at  07:50:11
   Duration  7.66s (import 38%, setup 22%, transform 19%, environment 14%, tests 8%, worker 1%)

     Import  236 modules were evaluated 1936 times · 25.91s total, 38% of tracked time
             ~819ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation


> assignment@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Running next.config.ts took 36ms

  Creating an optimized production build ...
✓ Compiled successfully in 3.9s
  Running TypeScript ...
  Finished TypeScript in 4.2s ...
  Collecting page data using 8 workers ...
  Generating static pages using 8 workers (0/7) ...
  Generating static pages using 8 workers (1/7)
  Generating static pages using 8 workers (3/7)
  Generating static pages using 8 workers (5/7)
✓ Generating static pages using 8 workers (7/7) in 676ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/knowledge/sources
├ ƒ /api/knowledge/trace
└ ○ /knowledge


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

No server/live model ran during archive checks. The extracted folder was verified inside the designated temp root. Automatic approval review nevertheless rejected its removal, stating only “blocked by policy”. It remains at C:/Users/risha/AppData/Local/Temp/sea-view-v1-archive-check-05orm3xy for owner cleanup; no alternative deletion method was attempted. The final v1.0 ZIP is created again from the docs-only final commit outside the repo, independently extracted/npm-ci/offline-verified, with its verified temp path recorded for cleanup; any automatic-review cleanup rejection is reported rather than bypassed. Final concrete path/size/SHA256/large-entry table and final tagged-archive check output are in the delivered outside-repo companion manifest, avoiding a self-referential archive hash in its own source docs. The deployed-source commands above supply the report's already-captured typecheck/lint/test/build output. All code in the final archive is identical to deployed34e8ab0.

## Deviations, scope and remaining limits

- Required long image cache check fails; owner instructed continuing after report. No fix, config change or redeploy after the scores.
- Live smoke used1/8 and stopped429; seven unattempted, no reruns. This is not successful live tool/factual verification. No direct probe or automatic mock fallback.
- Existing fixed harness scenario order preserved exact sentences; no code change to reorder. Inter-call spacing is not measurable with one call.
- Remote browser specs skipped because no supported external baseURL override exists without code/config changes. Local production-build e2e from prior phase was240/240; that historical pass is not a new remote result.
- Supplied Lighthouse values/method/date are recorded literally, version placeholder unresolved. Both performance medians are below85; simulated local measurements are not field data. No performance work followed measurement.
- Clean archive contains committed public historical reports, including the committed citation report baseline. The owner's uncommitted edit was not present in the tagged source and no current protected-file change was made.
- The only server-code difference from backend-v1 remains src/server/chat/pipeline.ts; its approved new mock regression test is the only added server test. No API/data/demo/scripts changes, dependency version/range/lock changes, or application/config/test changes in this release task. Only docs/evidence are committed.
- Demo links remain runtime-configured in src/content/site.ts; URL/Markdown links are checked, not silently rewritten. Existing environment variable values are not printed/copied. Public response metadata confirms live/mock/groq/qwen; reasoning none remains the unchanged production setting, not newly exposed public metadata.
- Both production URLs are already updated to this source even though image caching/live quota checks are not all green. v1.0 identifies the released source with these explicit limitations; no Lighthouse/performance/field reliability certification.

Cleanup deviation: automatic approval review rejected a native PowerShell Remove-Item -LiteralPath of the separately verified exact temporary build directory, providing no reason beyond blocked by policy. No destructive command ran, no owner directory was removed, and no other shell/API was tried to bypass the rejection. That required cleanup remains incomplete and is listed in the final handoff.

## Final document and source checks

The Markdown check found32 relative links in the updated docs and zero missing targets; owner Lighthouse code blocks in README/testing exactly match the supplied text. Both source-page URLs passed HEAD200; demo/footer URLs were already checked anonymously, and the localhost development URL is a documented command target intentionally not contacted while ports must be free. CLI/reference URLs were checked against official docs. No repeated external video HEAD or model retry occurred. Commands were checked against package.json/installed scripts and actual executed CLI forms.

Scope proof confirms empty diff against backend-v1 for data/public-demo/scripts/API and only src/server/chat/pipeline.ts in server code. All application/test/config/dependency files are unchanged since34e8ab0, including the lockfile. The protected citation report is unchanged. A current tracked/staged-file secret scan found no configured provider-key bytes or plausible key prefixes; only .env.example is tracked. Environment values were not printed.

An extra, non-required npm run format:check failed on156 CRLF checkout/export files after branch checkout. A byte diagnostic verifies source Hero.tsx has68 CRLF lines in the working tree/archive, zero in the Git blob, and becomes byte-identical to the committed blob after CRLF→LF normalization; git diff for code remains empty. No application/config normalization was made under the release-only scope. This is reported transparently, separate from the required green typecheck/lint/tests/build; no global formatting pass or suppressed check was used. Selected edited docs were formatted. See format-check.txt and line-ending-diagnostic.json.

Source archives contain only committed content, including curated public evidence and .env.example. No private env/.vercel/node_modules/.next/test-results/playwright-report or untracked Lighthouse file is included. The final tagged ZIP and independent final build transcripts are outside the repo with a SHA256/size/largest-entry companion manifest. Temporary cleanup is explicitly incomplete where automatic approval review rejects removal, not falsely reported as complete.
