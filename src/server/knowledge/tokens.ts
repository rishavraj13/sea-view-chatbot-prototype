const stopWords = new Set(
  'the a an is are was what whats how do does did i we you me my our your and or can could would should will please tell about it its that this those these in on at of for with if after be have has demo content offer offers take'.split(
    ' ',
  ),
);
const vocabulary: Record<string, string> = {
  packages: 'package',
  inclusions: 'include',
  inclusion: 'include',
  included: 'include',
  includes: 'include',
  cover: 'include',
  covers: 'include',
  pricing: 'price',
  prices: 'price',
  cost: 'price',
  costs: 'price',
  fees: 'price',
  fee: 'price',
  rain: 'weather',
  rains: 'weather',
  raining: 'weather',
  rainy: 'weather',
  cancel: 'cancellation',
  cancels: 'cancellation',
  cancelled: 'cancellation',
  canceled: 'cancellation',
  cancellations: 'cancellation',
  rescheduling: 'reschedule',
  rescheduled: 'reschedule',
  meet: 'location',
  meeting: 'location',
  meetup: 'location',
  booking: 'book',
  bookings: 'book',
  photos: 'photo',
  checks: 'check',
  checked: 'check',
  instructors: 'instructor',
  jumps: 'jump',
  cameramen: 'cameraman',
  photographs: 'photo',
  photography: 'photo',
  videos: 'video',
  film: 'video',
  footage: 'video',
  pickups: 'pickup',
  transfer: 'pickup',
  transfers: 'pickup',
  bangkok: 'bangkok',
  high: 'altitude',
  height: 'altitude',
  feet: 'ft',
  foot: 'ft',
  certificates: 'certificate',
  certified: 'certify',
  certifies: 'certify',
  identification: 'id',
  ids: 'id',
  where: 'location',
  address: 'location',
  operated: 'operator',
  refunds: 'refund',
  refunded: 'refund',
  refundable: 'refund',
  conditions: 'condition',
  steps: 'step',
  stops: 'stop',
  stopped: 'stop',
  operates: 'operator',
  needed: 'need',
  time: 'duration',
  long: 'duration',
};
/** Bounded lexical normalization, shared by source and query scoring; never produces answer facts. */
export function retrievalTokens(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\bno[ -]?show\b/g, 'noshow')
    .replace(/฿/g, ' price ');
  const words = (normalized.match(/[a-z0-9]+/g) ?? [])
    .filter((word) => !stopWords.has(word))
    .map((word) => vocabulary[word] ?? word);
  if (/\bhow much\b/.test(normalized)) words.push('price');
  if (
    /\bhow long\b|\b\d+\s*h\b|\b(?:seconds?|minutes?|hours?|days?)\b/.test(
      normalized,
    )
  )
    words.push('duration');
  if (/\b(?:do not|dont|not) turn up\b/.test(normalized)) words.push('noshow');
  if (/\bwhat (?:do|will) (?:i|we) (?:get|receive)\b/.test(normalized))
    words.push('include');
  return new Set(words);
}
