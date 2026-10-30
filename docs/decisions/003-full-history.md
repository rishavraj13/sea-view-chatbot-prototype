# Full-history memory

Status: accepted for Phase 1.

## Context

Serverless functions must remain stateless.

## Decision

Client resends bounded UIMessage history on each request.

## Alternatives

Database sessions; process memory.

## Consequences

No persistence; client owns history and limits.
