export type MediaResult = import('zod').infer<
  typeof import('./schemas').toolOutputSchema
>;
export type BrochureResult = Extract<MediaResult, { kind: 'brochure' }>;
export type VideoResult = Extract<MediaResult, { kind: 'video' }>;
export type UnavailableResult = Extract<MediaResult, { kind: 'unavailable' }>;

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
