# ADR 020: Explicit mock execution shares the live media policy

Status: accepted for the owner's one-defect backend-freeze exception after backend-v1. Date: 2026-11-02. No dependency, HTTP request/stream/tool-result, guard, retrieval or data change.

## Context

The Pass 5 offline capture examples/release-readiness/mock-negation.json shows “Do not send a brochure” returning a brochure in explicit MODEL_MODE=mock despite getMediaPolicy returning none with no tools. runPipeline computed the policy once for the live generation branch, but its scripted mock branch executed selectMedia's narrower noun matches directly. Tests on the live branch with a mock provider established exposure/toolChoice, not the separate explicit-mock execution path.

## Decision

Keep the single existing getMediaPolicy(question) result. The explicit mock branch now gates execution with its state and iterates its tools; it has no second vocabulary/request detector. None executes no implicit media. Optional keeps deterministic mock scripting (execute the permitted matching media instead of generating/model-classifying a decision). Required likewise executes only the permitted matching tool names. The full shared noun vocabulary therefore works in mock, including leaflet/film/recording, without duplicating it in selectMedia or adding a provider call.

Use the existing selection's asset id when present so its missing-asset script remains unchanged; otherwise use each tool's fixed registry id. Explicit customer-id resolution remains before both generation branches, unchanged, and uses the registry's available/unavailable/unknown/wrong-type handling. This intentional exception still resolves explicit ids even when the media policy is none. An explicit id can itself look like a media noun (PDF id video); when explicit selections exist, do not synthesize an extra tool for a noun appearing only in that id. This preserves the existing wrong-type result rather than sending an additional video. The same execute function deduplicates matching calls/results.

No change to the live branch, selection parser, registry, script text/context, guard, retrieval, source attribution, model count, data or public shapes. Mock makes zero provider calls; live remains one step with no retries/continuation. Optional mock execution is deterministic permission use, not a prediction of a live model's auto choice.

## Alternatives

- Frontend hide/sanitize unwanted file results: rejected because trace/other consumers would retain the defect and the server would still execute it.
- Add a negation-only condition or copy the noun/request lexicon in mock: rejected because it patches a symptom, drifts from policy and misses aliases/desire/information forms.
- Replace selection/explicit-id handling with policy tool defaults: rejected because it changes retired/unknown/wrong-type asset behavior.
- Make another model/classifier call: rejected; mock must be offline/deterministic and policy is already computed.

## Consequences and verification

All 127 rows of tests/fixtures/media-policy.json now run through explicit mock runPipeline, POST /api/knowledge/trace and POST /api/chat consumed by DefaultChatTransport/readUIMessageStream. Assertions check fixture policy state/tools, executed tool names/count, identical trace/pipeline media/calls/text, SDK completed tool inputs/results and mock metadata. global fetch is intercepted to fail, with an assertion of zero network calls. Six additional route/pipeline rows preserve explicit available PDF/video, retired/unknown, wrong-type and noun-free explicit-id resolution. Existing live-branch mock-provider policy tests remain unchanged. No existing expectation needed weakening or replacement.

Only src/server/chat/pipeline.ts and the new tests/server/chat/mock-media-policy.test.ts differ in frozen paths versus backend-v1. This is the one approved backend behavior correction after that tag, not a general freeze lift. Historical captures remain unchanged; current evidence is in examples/mock-media-policy and mock-media-policy-report.md.

Limits remain: English lexical policy is not semantic intent detection; explicit ids are a separate registry action; optional mock tools do not prove live model choice; long scripted context/refusal prose is outside this defect and unchanged.
