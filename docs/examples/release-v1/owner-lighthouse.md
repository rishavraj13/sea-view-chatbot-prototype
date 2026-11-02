## Owner-supplied Lighthouse measurement — 2026-11-02

The owner supplied these measured results verbatim; no scores were altered, rounded or estimated. Tool: Lighthouse `<VERSION>` (the supplied version placeholder is retained; the actual version was not specified).

Command supplied by the owner:

```text
npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new"
```

Method: default mobile emulation and simulated throttling, 3 runs per page, median reported. Target: local production build (`npm run build; npm run start -- -p 3100`) in explicit mock mode on the owner's Windows machine.

```text
Date: 2026-11-02. Tool: Lighthouse <VERSION>. Command: npx lighthouse <url> --only-categories=performance,
accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless=new" (default mobile
emulation and simulated throttling), 3 runs per page, median reported. Target: local production build
(npm run build; npm run start -- -p 3100) in explicit mock mode on the owner's Windows machine.
/ : Performance 84 (runs 82, 84, 84), Accessibility 100 (100, 100, 100), Best Practices 96 (96, 96, 96),
SEO 100 (100, 100, 100).
/knowledge : Performance 77 (runs 76, 77, 79), Accessibility 100 (100, 100, 100), Best Practices 96
(96, 96, 96), SEO 100 (100, 100, 100).
```

Performance is below the **85 internal target on both pages**. These are local Lighthouse measurements under simulated mobile throttling, **not field data** or deployed-production scores. No performance work was done after measurement. No unverified cause is attributed to the scores. This replaces the earlier “not measured” status; it does not establish universal Lighthouse certification or a passing performance target.
