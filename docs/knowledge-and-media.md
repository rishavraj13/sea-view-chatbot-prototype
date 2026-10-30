# Demo knowledge and media

All five JSON sources are fictional representative content, captured 2026-10-30. example.com URLs are citation identifiers, not real business sources. Pricing USD 250 is fictional; eligibility, refunds and medical advice are deliberately incomplete. No crawler or live availability.

JSON is imported statically and validated with Zod. Each newline is a chunk; current sources have one paragraph each. Retrieval is pure, case-insensitive unique-token overlap with stop words removed, score >= 1, deterministic ties by chunk id. It is lexical, not semantic: synonyms and follow-ups without explicit nouns can miss. No embeddings.

The manifest includes brochure (local generated PDF), video (external short CC0 flower clip, explicitly not skydiving), and retired (unavailable PDF). All are isDemo:true. public/demo/brochure.pdf was generated using ReportLab and rendered with Poppler for visual inspection. The sample clip is https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4; external availability is not monitored. available is a static registry flag.

sendBrochure and showVideo resolve IDs against the same registry. Unknown, disabled, and wrong-type assets produce unavailable with an empty URL; the assistant explicitly reports unavailable. Never render a link for unavailable results.

## Approved conversational retrieval and media correction

The knowledge public boundary now also exports buildRetrievalQuery and QueryMessage. The pipeline derives a bounded deterministic query from user history before pure keyword retrieval; see ADR 008. Explicit media IDs resolve through the registry, respecting requested media type and unavailable status. Trace optionally accepts full chat-schema history; existing question-only calls still work. See approved-fixes-report.md for exact behavior and evidence.
