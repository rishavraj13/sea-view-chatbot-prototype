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

## Current supersession

ADR 011 replaces the former corpus and verbatim-line check with real dated website sections and citation/numeric property validation. Static imports and single-call generation remain. See current knowledge-and-media.md and api.md; earlier response fixtures are not current evidence.
