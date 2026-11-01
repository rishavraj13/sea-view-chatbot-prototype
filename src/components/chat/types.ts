export type ErrorCode =
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'MODEL_FAILURE'
  | 'INVALID_INPUT';

export interface ChatErrorData {
  readonly code: ErrorCode | string;
  readonly message: string;
  readonly retryAfterSeconds?: number;
}

export interface BrochureResult {
  readonly kind: 'brochure';
  readonly type: 'pdf';
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly isDemo: boolean;
  readonly posterUrl?: string;
}

export interface VideoResult {
  readonly kind: 'video';
  readonly type: 'video';
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly isDemo: boolean;
  readonly posterUrl?: string;
}

export interface UnavailableResult {
  readonly kind: 'unavailable';
  readonly id: string;
  readonly title: string;
  readonly url: '';
  readonly isDemo: boolean;
  readonly reason: 'unknown' | 'unavailable' | 'wrong-type';
  readonly posterUrl?: string;
}

export type MediaResult = BrochureResult | VideoResult | UnavailableResult;

export interface SourceCitation {
  readonly type: 'source-url';
  readonly sourceId: string;
  readonly url: string;
  readonly title?: string;
}

export interface PageSourceChip {
  readonly pageKey: 'seaview' | 'cancellations';
  readonly label: 'Sea View Skydiving page' | 'Cancellations page';
  readonly url: string;
}
