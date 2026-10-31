/** Pure latest-turn lexical gate; excludes generic verbs, photos and inclusion questions. */
export function hasMediaIntent(latestUserText: string): boolean {
  return /\b(?:brochures?|pdfs?|leaflets?|flyers?|pamphlets?|documents?|videos?|footage|footages|clips?|films?|watch(?:es)?|recordings?)\b/i.test(
    latestUserText,
  );
}
