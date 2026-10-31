import { expect, it } from 'vitest';
import {
  sources,
  retrieve,
  buildModelContext,
} from '../../../src/server/knowledge';
import { groundedAnswer } from '../../../src/server/chat';
import { GET } from '../../../src/app/api/knowledge/sources/route';

function inclusions(text: string): string[] {
  const lines = text.split('\n');
  return lines
    .slice(lines.indexOf('Included') + 1)
    .filter((line) => !line.includes('per person'));
}
it('public sources expose real-knowledge and mixed-media flags', async () => {
  const body = await GET().json();
  expect(body.isDemo).toBe(false);
  expect(
    body.sources.every((s: { isDemo: boolean }) => s.isDemo === false),
  ).toBe(true);
  expect(
    body.media.find((m: { id: string }) => m.id === 'brochure').isDemo,
  ).toBe(true);
  expect(body.media.find((m: { id: string }) => m.id === 'video').isDemo).toBe(
    false,
  );
});
it('loads only real dated sections of the two authorized pages', () => {
  expect(sources).toHaveLength(18);
  for (const source of sources) {
    expect(source.isDemo).toBe(false);
    expect(source.capturedAt).toBe('2026-10-31');
    expect(new URL(source.url).hostname).toBe('www.greedyadventures.com');
    expect(source.text).not.toContain('DEMO CONTENT:');
  }
});
it('preserves package taglines and the identical actual inclusion lists', () => {
  const packages = ['ECO', 'DELUXE', 'VIP'].map((title) =>
    sources.find((s) => s.title === title)!,
  );
  const expected = [
    'Tandem skydive experience in Pattaya, Thailand',
    'Safety briefing and tandem instructor support',
    'Aircraft ascent and ocean-view jump experience',
    'Certificate of completion',
  ];
  expect(packages.map((p) => inclusions(p.text))).toEqual([
    expected,
    expected,
    expected,
  ]);
  expect(
    inclusions(sources.find((s) => s.title === "What's included")!.text),
  ).toEqual(expected);
  expect(packages[0]!.text).toContain('The jump, nothing else');
  expect(packages[1]!.text).toContain('Video and photos included');
  expect(packages[2]!.text).toContain('Personal cameraman and edited film');
});
it('contains no decorative icons, markup, image alt text or stray capture symbols in any source', () => {
  for (const source of sources) {
    expect(source.text, source.title).not.toMatch(
      /[+•●▪◦‣⁃\uFFFD\u200B-\u200D\uFEFF]/u,
    );
    expect(source.text, source.title).not.toMatch(
      /<[^>]+>|&(?:#\w+|\w+);|!\[|\b(?:alt|aria-label)\s*=|^\s*(?:Image:|\[Button:)|Included:/im,
    );
  }
});
it('ECO photos context reports the page wording without manufacturing a media entitlement', () => {
  const chunks = retrieve('Do I get photos with ECO?');
  expect(chunks[0]?.source.title).toBe('ECO');
  const source = chunks[0]!.source;
  const text = `ECO: "The jump, nothing else". Its listed inclusions are:\n${inclusions(source.text).join('\n')}\n[${source.url}]`;
  const accepted = groundedAnswer(text, chunks, []);
  expect(accepted).toContain('The jump, nothing else');
  expect(accepted).not.toMatch(/photos are (included|excluded)/i);
  expect(buildModelContext(chunks)).not.toContain('DEMO CONTENT:');
});
