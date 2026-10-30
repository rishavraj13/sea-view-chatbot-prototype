import type { Chunk } from '../knowledge';
import type { MediaResult } from '../media';
/** Exact context, tool execution, and model mode; never includes history or secrets. */
export interface Trace {
  mode: 'live' | 'mock';
  chunks: Chunk[];
  context: string;
  toolCalls: {
    name: 'sendBrochure' | 'showVideo';
    input: { id: string };
    result: MediaResult;
  }[];
  media: MediaResult[];
  text: string;
}
/** Creates a request-local trace. */
export function buildTrace(mode: Trace['mode'], chunks: Chunk[]): Trace {
  return {
    mode,
    chunks,
    context: chunks.map((c) => `[${c.source.url}] ${c.text}`).join('\n'),
    toolCalls: [],
    media: [],
    text: '',
  };
}
