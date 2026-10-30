# Shared pipeline

Status: accepted for Phase 1.

## Context

Trace must describe what chat actually uses.

## Decision

Both routes call runPipeline; trace holds exact context and executed tool results.

## Alternatives

Independent debug retrieval implementation.

## Consequences

Parity tests prevent divergence; trace incurs live model cost.
