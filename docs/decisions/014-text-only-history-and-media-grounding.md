# ADR 014: Text-only model history and registry-only fallback on media turns

Date: 2026-10-31. Status: accepted within the explicitly approved freeze exception.

## Context

The saved Qwen follow-up echoed step-start and source-url objects. The verifier retained the exact message returned by DefaultChatTransport/readUIMessageStream, matching what the UI sends. runPipeline converted every non-text part with JSON.stringify, injecting structural source/tool parts into the assistant's conversational content. This is an application history conversion defect, not an incorrectly built SDK history. The previous HTTP request body was not recorded, so the historical dump is explicitly reconstructed from saved history and committed conversion; new verification records the actual provider-bound messages.

Uncited tool acknowledgements also became the guard refusal beside a correct registry result. Citation presentation consumed sentence punctuation along with a removed URL marker. Title-derived summaries exposed unnecessary wording.

## Decision

Project validated history to user/assistant roles and text parts only via buildModelMessages; join multiple text parts with newlines and omit empty content. Never stringify step/source/tool parts or insert their metadata into model content. Media history uses the assistant's visible text only. Preserve literal user/assistant text as text: this is structural projection, not a sanitizer that rewrites JSON a user deliberately typed, and no output sanitizer is added to hide model echoes.

Keep evaluateGrounding and its property checks unchanged. groundedAnswer applies the result according to whether media exist: accepted prose is kept; failed prose is dropped when any found/unavailable media result exists; without media it remains the existing refusal. Append only the deterministic registry summary to empty media prose. A mixed cited price plus brochure keeps both. No extra generation or fallback provider.

Remove URL, its directly attached label and its wrapper characters; preserve following sentence punctuation, including a full stop that separates sentences around a bare URL. Existing duplicate terminal-punctuation/empty-label cleanup remains. Replays use the exact preceding rain, inclusion and cancellation outputs.

Summaries depend on result kind and isDemo, never titles: Here is the brochure (demo material). / Here is the video. The label occurs only on a found flagged result. All unavailable reasons use That file isn't available right now. with no demo label. Result payload fields and provenance remain unchanged.

## Alternatives

- Strip part JSON from the final answer: hides the symptom while still exposing irrelevant structures to the model; rejected.
- Manually build simplified harness messages: would miss the real UI shape; tests/harness instead retain actual SDK message objects and assert the outgoing provider content.
- Use a generic UI-to-model converter preserving tool messages: unnecessary for this text-history contract and one-step tools; public media state stays with the client and registry.
- Admit uncited acknowledgements through the guard or use a second model: weakens grounding or adds calls. Instead drop failed prose only when a registry result independently supports the summary.

## Consequences and limits

Sources/tool output are no longer part of conversational model history. Current retrieved context still carries exact citation URLs, and registry results still reach the UI as structured parts. Model history can describe a prior file only through its visible assistant text. No server state, request schema, stream protocol, retrieval, provider enum, prompt or guard-rule change.

The verifier now detects serialized-part text, checks factual terminal punctuation and forbids the refusal beside media. ECO photos may honestly abstain or cite the page wording; a bounded claim check rejects an affirmative ECO-includes-photos claim. This is not full semantic entailment. The Qwen-only campaign has a new thirty-call maximum with three-second minimum spacing, no internal retries and stop on first 429. Failed scenarios have one explicit rerun. Previous Llama HTTP 404 for this key is recorded as unavailable with cause unverified; Llama is not called in this revision.
