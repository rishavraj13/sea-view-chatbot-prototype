# Frontend foundation pass 1

Date: 2026-11-02. Branch: frontend. Backend baseline: backend-v1.

## A: Dependency baseline

Approach A; see ADR 017 for the registry version table and compatibility evidence. Read-only commands: npm view @assistant-ui/ai-sdk@0.0.16 dependencies peerDependencies; npm view @assistant-ui/react-ai-sdk@1.4.21 dependencies peerDependencies; npm view @ai-sdk/react versions --json; npm view @ai-sdk/react@4.0.155 through 4.0.163 dependencies.ai. Versions output includes every requested version. 4.0.162 maps to 7.0.158 and satisfies ^4.0.157.

Restored package-lock.json with git show backend-v1:package-lock.json (byte-preserving write), added the exact direct dependency, then npm install. No lock editing or overrides.

```text
changed 3 packages, and audited 559 packages in 22s
164 packages are looking for funding
17 moderate severity vulnerabilities
```

npm also reported pending esbuild/unrs-resolver install-script notices. No remediation changing versions was run.

```text
npm ls ai @ai-sdk/gateway @ai-sdk/react @ai-sdk/provider @ai-sdk/provider-utils
assignment@0.1.0 C:\assignment
@ai-sdk/react@4.0.162 -> ai@7.0.158 (deduped across adapter/provider consumers)
ai@7.0.158 -> @ai-sdk/gateway@4.0.131
@ai-sdk/provider@4.0.35
@ai-sdk/provider-utils@5.0.72
Lock proof: added=157 changed=0 removed=0
Changed: []
Removed: []
```

The throwaway Python comparison used each package path's `(version, integrity)` tuple from git show backend-v1:package-lock.json against the installed lockfile. Root dependency metadata is additive; all existing root ranges remain identical. git diff backend-v1 -- package.json contains additions only.

```text
Before unit tests: ports 3000 and 3100 free
> assignment@0.1.0 test
> vitest run
RUN v5.0.5 C:/assignment
Test Files 39 passed (39)
Tests 463 passed (463)
Duration 3.89s
After unit tests: ports 3000 and 3100 free
```

434 unchanged server cases, scaffold 1, frontend/content 28. No provider calls; MODEL_MODE=mock. Later sections record the completed UI verification.

## B: Lint

```text
Before lint: ports 3000 and 3100 free
> assignment@0.1.0 lint
> eslint . --max-warnings=0
After lint: ports 3000 and 3100 free
Exit 0
```

forbidOnly is unconditionally true; no process.env in Playwright config, no eslint-disable.

## C: Font verification

Removed :root font-variable overrides, retained local font files and next/font/local, and used generated variables with fallback stacks. Bundled upstream OFL notices and linked them in design-notes. No runtime packages or font binaries changed.

```text
> assignment@0.1.0 build
> next build
Next.js 16.4.3 (Turbopack)
Compiled successfully in 1485ms
Finished TypeScript in 3.8s
Generating static pages using 8 workers (7/7) in 743ms
Routes: /, /_not-found, /api/chat, /api/knowledge/sources, /api/knowledge/trace, /knowledge
Exit 0

npx playwright test tests/e2e/foundation.spec.ts --project="Desktop Chrome"
ok hero renders the bundled Familjen Grotesk platform font (387ms)
1 passed (2.2s)
```

CDP CSS.getPlatformFontsForNode requires every rendered font on the hero echo word to have familyName Familjen Grotesk and isCustomFont true. Both ports free before/after both runs. Only mock mode used.
