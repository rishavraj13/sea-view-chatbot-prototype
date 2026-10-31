# Website knowledge and media

## Sources

- https://www.greedyadventures.com/experiences/sea-view-skydiving
- https://www.greedyadventures.com/cancellations

Capture date: 2026-10-31. This is a manually selected static two-page capture, not a crawler. Eighteen logical records are bundled as JSON imports so Vercel serverless needs no working-directory fs access. Every record has title, real anchored URL, capturedAt:"2026-10-31", text and isDemo:false. Original HTML was temporarily fetched outside published data; selected sections and HTML hashes are recorded in source-capture.json. No navigation, footer, customer clips or unrelated marketing paragraphs were kept.

Each JSON section remains an atomic retrieval chunk. This prevents an inclusion line from being separated from a package name, tagline or price. ECO/DELUXE/VIP taglines and identical four inclusion lists are preserved verbatim; source data do not infer photo entitlements. Jump facts retain the page's numeric and spelled-out values; location/address/operator wording is unchanged. All five plan steps and the three FAQ answers are captured. Cancellation material distinguishes weather, customer cancellation, no-show, refunds/operator cancellation/part-way stops, and insurance. No contradictions are reconciled.

Retrieval remains pure with threshold 1 and top three. Body-token matches weigh 1 and title evidence totals 2 over title terms. Bounded vocabulary handles package names, media terms, altitude/time, certificate/instructor/ID, pickup/Bangkok and policy topics. Requested package names scope out other package cards. Weather qualifiers are not treated as customer cancellation intent; an unpriced pickup FAQ cannot displace a package price answer. Equal scores follow captured section order. The six explicitly unsupported facets (age, weight, health, clothing, pickup amount and baggage) abstain instead of matching generic jump terms. This is a declared coverage boundary for this capture, not a general web claim. Refresh coverage rules if source content changes. No threshold reduction.

## Media

The video registry URL is https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4, isDemo:false. Its poster comes directly from the hero video element: https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg. Exactly one HEAD check returned 200 and video/mp4; no video body was read or stored. The title labels it as an external link. Browser embedding, CORS and playback were not tested; consumers must keep a link fallback.

No official PDF was supplied by either captured page. public/demo/brochure.pdf is generated demo material from the exact package facts, titled DEMO MATERIAL and flagged isDemo:true. It is not represented as an official brochure. A Unicode font with the baht glyph was used and the rendered page was visually checked. The retired registry asset remains unavailable and isDemo:true.

UI badges should use source/media flags; mode:mock describes generation, not whether factual source material is invented. Pure media summaries describe only registry records. The top /sources isDemo flag describes the knowledge corpus; mixed media flags remain independent.

## Reproduction and limitations

scripts/build-website-sources.py has no network calls and reads the two manually fetched HTML files under .next/real-capture; it extracts only selected sections using HTMLParser, not a crawler. scripts/build-brochure.py takes a font path argument and uses the generated JSON facts. The original HTML is not committed. Capture metadata includes page hashes and observed anchors/poster. Re-fetch manually before refreshing a dated corpus; do not imply that a static capture remains current forever.

Old fictional data records were removed; old reports/response files were replaced by explicit supersession notices to avoid misleading current readers. Their previous versions remain in Git history. No history rewrite was performed. Source capture, current response examples, quality scores and video HEAD evidence are under docs/examples/real-knowledge/.

## Captured-text presentation cleanup (2026-10-31)

Decorative leading `+` and `•` icons were removed from the captured package, inclusions, jump-facts and location text. Package inclusions now appear as plain sentences beneath one `Included` heading. All 15 JSON sections were checked for stray markup and image alt text; no other such artifacts were found. Facts, taglines, prices, URLs, dates and provenance flags are unchanged. The capture authoring script now performs this presentation cleanup, and the demo-labelled brochure was regenerated from the cleaned package sections. Its extracted names and prices are checked against those sections in the offline suite.

## Verified citation links and presentation

Fresh HTML from both source pages returned HTTP 200 on 2026-10-31. Every used fragment exists as an element id: options, details, the-day and faqs on the experience page; page-content on cancellations. No anchor replacement was necessary. The element-id inventory and raw-HTML hashes are saved in examples/citations/anchor-capture.json and checked offline against all 15 sources. Plain page URLs are required when a future fragment cannot be verified. Source facts and capture dates were not refreshed by this link check.

Knowledge citations are now source-url stream parts and trace.citations, separated from visible answer prose after the unchanged guard validates the original answer. Exact model context keeps source URLs. Media tool payloads and registry links retain their existing shapes. See ADR 012 and api.md.

Registry titles now omit DEMO prefixes. Only isDemo supplies the single `(demo material)` summary label, including unavailable demo files. The actual PDF's required demo-document title is unchanged. Media URLs remain in tool-result data instead of summary prose. Unknown/unavailable/wrong-type summaries use customer language; the retired test entry remains. Model tools use strict empty arguments, while explicit customer ids still resolve server-side, including unknown ids. See ADR 013.

ADR 014 updates summary prose to fixed phrases per result kind: Here is the brochure (demo material). (label only when flagged), Here is the video., or That file isn't available right now. for every unavailable reason, without a demo label. Asset titles no longer control the summary; tool payload/provenance remains unchanged. Any failed model grounding on a media turn is dropped, leaving the independently supported registry summary.

Source attribution is now server-selected from answer/chunk lexical overlap, independent of model URL output. The existing retrieval function, threshold and static corpus are unchanged. Supporting chunks use exact retrieved text, a two-content-word floor and overlap coefficient >=0.5, then ranking/URL deduplication with a maximum of two. URLs carry no overlap evidence. Source/media provenance and public source parts retain their shapes; numeric checks remain across the combined context. See ADR 015 and source-attribution-report.md for calibration and semantic limitations.

## Cancellation paragraph split (offline revision)

The existing If you cancel capture is now four paragraph-level records: Single-day activities, Courses, Multi-day trips and camps, How to cancel. They preserve the exact original paragraph text, 2026-10-31 capture date, isDemo:false and cancellations#page-content URL. The original combined text is retained as a test fixture; concatenation must equal it byte for byte. No new website facts were fetched for this revision. The capture script validates paragraph order and removes the obsolete aggregate on regeneration. Offline anchor verification now checks all 18 sources and requires the four split records. Historical 15-source checks above describe the original capture. Thresholds are unchanged; see ADR 016 for procedural ties and title-duration inference. Calibration remains 28/28 with no classification or coefficient change.
