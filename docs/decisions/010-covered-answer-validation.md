# Covered questions: citation normalization and bounded retrieval vocabulary

Status: accepted narrow backend correction. Refines the grounding validation portions of ADRs 007/009 without changing request or output shapes.

## Context

The exact covered pricing question retrieved the right facts, but a live diagnostic showed the model placed the correct bracketed citation after the verbatim fact. The whole-line equality check rejected it and returned a false refusal. Additional ordinary customer wording also missed lexical matches.

## Decision

Share pure buildModelContext between trace and prompt, and clarify the prompt's covered/missing-answer distinction. Normalize citation placement only when the remaining text exactly equals a retrieved chunk. Canonicalize to the original leading-URL line. Keep rejecting invented, uncited or unknown-source facts. Replay the captured live answer in offline function and real-SDK pipeline tests.

Use a bounded documented source/query lexical vocabulary plus title-length-normalized weighting. Keep threshold=1, top three, stable IDs/ties, pure retrieval and no external calls. Use a table of 21 realistic questions with four no-matches; check expected source in first position.

## Alternatives

Lowering threshold (does not fix the actual refusal and adds weak matches); removing grounding validation (allows unsupported claims); always returning the first chunk (cannot establish answer relevance); model-based query rewriting (adds calls and nondeterminism); requiring an exact leading-citation format without normalization (repeats the observed bug).

## Consequences

A formatting difference no longer discards a verbatim sourced fact. Prompted refusal applies to missing facts, while the guard still refuses unsupported model output. Retrieval is more tolerant of common customer terms but is not semantic coreference or a general language stemmer. Citation normalization does not accept arbitrary paraphrases. One live diagnostic was used; corrected behavior is established by an exact offline replay to respect the user's budget.
