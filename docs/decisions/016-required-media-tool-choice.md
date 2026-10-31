# ADR 016: Three-state latest-turn media policy

Date: 2026-10-31. Status: accepted. Supersedes ADR 013’s two-state exposure decision; strict schemas, registry selection and other safeguards remain.

## Context

The last saved Qwen run contains five media promises without model tool calls. The preceding prompt diff did not change tool descriptions or the same-step media instruction. Exposing tools with implicit auto allowed a prose response instead of execution. Prompt-only instructions do not enforce the requested action.

## Decision

Use pure getMediaPolicy on the latest user message only. Whole-word, case-insensitive nouns remain brochure, pdf, leaflet, flyer, pamphlet, document (sendBrochure), and video, footage, clip, film, watch, recording (showVideo), with existing plural forms. Generic show/see, photos and included are not nouns. Offer only matching tools, not both indiscriminately.

Request cues are whole-word, case-insensitive send, show, share, email, give, get, see, watch, view, download, attach, please; and phrases “can I have”, “could I”, “I want”, “I'd like”, “I need”. Curly apostrophes and whitespace between phrase words are accepted.

- none: no noun; no tools, toolChoice none.
- optional: noun without cue; matching tools, toolChoice auto.
- required: noun and cue; matching tools, toolChoice required.

Keep exactly one generation step, zero retries, strict empty tool schemas, explicit-id resolution and registry-only fixed summaries. A required tool-only response can lose the factual text part of a mixed request; do not add a continuation. Model prose still passes unchanged grounding; no fallback or output sanitizer is introduced. A required response with no tool call fails with the existing typed MODEL_FAILURE, rather than silently accepting a promise. Explicit ids still resolve through the existing selection path.

Installed ai 7.0.158 prepares required/none/auto in src/prompt/prepare-tool-choice.ts; @ai-sdk/groq 4.0.74 maps required to tool_choice in src/groq-prepare-tools.ts. The SDK’s default auto explains the previous permitted omission. An offline HTTP test exercises the actual Groq serializer and two calls in one step. No package versions change.

Checked 2026-10-31: [AI SDK tool choice](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling), [Groq required and parallel local calls](https://console.groq.com/docs/tool-use/local-tool-calling), [Groq supported models](https://console.groq.com/docs/tool-use/overview#supported-models). Groq documents required as at least one call and lists qwen/qwen3.8-27b with parallel tool support. Documentation and mocks establish supported protocol behavior, not a new live reliability result.

## Alternatives

- Prompt-only with auto: retains the observed promise-without-action path.
- Routing that bypasses the model: guarantees a registry action but changes the approved model-selection behavior.
- Classifier call: adds latency, quota and another fallible generation; violates one call per turn.
- Force a specific tool: cannot express requesting both tools in the same step.

## Consequences and limitations

Required guarantees at least one call, not every requested tool; both-file turns can still omit one. A provider can reject invalid required output. No retry or automatic fallback is added. The bounded lexicon does not understand negation: “Do not send a brochure” is required. “Watch” is both a noun and request cue. A contents question with a noun is optional; descriptions still prohibit sending a file merely to answer contents. “Send it” has no noun and remains a text turn. Email is an intent cue only; tools return files to this chat, not email delivery.

The general missing-information prompt replaces the ECO-specific instruction. Recorded ECO meta-prose fails the existing guard; no keyword sanitizer is added. Instructions prohibit discussing instructions or supplied material, while every prior factual restriction remains.

## Cancellation paragraph granularity

The captured If you cancel text is split verbatim into single-day activities, courses, multi-day trips/camps, and how-to-cancel records, preserving URL/date/provenance and concatenated text. Retrieval threshold remains 1; attribution remains 0.5 plus two matched words. For equal scores on procedural “how do/can/should/could” queries, prefer a how-to heading. Headings do not infer duration from units such as “day”; explicit time/long terms still normalize, and body/query duration inference stays intact. This prevents a single-day category title outranking jump time solely through synthetic duration title weight. All 38 retrieval cases and 28 calibration pairs pass. General cancellation retrieval can still include another product paragraph among its three chunks; lexical attribution is not semantic scope validation.
