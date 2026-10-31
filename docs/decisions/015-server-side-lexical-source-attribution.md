# ADR 015: Attribute factual answers to retrieved chunks on the server

Date: 2026-10-31. Status: accepted within the approved freeze exception. Supersedes the model-citation requirements of ADRs 011 and 012; their numeric checks, stream/source-part shapes and other limitations remain.

## Context

The preceding raw VIP follow-up and mixed price/file answer contained supported facts but no model-written URL. Requiring a URL caused a refusal or dropped prose even though the backend already held the relevant chunks. Structured sources should come from validated server data, not depend on model citation formatting.

## Decision

The prompt asks for short direct customer answers, no URLs/citation labels or context/retrieved/source/section language, no unasked rules for other activity/product types, and no unstated likely/probably inference. These are model instructions, not a semantic output sanitizer.

attributeSources(answerText, retrievedChunks) is pure and returns at most two retrieved chunks. Reuse retrievalTokens without changing retrieval behavior; additionally exclude absolute URLs, question words, function/neutral discourse words, generic package wording and digit-only tokens. Baht/THB align with the existing price lexeme. Score each chunk's exact text, not URL/title metadata, using the overlap coefficient:

`intersection(answer content words, chunk content words) / min(answer word count, chunk word count)`

Require coefficient >=0.5 and at least two distinct matched words. Sort by decreasing coefficient, tie by retrieved input order, deduplicate by source URL, then take at most two. The coefficient supports both short answers and answers spanning multiple chunks; one generic word cannot support an answer even with coefficient one. Very short answers or unrecognized paraphrases may fail closed.

## Threshold evidence

tests/fixtures/attribution-quality.json is a table across package pricing/taglines/inclusions, weather/refund, cancellation/no-show, location/pickup, altitude/freefall, insurance, plan/ID and unrelated/cross-topic/near-topic answers. The original 27-pair matrix was authored and scored before live calls, independently of the raw-answer replays. A function-word-only regression added a 28th pair during review; the threshold did not change. Final evidence: 17 positives, 11 negatives, all classified as expected.

With the two-word floor, thresholds 0.3/0.4 admitted one near-topic invented-benefit pair. Threshold 0.5 retained all positives with no negative positives. Threshold 0.6 lost one positive; 0.7/0.8 lost two. Choose the highest tested threshold preserving all positives: 0.5. This is calibration evidence, not a measured production accuracy guarantee. Full tokens, matched words, coefficients and candidate results are in examples/source-attribution/quality-evidence.json; an offline script regenerates them.

## Grounding and presentation

An answer needs at least one supporting chunk and must pass the unchanged numeric/currency/unit/range check over the full retrieved context. No model URL is required, and URLs contribute no lexical evidence. Any model URL outside the retrieved URL set still rejects the answer. Allowed model URLs/labels are stripped only for presentation. Structured source-url parts and trace.citations retain their shape and are populated from attributeSources. Rejected text fails closed as before: refusal without media, silent drop with a registry summary when media exist.

## Alternatives

- Continue model-written citations: preserves a formatting-dependent false refusal.
- Cite every retrieved chunk automatically: attaches unrelated material without answer evidence.
- Embeddings or another model judge: adds dependencies, cost/calls and a separate fallible decision; outside scope.
- Exact source-line matching: rejects valid paraphrases and previously approved behavior.

## Guarantees and limitations

Every emitted source URL belongs to a retrieved chunk that meets the documented lexical threshold; source objects are server-generated, capped at two and URL-deduplicated. Every recognized numeric property still occurs in the combined normalized retrieved context. Foreign model URLs reject.

This is lexical, not semantic entailment. It cannot prove every clause, correct negation, scope, entity/amount ownership, causality, completeness, or whether a claimed tool action occurred. Shared vocabulary can support a false nonnumeric statement; an exact negative safety-briefing counterexample remains in tests. A numeric property can belong to another retrieved chunk. A supporting link need not support every part of a multi-topic answer. Safe fallback invents no replacement fact, but these bounded checks cannot guarantee that every model statement is true. Mixed requests can still lose a fact/file part if generation omits a tool or produces ungrounded prose. No mixed-request execution change, fallback or extra generation is introduced.
