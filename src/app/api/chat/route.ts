import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import {
  chatRequestSchema,
  ChatError,
  mapError,
  runPipeline,
  publicModelMetadata,
} from '@/server/chat';
export const runtime = 'nodejs';
export const maxDuration = 30;
/** Streams AI SDK UIMessage SSE, with mock/live metadata on every response. */
export async function POST(request: Request) {
  try {
    const raw: unknown = await request.json().catch(() => {
      throw new ChatError('INVALID_INPUT', 400, 'Invalid JSON.');
    });
    const parsed = chatRequestSchema.safeParse(raw);
    if (!parsed.success)
      throw new ChatError('INVALID_INPUT', 400, 'Invalid message history.');
    const result = await runPipeline(parsed.data, {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]),
    });
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({
          type: 'start',
          messageId: crypto.randomUUID(),
          messageMetadata: {
            mode: result.mode,
            provider: result.provider,
            modelId: result.modelId,
            isDemo: result.isDemo,
          },
        });
        writer.write({ type: 'start-step' });
        for (const [i, call] of result.toolCalls.entries()) {
          const toolCallId = `tool-${i}`;
          writer.write({
            type: 'tool-input-available',
            toolCallId,
            toolName: call.name,
            input: call.input,
          });
          writer.write({
            type: 'tool-output-available',
            toolCallId,
            output: call.result,
          });
        }
        writer.write({ type: 'text-start', id: 'answer' });
        writer.write({ type: 'text-delta', id: 'answer', delta: result.text });
        writer.write({ type: 'text-end', id: 'answer' });
        writer.write({ type: 'finish-step' });
        writer.write({
          type: 'finish',
          finishReason: 'stop',
          messageMetadata: {
            mode: result.mode,
            provider: result.provider,
            modelId: result.modelId,
            isDemo: result.isDemo,
          },
        });
      },
      onError: () => 'The response stream failed.',
    });
    return createUIMessageStreamResponse({
      stream,
      headers: { 'x-model-mode': result.mode, 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const e = mapError(error);
    return Response.json(
      { ...publicModelMetadata(), error: { code: e.code, message: e.message } },
      { status: e.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
