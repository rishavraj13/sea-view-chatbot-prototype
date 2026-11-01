import type { MediaResult, SourceCitation } from '../chat/types';

export interface KnowledgeSource {
  readonly title: string;
  readonly url: string;
  readonly capturedAt: string;
  readonly isDemo: boolean;
  readonly text: string;
}

export interface KnowledgeMediaItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly isDemo: boolean;
  readonly type: 'pdf' | 'video';
  readonly available: boolean;
  readonly posterUrl?: string;
}

export interface KnowledgeSourcesResponse {
  readonly isDemo: boolean;
  readonly sources: readonly KnowledgeSource[];
  readonly media: readonly KnowledgeMediaItem[];
}

export interface TraceChunk {
  readonly id: string;
  readonly text: string;
  readonly score: number;
  readonly source: {
    readonly title: string;
    readonly url: string;
    readonly capturedAt: string;
    readonly isDemo: boolean;
    readonly text: string;
  };
}

export interface TraceResponse {
  readonly mode: 'live' | 'mock';
  readonly provider: string;
  readonly modelId: string;
  readonly isDemo: boolean;
  readonly chunks: readonly TraceChunk[];
  readonly context: string;
  readonly toolCalls: readonly string[];
  readonly media: readonly MediaResult[];
  readonly text: string;
  readonly citations: readonly SourceCitation[];
}

