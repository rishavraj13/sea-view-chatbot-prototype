const mediaNoun =
  '(?:brochures?|pdfs?|leaflets?|flyers?|pamphlets?|documents?|videos?|footages?|clips?|films?|watch(?:es)?|recordings?)';
const modifiers =
  '(?:(?:a|an|the|your|our|this|that|some|short|latest|eco|deluxe|vip)\\s+)*';
const requestVerb = '(?:send|show|share|email|give|get|see|watch|view|have)';
const questionOpener =
  /^(?:does|do|is|are|was|will|would|what|which|how|why|where|when|who|whose|am\s+i)\b/i;
const imperative =
  /^(?:send|show|share|email|give|get|attach|download|let\s+me\s+(?:see|watch))\b/i;
const modal = new RegExp(
  `^(?:can|could|may|will|would)\\s+(?:i|you)\\s+(?:please\\s+)?${requestVerb}\\b`,
  'i',
);
const desire = new RegExp(
  `^i(?:\\s+want|'d\\s+like|\\s+need)\\s+(?:to\\s+)?(?:${requestVerb}|attach|download)\\s+(?:me\\s+)?${modifiers}${mediaNoun}\\b`,
  'i',
);
const nounPlease = new RegExp(
  `^${modifiers}${mediaNoun}(?:\\s+(?:and|or)\\s+${modifiers}${mediaNoun})*\\s+please$`,
  'i',
);

/** Pure bounded English request-form detection; question clauses cannot force file execution. */
export function isMediaRequest(text: string): boolean {
  const sentences = text.replace(/’/g, "'").split(/[.!?;\n]+/);
  return sentences.some((sentence) =>
    sentence
      .split(
        /(?:,\s*|\s+(?:and|but|then)\s+)(?=(?:can|could|may|will|would)\s+(?:i|you)\b)/i,
      )
      .some((part, index) => {
        const clause = part
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/^please\s+/i, '');
        // Only a separately introduced later modal request can override the opening question clause.
        if (questionOpener.test(clause) && !(index > 0 && modal.test(clause)))
          return false;
        if (!new RegExp(`\\b${mediaNoun}\\b`, 'i').test(clause)) return false;
        return (
          imperative.test(clause) ||
          modal.test(clause) ||
          desire.test(clause) ||
          nounPlease.test(clause)
        );
      }),
  );
}
