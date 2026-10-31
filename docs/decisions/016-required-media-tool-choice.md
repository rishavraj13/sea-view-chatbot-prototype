# ADR 016: Three-state latest-turn media policy

Date: 2026-10-31. Status: accepted. Supersedes ADR 013’s two-state exposure decision; strict schemas, registry selection and other safeguards remain.

## Context

The last saved Qwen run contains five media promises without model tool calls. The preceding prompt diff did not change tool descriptions or the same-step media instruction. Exposing tools with implicit auto allowed a prose response instead of execution. Prompt-only instructions do not enforce the requested action.

## Decision

Use pure getMediaPolicy on the latest user message only. Whole-word, case-insensitive nouns remain brochure, pdf, leaflet, flyer, pamphlet, document (sendBrochure), and video, footage, clip, film, watch, recording (showVideo), with existing plural forms. Generic show/see, photos and included are not nouns. Offer only matching tools, not both indiscriminately.

Revised request-form decision (2026-10-31): a noun alone does not establish a request, and please/get/see are no longer free-standing cues. Detection is case-insensitive on the latest message, with curly apostrophe and whitespace normalization.

Question openers does, do, is, are, was, will, would, what, which, how, why, where, when, who, whose, and am I disqualify the opening clause. With a media noun, that clause is optional; without one, none. In particular “Will I get a video of my jump?” remains optional. A later explicit modal request after and/but/then or a comma is a separate clause and can still qualify: “How much is the VIP package and can you send me the brochure?” is required, brochure only. Sentence/semicolon/newline boundaries also separate clauses; a fresh question opener there still disqualifies that question. A question containing a quoted/embedded modal phrase without a clause boundary does not become required.

Required needs a media noun in the requesting clause and one of:

- Imperative opener send/show/share/email/give/get/attach/download/view/watch/play/open/access, or let me see/watch. An optional leading polite please is accepted, preserving the existing PLEASE ATTACH fixture.
- Modal opener can/could/may/will/would + I/you + request verb send/show/share/email/give/get/see/watch/view/have/play/open/access (optional polite please before the verb). The opening-question veto takes priority over will/would at sentence start; later explicit modal clauses are the mixed-sentence exception.
- A short noun phrase ending in please: optional bounded determiners/modifiers, a media noun, optionally another noun joined by and/or. Factual clauses ending in please do not qualify. Recognized modifiers: a/an/the/your/our/this/that/some/short/latest/ECO/DELUXE/VIP.
- I want / I'd like / I would like / I need / I'm after followed by optional to and bounded polite modifiers please/just/really, then a bounded media noun phrase, optionally introduced by a request verb. Direct desires such as “I want a video” now qualify. Desires immediately followed by know/ask/find out/understand/learn/check/confirm/clarify/wonder stay optional: asking for information about a file must not force delivery. Curly apostrophes remain accepted.

