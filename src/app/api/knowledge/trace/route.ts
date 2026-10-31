import {
  ChatError,
  mapError,
  runPipeline,
  traceRequestSchema,
  publicModelMetadata,
  buildErrorResponse,
} from '@/server/chat';
export const runtime = 'nodejs';
export const maxDuration = 30;
/** Runs the same pipeline as chat and returns public request-local diagnostics. */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => {
      throw new ChatError('INVALID_INPUT', 400, 'Invalid JSON.');
    });
    const parsed = traceRequestSchema.safeParse(body);
    if (!parsed.success)
      throw new ChatError('INVALID_INPUT', 400, 'Invalid test question.');
    return Response.json(
      await runPipeline(
        {
          messages: parsed.data.messages ?? [
            {
              id: 'trace',
              role: 'user',
              parts: [{ type: 'text', text: parsed.data.question }],
            },
          ],
        },
        {
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]),
        },
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const e = mapError(error);
    return Response.json(buildErrorResponse(e, publicModelMetadata()), {
      status: e.status,
    });
  }
}
