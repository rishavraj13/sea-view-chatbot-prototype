# ADR 019: Display the real trace contract without inventing a retrieval query

Date: 2026-11-02. Status: accepted for frontend Pass 3. No backend or API change.

## Context

The frozen trace endpoint returns `{mode,provider,modelId,isDemo,chunks,context,toolCalls,media,text,citations}`. It does **not** return a retrieval-query field. The old view repeated the submitted question under that label, hid the exact context, and typed tool-call objects as string[]; joining them produced `[object Object]`. Stale browser tests expected invented media titles and a different set of trace headings.

Read docs/api.md and the actual sources/VIP/weather/ECO-photos/unknown captures under docs/examples/real-knowledge, plus current typed error captures. Inspected the unmodified sources/trace routes and server Trace type. Read the installed Next Server and Client Components guide before editing. No live API/provider call, dependency install or deployment.

## Decision

Validate all catalog and trace responses with small frontend Zod schemas; reuse chat's strict error-envelope schema/parser and product copy. Types are inferred from schemas, not handwritten casts. Unexpected JSON, non-JSON, network and invalid typed errors become the generic product error with Retry. No raw object/error body is rendered. Runtime code does not import src/server; tests may validate against the backend's exported schemas and call local route functions in mock mode.

The read-only trace shows six named sections in this order:

1. Question and any complete earlier user/assistant pair, from the saved submitted input (the API does not echo them).
2. Context passed to the model: the **exact** returned context, escaped as React text in a labelled, focusable, scrollable pre block. The block has the distinct accessible name "Exact model context"; it does not trim or pretty-print the value.
3. Retrieved chunks: unrounded returned scores, full source title/URL, provenance and expandable complete chunk text.
4. Tools selected: call name, input asset ID and result fields as readable scalar labels; no JSON/object stringification in the UI.
5. Media resolved: title, ID, kind/type, demo badge, usable link for found assets; unavailable note/reason for missing assets.
6. Answer text and citations: unchanged returned answer and structured page chips using the chat's exact origin/path allow-list and page deduplication helper. An empty citations area explicitly says none were returned; no citation is invented for a registry-only media turn.

Mode/provider/modelId chips and "Output from the real pipeline" follow those sections. Remove "Retrieval query" entirely. The query cannot be reconstructed authoritatively from question/history, so do not present one. A future exact query display requires a separately approved backend contract extension; none is sought here.

The Run trace button stays named Run trace, is disabled during its request, and has a permanent note: "Runs the real chat pipeline. On the live deployment this uses one model call." Do not assume mock/live before a result. Sources/media/trace use explicit loading, empty and product-error states. Closing/hiding a tab preserves its local form/results. Results are request-local snapshots, not a history database.

## Inputs and lifecycle

The fifth shared starter is restored to "What if it rains?". Chat/trace import the same list. Missing-fact refusal is tested by typing the age-limit question separately. Earlier-turn textareas and question share the chat 4000-character bound. Either both earlier fields are blank or both must be nonempty; one populated field produces inline validation and no request. With a pair, validate and send exactly user → assistant → latest user before invoking the same trace endpoint. A collapsed disclosure never silently drops populated earlier fields.

A small shared knowledge-request hook owns loading/error/result/last-submission state and validates every fetch response before state writes. Starting a request aborts its predecessor; unmount aborts and prevents late state writes. Retry reuses the last submitted body, not an edited draft. Transport errors are adapted to APICallError(statusCode,responseBody) and decoded by chat's existing strict parser; no duplicated error-code mapping. A shared RequestError component and extracted absolute-deadline countdown hook are used by both chat and Knowledge. Fresh failed attempts mount a fresh countdown. Malformed delay/body means UNKNOWN, as in chat; valid rate limits disable Retry until zero. No automatic retries or live-to-mock fallback.

## Tabs and catalog

ARIA tabs use one roving tabindex, linked tab/panel IDs, automatic activation on arrows/Home/End, and a focusable active panel reached by Tab. Counts are aria-hidden; accessible names equal visible labels from src/content. Public sources use actual title, URL, capture date, isDemo badge and full text inside details. Media use only returned manifest titles, type, isDemo and availability; there is no Official badge. Unavailable entries are not clickable. Footer section links use Next Link to /#packages, /#plan and /#faq on every route.

TraceTab delegates to a form, request hook, schema-inferred data and one small presentational component per section. Source/form/result CSS is separated; unused legacy types, error helper and CSS are removed. The view never modifies source facts or returned prose.

## Alternatives

- Derive/display the query from question/history: rejected because the backend owns normalization/query construction and does not return the result.
- Change the backend to expose more diagnostics: outside the freeze and unnecessary to show its existing exact context.
- Keep a monolithic TraceTab or duplicate countdown/error logic: rejected; causes contract drift and mixes unrelated state/presentation concerns.
- Render tool objects as JSON: rejected; unreadable, and contradicts the requested scalar-field presentation.
- Invent official media labels or add missing citations: rejected; the public registry and trace response are the authoritative evidence.

## Verification and limitations

Contract tests parse real captured responses and actual in-process MOCK route results, including brochure, history-dependent VIP, retired file and no-match cases. Render tests mount result components rather than merely inspecting a DTO. Browser tests compare the exact context textContent with the actual route response, validate earlier-turn requests, real manifest titles read with fs, all public error codes/countdowns, empty/malformed responses, ARIA keyboard tabs, and axe with every active tab plus a populated result/error.

This is a static knowledge capture (2026-10-31), not a crawler or live website viewer. Actual providers are not exercised in frontend verification; scripted mock prose can be verbose or refuse beside a media result, and is shown unchanged. An empty retrieval/media-only request can have empty context/citations; empty states must remain honest. Native browser textareas/details/pre scrolling are used. Public schemas allow additive backend fields to be stripped but reject missing or incorrectly typed required fields. Links are validated for safe schemes, while citations remain restricted to the shared page allow-list. No authentication, database, payments or new scope.
