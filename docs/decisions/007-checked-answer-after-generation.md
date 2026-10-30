# Checked answer after generation

Status: documents existing Phase 1 behavior; no contract change.

## Context

Model prose can include unsupported claims. Provider exceptions must remain typed HTTP
errors before the SSE response begins. The prototype prioritizes grounded output over
token latency. This behavior was already implemented before this verification request.

## Decision

Await `generateText`, including server tool execution, before creating the UIMessage
stream. Split the exact retrieved context on newlines and remove empty lines. Trim the
model answer, split on newlines, and remove empty lines. Accept the answer only if it
has at least one line and every line equals a complete allowed context line, including
the bracketed source URL. Otherwise substitute `I do not have that information.`
Then append registry-derived media messages, including explicit unavailable messages.
Mock mode bypasses this model check and deterministically returns the context or refusal,
prefixed with `[MOCK DEMO]`.

## Alternatives

- Stream provider tokens directly: lower latency, but unsupported text could already
  reach the client and late failures could not retain HTTP error statuses.
- A second model judges groundedness: additional cost and another fallible judgment.
- Structured citation validation: potentially more natural answers, but a new behavior
  requiring approval and additional evaluation.

## Consequences

The transport is SSE but the answer arrives as one checked delta after generation.
An exact-copy check prevents new factual prose, but does not prove relevance or completeness.
It may reject a correct paraphrase, or permit an irrelevant copied passage. Full history
does not remedy retrieval that only considers the latest question. Tool calls can execute
before the answer fails the check; their registry results are still emitted.

Credentialed verification subsequently produced mixed successes, timeouts and rate limits; see ../live-verification.md. The check and API contract were not changed.
