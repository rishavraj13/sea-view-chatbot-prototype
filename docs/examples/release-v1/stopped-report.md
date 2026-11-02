# Historical stop at image-cache verification

The owner subsequently supplied Lighthouse scores and explicitly instructed continuing runtime/smoke/docs/archive without a cache fix. See ../../release-v1-report.md for the continuation and quota stop.

Source/tag at deployment: 34e8ab05cce1dc3b0b102391a4af502fcaae3800. master fast-forwarded; no code/config/dependency changes. Both deployments READY/production.

Live: https://sea-view-chatbot-prototype.vercel.app — dpl_WgjFesrR2iDH7zDB7a1ard9TNNgK
Mock: https://sea-view-chatbot-prototype-mock.vercel.app — dpl_4YCmMiMJSoDi2cYWjasVdpQhut9J

STOP condition: all five images, both direct public files and optimized /_next/image URLs, return public, max-age=0, must-revalidate. Hashed fonts return public,max-age=31536000,immutable. Configuration change appears necessary to satisfy required long-cache behavior; not authorized to proceed without reporting first. No fix, live smoke/provider call, docs commit, tag move or final archive/build verification performed.

Other completed anonymous checks: home/Knowledge HTTP200/title/description/one h1, anchors, exact 18-section public catalog and manifest, PDF signature/type, invalid chat metadata, footer/demo links and both explicit mock scenarios pass. One external video HEAD returns HTTP200/video/mp4, no download. Runtime/maxDuration metadata has not yet been inspected on the new deployments. Existing project inventory was Node26.x, protection off, expected env names.

Verifier correction: public sources includes documented top-level isDemo; initial strict field expectation omitted it. Rechecked only sources (no extra video HEAD/model calls), exact data matches; corrected no-model-checks.json is authoritative. The initial stdout retains the verifier failure for transparency.

Tracked tree unchanged; owner lh-home.json remains untracked/untouched and was excluded from snapshots. No new Lighthouse scores claimed. Ports 3000/3100 free. Remote Playwright was not run; current config fixes baseURL/webServer and has no external override without a config change.
