# Keyword retrieval

Status: accepted for Phase 1.

## Context

Tiny static demo corpus needs inspectability.

## Decision

Pure keyword ranking with threshold 1 over paragraphs.

## Alternatives

Embeddings and vector databases.

## Consequences

Offline deterministic ranking; synonyms can miss.

## Current supersession

ADR 011 replaces the former corpus and verbatim-line check with real dated website sections and citation/numeric property validation. Static imports and single-call generation remain. See current knowledge-and-media.md and api.md; earlier response fixtures are not current evidence.
