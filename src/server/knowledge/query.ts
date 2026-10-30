/** Minimal history shape accepted by the pure retrieval-query builder. */
export interface QueryMessage {
  role: string;
  parts: readonly { type: string; text?: string }[];
}
/** Carries the preceding user topic only for a referential follow-up; explicit new topics reset it. */
export function buildRetrievalQuery(messages: readonly QueryMessage[]): string {
  const users = messages
    .filter((m) => m.role === 'user')
    .map((m) =>
      m.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text ?? '')
        .join('\n'),
    );
  const latest = users.at(-1) ?? '';
  const dependent =
    /\b(that|those|these|it|its|they|them|their)\b|^(and\b|what about\b)/i.test(
      latest,
    );
  return dependent && users.length > 1 ? `${users.at(-2)}\n${latest}` : latest;
}
