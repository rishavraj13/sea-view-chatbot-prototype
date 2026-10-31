const marker = '\uE000';
const label =
  '(?:cites?|citations?|sources?|references?|refs?|see|read more|learn more|more info(?:rmation)?|further reading)';

/** Removes only labels attached to citation markers, preserving labels elsewhere in factual prose. */
export function stripCitationPresentation(text: string): string {
  for (let i = 0; i < 3; i++) {
    text = text
      .replace(new RegExp(`\\b${label}\\s*:?[ \\t]*${marker}`, 'gi'), marker)
      .replace(
        new RegExp(`\\(\\s*${label}\\s*:?[ \\t]*\\)\\s*${marker}`, 'gi'),
        marker,
      )
      .replace(new RegExp(`${marker}\\s*\\(\\s*${label}\\s*\\)`, 'gi'), marker)
      .replace(new RegExp(`[\\[(<]\\s*${marker}\\s*[\\])>]`, 'g'), marker);
  }
  return text
    .replace(new RegExp(`[ \\t]*${marker}[ \\t]*`, 'g'), ' ')
    .replace(/\[\s*\]|\(\s*\)|<\s*>/g, '')
    .replace(/[ \t]+([.,;!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .replace(/[,;:]+$/, '')
    .replace(/([.!?])[.,;:!?]+$/, '$1')
    .trim();
}

/** Internal placeholder inserted only where a URL has been removed from guarded text. */
export const CITATION_MARKER = marker;
