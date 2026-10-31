# Media tool calling

Status: accepted for Phase 1.

## Context

Customers request one or both assets.

## Decision

Use two server tools with registry IDs and discriminated results.

## Alternatives

Inline guessed links; frontend-only selection.

## Consequences

Both calls can execute in one turn; unavailable results are explicit.

## Phase 1.7 supersession

ADR 009 replaces post-tool model continuation with one generation step and a pure registry summary. The existing checked-answer boundary remains: grounded same-step text is retained, otherwise media use the registry summary; text-only unsupported answers become the existing refusal. No stream or tool-result schema change.
