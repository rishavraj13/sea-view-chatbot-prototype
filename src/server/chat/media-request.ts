const mediaNoun =
  '(?:brochures?|pdfs?|leaflets?|flyers?|pamphlets?|documents?|videos?|footages?|clips?|films?|watch(?:es)?|recordings?)';
const modifiers =
  '(?:(?:a|an|the|your|our|this|that|some|short|latest|eco|deluxe|vip)\\s+)*';
const requestVerb =
  '(?:send|show|share|email|give|get|see|watch|view|have|play|open|access)';
const questionOpener =
  /^(?:does|do|is|are|was|will|would|what|which|how|why|where|when|who|whose|am\s+i)\b/i;
const imperative =
  /^(?:send|show|share|email|give|get|attach|download|view|watch|play|open|access|let\s+me\s+(?:see|watch))\b/i;
const modal = new RegExp(
  `^(?:can|could|may|will|would)\\s+(?:i|you)\\s+(?:please\\s+)?${requestVerb}\\b`,
  'i',
);
const desire =
  /^i(?:\s+want|'d\s+like|\s+would\s+like|\s+need|'m\s+after)\s+(?:to\s+)?(?:(?:please|just|really)\s+)*/i;
const informationVerb =
  /^(?:know|ask|find\s+out|understand|learn|check|confirm|clarify|wonder)\b/i;
const desiredFile = new RegExp(
  `^(?:(?:${requestVerb}|attach|download)\\s+(?:me\\s+)?)?${modifiers}${mediaNoun}\\b`,
  'i',
);
const negatedRequest = new RegExp(
  `\\b(?:(?:do\\s+not|don't|never)\\s+(?:please\\s+)?(?:${requestVerb}|attach|download)\\b|no\\s+${modifiers}${mediaNoun}\\b)`,
  'i',
);

/** Recognizes explicit English refusal of a file action; it suppresses model tools for this turn. */
export function isNegatedMediaRequest(text: string): boolean {
  return negatedRequest.test(text.replace(/’/g, "'"));
}
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
        if (new RegExp(`^${mediaNoun}$`, 'i').test(clause)) return false;
        const desireMatch = clause.match(desire);
        const desired = desireMatch
          ? clause.slice(desireMatch[0].length)
          : null;
        return (
          imperative.test(clause) ||
          modal.test(clause) ||
          (desired !== null &&
            !informationVerb.test(desired) &&
            desiredFile.test(desired)) ||
          nounPlease.test(clause)
        );
      }),
  );
}
