# Provider selection and one generation step

Status: accepted for Phase 1.7; supersedes multi-step media continuation in ADR 001 and the generation-loop portions of ADR 007.

## Context

The previous loop could use up to three provider calls, and trace repeated those calls. Daily quotas were exhausted and some requests hit the 20-second deadline. A second model call is unnecessary just to describe a resolved PDF/video. Providers differ in free quotas, tool compatibility, and reasoning controls.

## Decision

Keep the AI SDK's default single generateText step; remove stepCountIs(3), retain maxRetries=0. Live turns make exactly one provider generation call, including empty retrieval, follow-ups and media. Tool handlers execute in that same step. Deterministic summarizeMedia describes only returned registry records, never inferred policies or facts. Retain same-step model text only if it passes the existing exact grounding check, now also allowing exact registry-summary lines; append the registry summary to ensure explicit availability messages. Unsupported factual model prose is still not exposed. Explicit mock mode uses zero provider calls and keeps its MOCK labels.

MODEL_PROVIDER and MODEL_ID choose one configured Google, Groq or OpenRouter model. Missing selected key remains explicit mock; provider failures return typed live errors. Never select an alternative provider or model on error. OpenRouter's backend allow_fallbacks is disabled. Only public mode/provider/modelId are added to response metadata and trace; request, stream-event and tool-result shapes stay unchanged.

Default Google 2.5 Flash thinking budget is 0; other supported controls are model-specific and validated. The deadline remains 20 seconds because old logs cannot establish that thinking alone caused the timeouts. See providers.md for dated research and limitations.

## Alternatives

Multi-step tool continuations (extra latency/quota); automatic provider fallback (conceals failures and changes billing/model semantics); entirely scripted live media selection (would not verify model tool selection); retaining ungrounded same-step prose (breaks the existing knowledge boundary).

## Consequences

One model step can select multiple tools but cannot make sequential decisions based on their results. Pure registry summaries handle media descriptions. A model that fails to select a requested non-explicit tool will not get another chance that turn. Mock language-model tests exercise the real SDK loop for seven scenarios; provider HTTP fixtures verify wire controls. The strict grounding guard can still refuse known factual questions; that limitation is not changed here. No deployment is performed.
