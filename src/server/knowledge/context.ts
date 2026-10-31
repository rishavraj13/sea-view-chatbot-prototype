import type { Chunk } from './index';
/** Exact canonical source lines shared by trace and the model prompt; no generated facts. */
export function buildModelContext(chunks: readonly Chunk[]): string {
  return chunks
    .map((chunk) => `[${chunk.source.url}] ${chunk.text}`)
    .join('\n');
}
