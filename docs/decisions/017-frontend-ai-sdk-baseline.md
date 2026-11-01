# ADR 017: Keep the verified backend SDK through an exact frontend dependency

Date: 2026-11-02. Status: accepted (owner-approved Approach A).

## Context

The backend and both deployments use the backend-v1 lockfile: ai 7.0.158 and @ai-sdk/gateway 4.0.131. Installing the frontend adapter without a constraint selects @ai-sdk/react 4.0.163, whose exact ai dependency is 7.0.159, changing that frozen runtime.

Read-only npm registry checks returned this mapping:

| @ai-sdk/react | dependencies.ai |
| ------------- | --------------- |
| 4.0.155       | 7.0.151         |
| 4.0.156       | 7.0.152         |
| 4.0.157       | 7.0.153         |
| 4.0.158       | 7.0.154         |
| 4.0.159       | 7.0.155         |
| 4.0.160       | 7.0.156         |
| 4.0.161       | 7.0.157         |
| 4.0.162       | 7.0.158         |
| 4.0.163       | 7.0.159         |

@assistant-ui/react-ai-sdk 1.4.21 depends on @assistant-ui/ai-sdk ^0.0.16 and permits ai ^7.0.101. @assistant-ui/ai-sdk 0.0.16 depends on @ai-sdk/react ^4.0.157 and permits ai ^7.0.101. Both ranges admit the verified baseline.

## Decision

Restore package-lock.json directly from backend-v1, add @ai-sdk/react **4.0.162** as an exact direct runtime dependency, and run ordinary npm install. This declares the frontend integration's SDK compatibility requirement rather than overriding dependency resolution. Keep the adapter available for the next chat-runtime pass; this foundation pass does not wire it.

## Alternatives

- Unconstrained adapter installation selects 4.0.163 and changes the frozen SDK; rejected.
- External-store runtime without the adapter (Approach B) remains possible but is unnecessary because Approach A works.
- npm overrides, forced/legacy resolution or lockfile edits are prohibited and unused.

## Consequences and verification

A throwaway comparison against backend-v1 found **157 added entries, 0 changed versions or integrity hashes, and 0 removed entries**. npm ls confirms ai 7.0.158, gateway 4.0.131, react adapter 4.0.162, provider 4.0.35 and provider-utils 5.0.72. Existing package.json dependency ranges are unchanged. Future dependency changes must repeat this comparison; upgrading the exact frontend dependency requires a new backend compatibility decision.
