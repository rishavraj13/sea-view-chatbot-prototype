# Deterministic conversational retrieval query

Status: approved narrow backend fix.

## Context

The previous pipeline retrieved only the latest message. A question such as
"What does that include?" lost the preceding tandem-package topic, even though
the model received full history. Assistant-generated text must not become factual
retrieval evidence. Calling a model to rewrite queries would consume scarce quota.

## Decision

The pure knowledge-module function `buildRetrievalQuery` inspects user text only.
First turns and explicit new topics use the latest user turn. Referential words
(`that`, `those`, `these`, `it`, `its`, `they`, `them`, `their`) or an initial
`and` / `what about` identify a dependent follow-up. For these, concatenate the
immediately preceding user turn and the latest turn. Pass that string to the
existing pure keyword retriever. Do not include assistant claims or tool payloads.

Trace optionally accepts full validated message history and invokes the identical
pipeline; question-only requests retain the original single-turn behavior.

## Alternatives

Always concatenate history (stale topics pollute new questions); model query rewriting
(extra latency/quota and nondeterminism); storing server conversation state (out of scope).

## Consequences

No provider calls, persistent state, embeddings or retrieval signature changes.
Tests cover a first turn, dependent follow-up, and explicit topic change. This is
a bounded heuristic, not semantic coreference resolution: a new topic containing
a pronoun can still include the previous topic, and chains beyond one preceding
user turn can miss the original referent. These limits are explicit.
