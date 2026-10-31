import { isMediaRequest, isNegatedMediaRequest } from './media-request';
/** Model capability names selected by the unchanged media-noun vocabulary. */
export type MediaToolName = 'sendBrochure' | 'showVideo';
/** Latest-turn lexical policy; request forms affect choice, never registry identity. */
export interface MediaPolicy {
  state: 'none' | 'optional' | 'required';
  tools: MediaToolName[];
}
/** Pure latest-turn policy: no noun -> none; recognized request form -> required; otherwise optional. */
export function getMediaPolicy(latestUserText: string): MediaPolicy {
  if (isNegatedMediaRequest(latestUserText))
    return { state: 'none', tools: [] };
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
  const request = isMediaRequest(latestUserText);
  return {
    state: tools.length ? (request ? 'required' : 'optional') : 'none',
    tools,
  };
}
/** Compatibility noun predicate; request strength is available through getMediaPolicy. */
export function hasMediaIntent(latestUserText: string): boolean {
  return getMediaPolicy(latestUserText).state !== 'none';
}
