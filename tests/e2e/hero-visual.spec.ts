import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { HERO_IMAGE } from '../../src/content';
import { positionHero } from './helpers/hero';
import { sampleHero } from './helpers/hero-pixels';

test('viewport captures, sampled title contrast and warm photo shift', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole('img', { name: HERO_IMAGE.alt, exact: true })
    .evaluate(async (element) => {
      if (element instanceof HTMLImageElement) await element.decode();
    });
  const width = page.viewportSize()!.width;
  const samples = [];
  for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
    await positionHero(page, fraction);
    const foreground = await page.screenshot({
      path: `docs/screenshots/hero-${width}-p${fraction}.png`,
      scale: 'css',
    });
    const background = await page.screenshot({
      scale: 'css',
      style: '#hero-heading {visibility:hidden !important;}',
    });
    const photo = await page.screenshot({
      path: `docs/examples/scroll-hero/photo-${width}-p${fraction}.png`,
      scale: 'css',
      style:
        '[data-hero-panel], [data-hero-dot], [data-hero-stage] > div:last-child {visibility:hidden !important;}',
    });
    const sampled = await sampleHero(page, foreground, background, photo);
    samples.push({ p: fraction, ...sampled });
  }
  await writeFile(
    `docs/examples/scroll-hero/measurements-${width}.json`,
    JSON.stringify(samples, null, 2) + '\n',
  );
  for (const sample of samples) {
    expect(sample.glyphPixels).toBeGreaterThan(30);
    expect(
      sample.minimumContrast,
      `contrast at p=${sample.p}`,
    ).toBeGreaterThanOrEqual(3);
  }
  const first = samples[0]!.photoMean,
    last = samples.at(-1)!.photoMean;
  expect(last[2]! - last[0]!).toBeLessThan(first[2]! - first[0]!);
});
