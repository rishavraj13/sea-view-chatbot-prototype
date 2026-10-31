import { readFile } from 'node:fs/promises';
import PDFParser from 'pdf2json';
import { expect, it } from 'vitest';
import { sources } from '../../../src/server/knowledge';

it('the actual demo PDF contains exactly the source package names and prices, with clean inclusions', async () => {
  const buffer = await readFile(
    new URL('../../../public/demo/brochure.pdf', import.meta.url),
  );
  const parser = new PDFParser(null, true);
  const text = await new Promise<string>((resolve, reject) => {
    parser.on('pdfParser_dataError', reject);
    parser.on('pdfParser_dataReady', () => resolve(parser.getRawTextContent()));
    parser.parseBuffer(buffer, 0);
  }).finally(() => parser.destroy());
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const expected = sources
    .filter((source) => ['ECO', 'DELUXE', 'VIP'].includes(source.title))
    .map((source) => ({
      name: source.title,
      price: source.text.match(/฿[\d,]+ per person/u)?.[0],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const actual = lines
    .flatMap((line, index) => {
      if (!['ECO', 'DELUXE', 'VIP'].includes(line)) return [];
      const nextHeading = lines.findIndex(
        (next, nextIndex) =>
          nextIndex > index &&
          ['ECO', 'DELUXE', 'VIP', 'Source'].includes(next),
      );
      const prices = lines
        .slice(index + 1, nextHeading)
        .filter((row) => /฿[\d,]+ per person/u.test(row));
      expect(prices).toHaveLength(1);
      return [{ name: line, price: prices[0] }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  expect(expected).toHaveLength(3);
  expect(actual).toEqual(expected);
  expect(lines.filter((line) => line === 'Included')).toHaveLength(3);
  expect(text).toContain('DEMO MATERIAL');
  expect(text).not.toMatch(/[+•●▪◦‣⁃\uFFFD]|Included:/u);
});
