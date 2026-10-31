# ADR 012: Structured citations after unchanged grounding validation

Citation requirements/selection are superseded by ADR 015 (server-side lexical attribution). Numeric rules and existing public shapes remain unchanged.

Date: 2026-10-31. Status: accepted within the explicitly approved backend freeze exception.

## Context

Before this change, citations were URL strings embedded in the answer's text delta and trace.text. Clients had to scrape prose to display sources. The original model text still needs to carry exact retrieved citation URLs so the existing guard can fail closed for missing or unknown citations and unsupported numeric properties.

## Decision

Keep evaluateGrounding and its property checks unchanged. After successful live grounding, presentCitations removes citation URLs and their empty wrappers from the guarded prose, preserves Markdown link labels, and produces deduplicated source-url objects. Rejected answers carry no citations. The scripted mock path still uses exact captured context and is explicitly MOCK; it undergoes the same presentation step. Registry-only media summaries are appended afterward, retaining asset links and never being promoted to knowledge citations.

Emit each citation with the AI SDK's supported source-url stream part: type, sourceId, url and optional title. Use the URL as the stable sourceId; title is the first matching retrieved section title. Several sections can share a page anchor, so deduplication is by URL, not chunk. Trace adds citations with the identical shape. The Zod citation schema also admits the new part in returned client history using the existing message/part limits. Client-supplied source parts are untrusted history, never retrieval evidence.

The fresh two-page HTML check verified every currently used anchor as an element id. Capture the ids, HTML hashes and HTTP statuses in anchor-capture.json; verify every source fragment against that file in the offline suite. Future unverified anchors must become plain page URLs before updating captures. This verifies existence at capture time, not permanent availability or semantic ownership of a fragment.

The prompt asks for 1–3 short sentences in the model's own words and only question-relevant skydiving facts. Other activities are excluded unless requested. These are prompt instructions, not new guard rules or semantic guarantees. Package wording and numeric facts remain restricted to source context. Mock context dumps intentionally remain diagnostic fixtures rather than claims of live style compliance.

## Alternatives

- Keep citations solely in prose: requires fragile UI parsing and does not expose supported SDK source parts.
- Strip URLs before validating: destroys grounding evidence and could conceal unknown citations; rejected.
- Emit every retrieved chunk as cited: falsely attributes uncited material; rejected.
- Add another model call to rewrite: increases latency/cost and could change facts; rejected.

## Consequences

The existing UIMessage SSE v1 protocol is retained with additive source-url events; trace adds citations. Visible text no longer contains raw knowledge citation URLs, so clients should render source parts. The input body and tool-result shapes remain intact, with additive acceptance of source parts on history replay. No automatic provider fallback, retry, deadline or deployment changes. The property guard's limitations in ADR 011 remain unchanged.

Official source checked on 2026-10-31: [AI SDK source parts](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol#source-parts), verified against the installed AI SDK 7 TypeScript definitions and DefaultChatTransport/readUIMessageStream integration test. No package version changes.
