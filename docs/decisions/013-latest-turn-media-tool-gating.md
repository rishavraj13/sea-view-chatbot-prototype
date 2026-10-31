# ADR 013: Gate media tools by the latest customer turn

Date: 2026-10-31. Status: accepted within the approved backend freeze exception.

## Context

The previous Qwen follow-up had correct VIP history/context but called sendBrochure with an invented id. Always exposing tools made an irrelevant action available; unrestricted model ids allowed arbitrary registry queries.

## Decision

Use pure hasMediaIntent on only the latest user text, matching complete words case-insensitively: brochure, pdf, leaflet, flyer, pamphlet, document, video, footage, clip, film, watch, recording and plural forms. Exclude generic show/see, photos and included. Previous history cannot keep tools exposed on a non-media follow-up. Omit tools entirely when false; expose both when true. Descriptions allow receiving/watching the file itself, never answering a question about its contents.

Remove the model id parameter: both tools have strict empty `{}` inputs and resolve their fixed registry entry. There is one deliverable per tool, so an enum adds no useful choice. Explicit customer ids stay independently controlled by the existing selection module and still resolve retired/unknown assets. Streamed tool input remains resolved `{id}` and media-result shapes are unchanged. Invalid model id properties cannot execute registry lookups. No classifier call, continuation or automatic provider fallback is added.

Registry titles have no DEMO prefix. isDemo supplies exactly one `(demo material)` summary label. Asset URLs stay in tool results, not visible prose. Unknown/unavailable/wrong-type summaries use customer language. The actual PDF retains its required demo-document title. After unchanged grounding, presentation removes only labels attached to removed citation markers and leftover wrappers/punctuation. Ordinary source/reference words elsewhere remain.

## Alternatives

- Always expose tools plus prompt: already failed; irrelevant capabilities remain available.
- Classifier-model call: adds latency/quota and another failure mode; violates one provider call per turn.
- Available-id enum: appropriate for multiple assets per tool, unnecessary for one fixed brochure/video.
- Generic verbs or previous-turn intent: wrongly exposes tools for price/location/inclusion follow-ups.

## Consequences and limitations

No media noun means a text answer, apart from independently handled explicit-id requests. Pronoun-only "send it" does not expose tools. The vocabulary is bounded, not semantic classification: a brochure-content question contains a noun and exposes tools, so descriptions still guide selection. This change does not guarantee model reliability or change the guard, retrieval, provider enum, stream protocol or request schemas.

The separate live verifier uses one forty-call campaign ledger, a 3.1-second scheduling target to meet the required three-second minimum, maxRetries=0 and stops on the first 429. Failed scenarios can have one separately recorded rerun. A second documented parallel-tool Groq model is tested explicitly if Qwen retains failures; this is evaluation, not runtime fallback. The hard budget takes precedence if all requested attempts cannot fit. No deployment.

References checked 2026-10-31: [Groq parallel tool models](https://console.groq.com/docs/tool-use/overview#supported-models), [limits](https://console.groq.com/docs/rate-limits). tsx is dev-only tooling for npm verify:live; no AI SDK/provider package version changed.
