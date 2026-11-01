# Frontend pass 5: release readiness

Baseline: frontend at 81f9b27. Verification is local, production build, explicit MOCK mode. No live provider calls, deployment, installations, package-version changes or backend edits. The owner's pre-existing citation-report content is protected.

## Quality and measurement

Lighthouse is unavailable: command lookup found no CLI; no lighthouse package is in project node_modules or the existing npm _npx cache. Chrome and Playwright/CDP are installed, but their timings/axe checks do not constitute Lighthouse scores. The no-install constraint takes priority. The three mobile-preset runs per page, before and after, could not run. No audit/throttling alteration or fabricated score. Lighthouse target certification remains a release blocker and requires an already-installed Lighthouse tool in a later authorized run.

| Page | Stage | Runs | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|---|---|
| / | Before | 0 | unavailable | unavailable | unavailable | unavailable |
| / | After | 0 | unavailable | unavailable | unavailable | unavailable |
| /knowledge | Before | 0 | unavailable | unavailable | unavailable | unavailable |
| /knowledge | After | 0 | unavailable | unavailable | unavailable | unavailable |

Separate cold-load CDP evidence measures encodedDataLength on Network.loadingFinished with cache disabled, a fresh context and default project device settings (no custom throttling). At 390px / DPR 2.75: baseline homepage 593,987 bytes and Knowledge 550,966 bytes; after quality changes homepage 594,367 and Knowledge 543,851 bytes. These are observed single loads, not Lighthouse medians or statistically meaningful speed comparisons. Plan photos are lazy and below the 220dvh hero, so their savings occur on scroll, not initial load. All request paths/bytes and paint/navigation timings are in load-*.json; before/ preserves the baseline captures.

Image cause/fix: mobile plan sizes claimed 100vw (390px) instead of their actual 300px frame. They selected 1080px; corrected sizes select 828px for 825 physical pixels. At tablet the slot is 306px and at desktop the four slots are about 401/401/457/505px. Accurate sizes plus additional sub-640 optimizer buckets choose 320px at tablet, and 416/416/464/512px at desktop rather than 640px. The original hero remains priority/fill and 100vw. A 1440 candidate avoids the desktop jump from 1200 to 1920. Browser assertions bound every plan image to the first useful candidate within 10% of physical slot size; bounded optimizer rounding is documented rather than claiming exact arbitrary pixel widths. No source asset, image content, provider/runtime contract or dependency changed.

SEO: both routes have actual shared title/description, lang=en, default responsive viewport and explicit index/follow without a canonical. Home description is the existing on-page sentence “Tandem jump over Pattaya.” Knowledge description is its own subtitle. No invented Open Graph image. The Knowledge outline skipped h1→h3; each tabpanel now has a real, screen-reader-visible h2 describing its content. No visual redesign.

Keyboard evidence: keyboard-only Tab order covers the skip link, visible header links/action, intro links, all package ask buttons, FAQ summaries, footer links and launcher. Hero/plan are non-interactive and reachable in the heading outline, not artificial tab stops. Native details open/close through Enter. Knowledge tabs use arrows/End and trace is submitted by keyboard against the MOCK backend. Every visited control has >=2px solid warm ink/ember outline. Exactly one h1 and no skipped levels are checked on each page/active panel. axe label-content-name-mismatch and heading-order pass. Native dialog traps background controls and restores launcher focus on Escape; Chromium may briefly focus body at its browser-chrome Tab boundary. This is automated DOM/accessibility-tree verification, not a claim of a human NVDA/VoiceOver session. Reduced motion plus increased contrast preserve layout and remove hero pinning.

## Quality commit: real output

### npm run typecheck

```text
> assignment@0.1.0 typecheck
> next typegen && tsc --noEmit

Generating route types...
✓ Types generated successfully
```

### npm run lint

```text
> assignment@0.1.0 lint
> eslint . --max-warnings=0
```

### npm run test

```text
> assignment@0.1.0 test
> vitest run


 RUN  v5.0.5 C:/assignment


 Test Files  45 passed (45)
      Tests  526 passed (526)
   Start at  02:47:55
   Duration  4.16s (import 45%, setup 25%, environment 12%, transform 10%, tests 8%, worker 1%)

     Import  226 modules were evaluated 1807 times · 16.87s total, 45% of tracked time
             ~529ms faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```

Build passes; full output: quality-build.txt. Focused production-build e2e: 24 passed (21.0s), quality-e2e-final.txt. No retries or timeout changes.
