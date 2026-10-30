import { registry } from '../media';
/** Explicit registry request selected from the current user turn. */
export interface MediaSelection {
  name: 'sendBrochure' | 'showVideo';
  id: string;
  explicit: boolean;
}
/** Preserves explicit IDs, including unknown or disabled entries, for registry resolution. */
export function selectMedia(question: string): MediaSelection[] {
  const matches = [
    ...question.matchAll(/\bid\s*(?::|=)?\s*["']?([a-z0-9_-]{1,100})/gi),
  ];
  const requested: MediaSelection[] = [];
  let end = 0;
  for (const match of matches) {
    const id = match[1]!;
    const asset = registry.find((a) => a.id === id);
    const hint = [
      ...question
        .slice(end, match.index)
        .matchAll(/\b(pdf|brochure|video)\b/gi),
    ]
      .at(-1)?.[1]
      ?.toLowerCase();
    const type = hint
      ? hint === 'video'
        ? 'video'
        : 'pdf'
      : (asset?.type ?? 'pdf');
    requested.push({
      name: type === 'pdf' ? 'sendBrochure' : 'showVideo',
      id,
      explicit: true,
    });
    end = match.index + match[0].length;
  }
  const intent = question.replace(
    /\bid\s*(?::|=)?\s*["']?[a-z0-9_-]{1,100}/gi,
    '',
  );
  for (const [pattern, name, id] of [
    [/brochure|pdf/i, 'sendBrochure', 'brochure'],
    [/video/i, 'showVideo', 'video'],
  ] as const) {
    if (pattern.test(intent) && !requested.some((r) => r.name === name))
      requested.push({
        name,
        id: /missing/i.test(question) ? 'missing' : id,
        explicit: false,
      });
  }
  return requested;
}
