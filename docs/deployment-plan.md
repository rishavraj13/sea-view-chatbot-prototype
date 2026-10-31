# Live Groq production deployment plan — no deployment performed

Checked official Vercel documentation on 2026-10-31. This phase changes no hosted configuration or protection settings.

## Exact production environment

In the Vercel project's Settings → Environment Variables, select **Production** and configure:

| Variable         | Exact value                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| MODEL_MODE       | live                                                                               |
| MODEL_PROVIDER   | groq                                                                               |
| MODEL_ID         | qwen/qwen3.8-27b                                                                   |
| GROQ_API_KEY     | The real private Groq key, entered securely; never copy its value into docs or Git |
| REASONING_EFFORT | none                                                                               |

The first four enable live Groq. REASONING_EFFORT=none explicitly disables Qwen reasoning using the already supported provider option; without it the backend's default is low. No GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY, GOOGLE_MODEL, GOOGLE_THINKING_BUDGET or GOOGLE_THINKING_LEVEL is needed for this selection. Do not use NEXT_PUBLIC_ prefixes. The existing configuration reader remains the only runtime environment reader.

After environment configuration, a future authorized production deployment/redeployment is needed to apply the variables; editing variables does not change existing deployments. No CLI deployment command was run in this phase. Before a future release, verify the public sources route and both POST routes, metadata mode=live/provider=groq/modelId=qwen/qwen3.8-27b, structured source parts and both media tools. Missing selected credentials still yield explicitly labelled mock; provider errors remain typed with no retry/provider fallback. The 20-second deadline and route maxDuration values are unchanged.

## Turning off Deployment Protection

Plan only; do not execute these steps in this phase:

1. Open the intended Vercel team/account and project, then Settings → Deployment Protection (the current docs also expose Deployment Protection directly in the project sidebar).
2. In **Vercel Authentication**, turn its enable toggle off and select **Save**. Check the selected project/environment scope before saving. Disabling it removes that authentication protection from existing deployments as well.
3. If **Password Protection** or **Trusted IPs** is also enabled for the intended public environment, disable that restriction and save it too; switching off Vercel Authentication alone does not disable independent protection methods. Leave unrelated firewall settings untouched.
4. After a future authorized deployment, open the intended production URL in a signed-out/private session and check the three API routes without protection cookies, bypass headers or share tokens. Confirm there is no Vercel login/password challenge. This verifies public access rather than an authenticated browser's access.

References: [environment variables](https://vercel.com/docs/environment-variables), [Vercel Authentication management](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication#managing-vercel-authentication), [Deployment Protection](https://vercel.com/docs/deployment-protection). Other protection methods depend on plan and existing configuration; they were not inspected or changed here.
