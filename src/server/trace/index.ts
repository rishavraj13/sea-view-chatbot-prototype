import type { Chunk, Citation } from '../knowledge';
import { buildModelContext } from '../knowledge';
import type { MediaResult } from '../media';
import type { ModelMetadata } from '../config';
/** Exact context, tool execution, and model mode; never includes history or secrets. */
export interface Trace extends ModelMetadata {
  mode: 'live' | 'mock';
  isDemo: boolean;
  chunks: Chunk[];
  context: string;
  toolCalls: {
    name: 'sendBrochure' | 'showVideo';
    input: { id: string };
    result: MediaResult;
  }[];
  media: MediaResult[];
  text: string;
  citations: Citation[];
}
/** Creates a request-local trace. */
export function buildTrace(metadata: ModelMetadata, chunks: Chunk[]): Trace {
  return {
    ...metadata,
    isDemo: chunks.some((chunk) => chunk.source.isDemo),
    chunks,
    context: buildModelContext(chunks),
    toolCalls: [],
    media: [],
    text: '',
    citations: [],
  };
}
