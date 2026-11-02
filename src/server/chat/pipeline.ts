import { generateText, tool } from 'ai';
import { z } from 'zod';
import { retrieve, buildRetrievalQuery } from '../knowledge';
import { resolveMedia } from '../media';
import { buildTrace } from '../trace';
import { provider } from './provider';
import type { ChatRequest } from './validation';
import { mapError } from './errors';
import { selectMedia } from './media-selection';
import { summarizeMedia } from './media-summary';
import { buildSystemPrompt, groundedAnswer } from './answer';
import { presentCitations } from './citations';
import { getMediaPolicy } from './media-intent';
import { buildModelMessages } from './history';
/** Shared request-local pipeline for chat and trace; no conversation persistence. */
export async function runPipeline(
  request: ChatRequest,
  options: { mock?: boolean; signal?: AbortSignal } = {},
) {
  const question = request.messages
    .at(-1)!
    .parts.map((p) => (p.type === 'text' ? p.text : ''))
    .join('\n');
  const p = provider();
  const trace = buildTrace(
    {
      mode: options.mock ? 'mock' : p.mode,
      provider: p.provider,
      modelId: p.modelId,
    },
    retrieve(buildRetrievalQuery(request.messages)),
  );
  const selection = selectMedia(question);
  const execute = (name: 'sendBrochure' | 'showVideo', id: string) => {
    const explicit = selection.filter((s) => s.explicit && s.name === name);
    if (explicit.length && !explicit.some((s) => s.id === id))
      id = explicit[0]!.id;
    const existing = trace.toolCalls.find(
      (c) => c.name === name && c.input.id === id,
    );
    if (existing) return existing.result;
    const result = resolveMedia(id, name === 'sendBrochure' ? 'pdf' : 'video');
    trace.toolCalls.push({ name, input: { id }, result });
    trace.media.push(result);
    return result;
  };
  const tools = {
    sendBrochure: tool({
      description:
        'Call only when the customer asks to receive the brochure/PDF file itself. Never call to answer a question about its contents, inclusions, price or photos. The registry resolves the fixed brochure; no id parameter.',
      inputSchema: z.strictObject({}),
      execute: async () => execute('sendBrochure', 'brochure'),
    }),
    showVideo: tool({
      description:
        'Call only when the customer asks to receive or watch the video file itself. Never call to answer a question about its contents or package benefits. The registry resolves the fixed video; no id parameter.',
      inputSchema: z.strictObject({}),
      execute: async () => execute('showVideo', 'video'),
    }),
  };
  const policy = getMediaPolicy(question);
  const offeredTools = {
    ...(policy.tools.includes('sendBrochure')
      ? { sendBrochure: tools.sendBrochure }
      : {}),
    ...(policy.tools.includes('showVideo')
      ? { showVideo: tools.showVideo }
      : {}),
  };
  try {
    // Explicit asset requests must resolve even when a model omits or substitutes their IDs.
    for (const item of selection)
      if (item.explicit) execute(item.name, item.id);
    if (trace.mode === 'mock') {
      if (policy.state !== 'none') {
        for (const name of policy.tools) {
          const selected = selection.find((item) => item.name === name);
          // An asset ID can itself be a media noun; its registry selection owns the type.
          if (!selected && selection.some((item) => item.explicit)) continue;
          const id =
            selected?.id ??
            (name === 'sendBrochure' ? 'brochure' : 'video');
          execute(name, id);
        }
      }
      trace.text =
        '[MOCK] ' +
        (trace.chunks.length
          ? trace.context
          : 'I do not have that information.');
    } else {
      const result = await generateText({
        model: p.model(),
        system: buildSystemPrompt(trace.context),
        messages: buildModelMessages(request.messages),
        ...(policy.state !== 'none' ? { tools: offeredTools } : {}),
        toolChoice:
          policy.state === 'none'
            ? 'none'
            : policy.state === 'required'
              ? 'required'
              : 'auto',
        providerOptions: p.providerOptions,
        maxOutputTokens: 1500,
        maxRetries: 0,
        abortSignal: options.signal ?? AbortSignal.timeout(20000),
      });
      trace.text = groundedAnswer(result.text, trace.chunks, trace.media);
    }
    const presented = presentCitations(trace.text, trace.chunks);
    trace.text = presented.text;
    trace.citations = presented.citations;
    const summary = summarizeMedia(trace.media);
    if (summary)
      trace.text = trace.text ? `${trace.text}\n${summary}` : summary;
    trace.isDemo =
      trace.chunks.some((c) => c.source.isDemo) ||
      trace.media.some((m) => m.isDemo);
    return trace;
  } catch (error) {
    throw mapError(error, { provider: p.provider, modelId: p.modelId });
  }
}
