# Serverless data loading

Status: accepted for Phase 1.

## Context

Working directory paths are unreliable in Vercel functions.

## Decision

Static JSON module imports for corpus and registry.

## Alternatives

Runtime fs with outputFileTracingIncludes; remote database.

## Consequences

Next bundles data; no cwd-dependent fs. Data changes require redeployment.
