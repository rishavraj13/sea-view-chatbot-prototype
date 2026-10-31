/** Unsupported facets in the two-page static capture must abstain rather than match generic jump terms. */
export function unsupportedQuestion(tokens: ReadonlySet<string>): boolean {
  const unsupported = [
    'age',
    'old',
    'child',
    'children',
    'minor',
    'weight',
    'weigh',
    'kg',
    'kilogram',
    'lbs',
    'health',
    'medical',
    'condition',
    'heart',
    'pregnant',
    'wear',
    'clothing',
    'clothes',
    'attire',
    'dress',
    'baggage',
    'luggage',
    'bags',
  ];
  return (
    unsupported.some((token) => tokens.has(token)) ||
    (tokens.has('pickup') && tokens.has('price'))
  );
}