Explicit negated request forms (do not/don't/never + file-action verb, or no + bounded media noun phrase) suppress model tools for the entire latest turn: none with an empty tool set. This conservative veto takes priority over positive forms. Bare single media words, including Watch, Video and Brochure, stay optional. Noun-to-tool vocabulary is unchanged; added request verbs do not create new media nouns.

The unchanged noun-to-tool mapping is applied to the complete latest message. Request strength is clause-local; tool eligibility remains message-wide.

- none: no noun; no tools, toolChoice none.
- optional: noun without a recognized request form; matching tools, toolChoice auto.
- required: noun and a recognized request form; matching tools, toolChoice required.

Keep exactly one generation step, zero retries, strict empty tool schemas, explicit-id resolution and registry-only fixed summaries. A required tool-only response can lose the factual text part of a mixed request; do not add a continuation. Model prose still passes unchanged grounding; no fallback or output sanitizer is introduced. A required response with no tool call fails with the existing typed MODEL_FAILURE, rather than silently accepting a promise. Explicit ids still resolve through the existing selection path.

Installed ai 7.0.158 prepares required/none/auto in src/prompt/prepare-tool-choice.ts; @ai-sdk/groq 4.0.74 maps required to tool_choice in src/groq-prepare-tools.ts. The SDK’s default auto explains the previous permitted omission. An offline HTTP test exercises the actual Groq serializer and two calls in one step. No package versions change.

Checked 2026-10-31: [AI SDK tool choice](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling), [Groq required and parallel local calls](https://console.groq.com/docs/tool-use/local-tool-calling), [Groq supported models](https://console.groq.com/docs/tool-use/overview#supported-models). Groq documents required as at least one call and lists qwen/qwen3.8-27b with parallel tool support. Documentation and mocks establish supported protocol behavior, not a new live reliability result.

## Alternatives

- Prompt-only with auto: retains the observed promise-without-action path.
- Free-standing cue words: force calls on factual questions such as “Does the VIP film come with photos, please?”; replaced by request forms rather than additional model instructions.
- Routing that bypasses the model: guarantees a registry action but changes the approved model-selection behavior.
- Classifier call: adds latency, quota and another fallible generation; violates one call per turn.
- Force a specific tool: cannot express requesting both tools in the same step.

## Consequences and limitations

Required guarantees at least one call, not every requested tool; both-file turns can still omit one. A provider can reject invalid required output. No retry or automatic fallback is added. This is an English-only lexical approach, not parsing or semantic intent classification. Unrecognized wording falls back to optional with a media noun, otherwise none. Explicit negation now makes “Do not send a brochure” none; “Watch” alone stays optional under the bare-word exception. Negation elsewhere, quotations, indirect requests and unusual clause boundaries can still be misclassified. A contents question with a noun is optional; descriptions still prohibit sending a file merely to answer contents. “Send it” has no noun and remains a text turn. Email is an intent cue only; tools return files to this chat, not email delivery.

The general missing-information prompt replaces the ECO-specific instruction. Recorded ECO meta-prose fails the existing guard; no keyword sanitizer is added. Instructions prohibit discussing instructions or supplied material, while every prior factual restriction remains.

## Cancellation paragraph granularity

The captured If you cancel text is split verbatim into single-day activities, courses, multi-day trips/camps, and how-to-cancel records, preserving URL/date/provenance and concatenated text. Retrieval threshold remains 1; attribution remains 0.5 plus two matched words. For equal scores on procedural “how do/can/should/could” queries, prefer a how-to heading. Headings do not infer duration from units such as “day”; explicit time/long terms still normalize, and body/query duration inference stays intact. This prevents a single-day category title outranking jump time solely through synthetic duration title weight. All 38 retrieval cases and 28 calibration pairs pass. General cancellation retrieval can still include another product paragraph among its three chunks; lexical attribution is not semantic scope validation.

## Offline revision evidence

All original 42 phrase rows remain, with eight expected states updated for the tighter rules; 53 additional rows bring the policy matrix to 95. Each row asserts state, matching tools, SDK choice and exactly one mocked provider call. The exact recorded SDK media-result message (including step-start and tool-sendBrochure output-available) is resent through validation and projected to its visible assistant text only. Runtime history projection is unchanged. No live calls or package changes were made in this revision; see request-form-report.md for real typecheck/lint/test/build output.

## Direct-desire and negation revision

The prior required-verb restriction incorrectly left clear direct file desires optional. The revised bounded desire forms accept noun phrases directly, while a specific information-verb exclusion protects all existing factual negatives. View/watch/play/open/access are file-action verbs in imperative/modal forms. The negation veto prevents the model being offered tools for an explicitly rejected file action. It suppresses all tools for that turn, including mixed positive/negative media requests; semantic per-asset negation is outside this lexical policy. Bare words remain optional instead of being interpreted as commands.

All prior 95 rows remain; six requested rows return to required and Do not send a brochure becomes none. Added 32 rows cover all nine information verbs, expanded desire/action forms, bare words and negation (127 total). Existing negative phrases remain non-required. One generation, noun mapping, strict schemas, explicit-id handling and HTTP/tool shapes are unchanged. Part A uses no live calls. See desire-form-report.md for real check output.
