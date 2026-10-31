# Real static knowledge and a property-based answer guard

Status: accepted; supersedes the fictional corpus and verbatim-line checks described in earlier ADRs. No crawler or deployment.

## Context

The prototype must use two dated public pages, preserve contradictions rather than infer package entitlements, and allow grounded phrasing without an exact sentence-copy requirement. Previously invented facts and response captures must not remain current product evidence.

## Decision

Capture fifteen logical sections faithfully with real anchored URLs, date 2026-10-31 and isDemo:false. Use static JSON imports and atomic section chunks. Keep the three identical package inclusion lists beside their distinct taglines. Use the real externally linked video after one HEAD check, and a generated clearly labelled demo brochure. Retain the retired unavailable asset. UI badges use source/media flags; mock generation remains a separate mode.

Replace verbatim equality with a fail-closed property check on model prose: at least one detected citation URL; every absolute URL and Markdown link target must exactly match a retrieved URL; every recognized normalized number, currency, currency amount, duration/altitude unit pair and range must be present in retrieved context. Normalize comma/space grouping, decimal zeros, baht aliases, bounded number words through ninety, common units and range endpoints. Do not derive arithmetic conversions. Unsupported recognized properties and missing/unknown citations yield the existing refusal. An empty media-only model step is separately summarized from registry results, without checking model prose or inventing facts.

## Guarantees

The accepted prose contains a citation from the retrieved set and no detected foreign citation or recognized numeric property outside the normalized retrieved context. Currency/amount and number/unit pairs prevent treating a supported number as another currency or unit. The guard does not require a verbatim sentence. Registry summaries remain controlled by registry data only. Provenance flags are returned by sources, trace and tool results.

## Limits

This is NOT semantic entailment or a proof of factual correctness. It cannot associate a supported number with the right package when multiple values are retrieved, prove who cancels, catch unsupported nonnumeric claims/negation, distinguish policy scopes or reconcile contradictory source wording. The bounded normalizer can miss unknown linguistic quantity/currency/unit expressions and can conservatively reject valid conversions or numbered list labels. A cited false nonnumeric statement can pass; a test makes this limitation explicit. URL parsing covers absolute scheme URLs and Markdown links, not every possible obfuscated link syntax. The model prompt must still forbid invented claims and unsupported entitlements.

## Alternatives

Continue exact-line matching (rejects harmless phrasing); remove validation entirely (no numeric/citation boundary); use another model as judge (extra quota/latency and still fallible); silently reconcile package marketing (invents facts); scrape the entire site (out of scope).

## Consequences

A property-passing answer may still be semantically wrong and needs review. The source corpus is a dated capture, not live operational availability. Explicit unsupported facets abstain without lowering threshold; coverage rules must be reviewed on refresh. Video embedding is unverified so consumers keep the labelled link. Old fictional files are superseded in place while original history remains in Git. No new request fields, provider switching behavior or stream protocol.

## Current media-turn application policy

ADR 014 changes only how a failed result is presented: media turns drop rejected prose and keep the registry summary; text-only turns retain the refusal. evaluateGrounding's citation/numeric checks and semantic limitations are unchanged. Conversation history is projected to visible text only before generation.
