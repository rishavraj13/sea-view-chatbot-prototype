/** Model capability names selected by the unchanged media-noun vocabulary. */
export type MediaToolName = 'sendBrochure' | 'showVideo';
/** Latest-turn lexical policy; request cues affect choice, never registry identity. */
export interface MediaPolicy {
  state: 'none' | 'optional' | 'required';
  tools: MediaToolName[];
}
/** Pure whole-word policy: no noun -> none, noun without cue -> optional, noun plus cue -> required. */
export function getMediaPolicy(latestUserText: string): MediaPolicy {
  const tools: MediaToolName[] = [];
  if (
    /\b(?:brochures?|pdfs?|leaflets?|flyers?|pamphlets?|documents?)\b/i.test(
      latestUserText,
    )
  )
    tools.push('sendBrochure');
  if (
    /\b(?:videos?|footages?|clips?|films?|watch(?:es)?|recordings?)\b/i.test(
      latestUserText,
    )
  )
    tools.push('showVideo');
  const request =
    /\b(?:send|show|share|email|give|get|see|watch|view|download|attach|please)\b|\b(?:can\s+i\s+have|could\s+i|i\s+want|i['’]d\s+like|i\s+need)\b/i.test(
      latestUserText,
    );
  return {
    state: tools.length ? (request ? 'required' : 'optional') : 'none',
    tools,
  };
}
/** Compatibility noun predicate; request strength is available through getMediaPolicy. */
export function hasMediaIntent(latestUserText: string): boolean {
  return getMediaPolicy(latestUserText).state !== 'none';
}
