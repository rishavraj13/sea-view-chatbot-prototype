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
      description: 'Send demo PDF brochure; default id brochure.',
      inputSchema: z.object({ id: z.string().max(100).default('brochure') }),
      execute: async ({ id }) => execute('sendBrochure', id),
    }),
    showVideo: tool({
      description: 'Show demo sample video; default id video.',
      inputSchema: z.object({ id: z.string().max(100).default('video') }),
      execute: async ({ id }) => execute('showVideo', id),
    }),
  };
  try {
    // Explicit asset requests must resolve even when a model omits or substitutes their IDs.
    for (const item of selection)
      if (item.explicit) execute(item.name, item.id);
    if (trace.mode === 'mock') {
      for (const item of selection) execute(item.name, item.id);
      trace.text =
        '[MOCK DEMO] ' +
        (trace.chunks.length
          ? trace.context
          : 'I do not have that information.');
    } else {
      const result = await generateText({
        model: p.model(),
        system: buildSystemPrompt(trace.context),
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.parts
            .map((p) => (p.type === 'text' ? p.text : JSON.stringify(p)))
            .join('\n'),
        })),
        tools,
        providerOptions: p.providerOptions,
        maxOutputTokens: 1500,
        maxRetries: 0,
        abortSignal: options.signal ?? AbortSignal.timeout(20000),
      });
      trace.text = groundedAnswer(result.text, trace.chunks, trace.media);
    }
    const summary = summarizeMedia(trace.media);
    if (summary)
      trace.text = trace.text ? `${trace.text}\n${summary}` : summary;
    return trace;
  } catch (error) {
    throw mapError(error);
  }
}
