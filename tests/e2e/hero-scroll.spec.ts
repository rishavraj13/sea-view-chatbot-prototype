import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HERO_IMAGE, SITE_METADATA } from '../../src/content';
import { heroState, positionHero } from './helpers/hero';

test('portal endpoints, midpoint, title bounds and reverse scrolling', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: SITE_METADATA.heroHeading,
      exact: true,
    }),
  ).toHaveCount(1);
  await positionHero(page, 0);
  const start = await heroState(page);
  const width = page.viewportSize()!.width;
  expect(start.panels[0]!.right).toBeCloseTo(width / 2, 0);
  expect(start.panels[1]!.x).toBeCloseTo(width / 2, 0);
  expect(start.photoScale).toBeCloseTo(1.08, 2);
  expect(start.tracking / start.font).toBeCloseTo(-0.04, 3);
  expect(start.overlay).toEqual([0, 0]);
  for (const dot of start.dots) {
    expect(dot.x + 5).toBeCloseTo(width / 2, 0);
    expect(dot.y + 5).toBeCloseTo(start.stage.y + start.stage.height / 2, 0);
  }
  await positionHero(page, 0.5);
  const middle = await heroState(page);
  await positionHero(page, 1);
  const end = await heroState(page);
  expect(end.panels[0]!.right).toBeLessThanOrEqual(1);
  expect(end.panels[1]!.x).toBeGreaterThanOrEqual(width - 1);
  expect(end.titleScale).toBeCloseTo(1.1, 2);
  expect(end.tracking / end.font).toBeCloseTo(-0.08, 3);
  expect(end.photoScale).toBeCloseTo(1, 2);
  for (const opacity of end.overlay) {
    expect(opacity).toBeGreaterThanOrEqual(0.25);
    expect(opacity).toBeLessThanOrEqual(0.4);
  }
  expect(end.words[0]!.x).toBeLessThan(start.words[0]!.x);
  expect(end.words[1]!.right).toBeGreaterThan(start.words[1]!.right);
  expect(end.dots[0]!.x + 5).toBeCloseTo(width * 0.06, 0);
  expect(end.dots[1]!.x + 5).toBeCloseTo(width * 0.94, 0);
  expect(end.dots[0]!.y + 5).toBeCloseTo(
    end.stage.y + end.stage.height * 0.06,
    0,
  );
  expect(end.dots[1]!.y + 5).toBeCloseTo(
    end.stage.y + end.stage.height * 0.94,
    0,
  );
  expect(middle.photoScale).toBeGreaterThan(end.photoScale);
  expect(middle.photoScale).toBeLessThan(start.photoScale);
  expect(middle.titleScale).toBeGreaterThan(start.titleScale);
  expect(middle.titleScale).toBeLessThan(end.titleScale);
  expect(middle.tracking).toBeLessThan(start.tracking);
  expect(middle.tracking).toBeGreaterThan(end.tracking);
  expect(middle.panels[0]!.right).toBeGreaterThan(end.panels[0]!.right);
  expect(middle.panels[0]!.right).toBeLessThan(start.panels[0]!.right);
  expect(middle.dots[0]!.x).toBeGreaterThan(end.dots[0]!.x);
  expect(middle.dots[0]!.x).toBeLessThan(start.dots[0]!.x);
  expect(middle.overlay[0]).toBeGreaterThan(0);
  expect(middle.overlay[0]).toBeLessThan(end.overlay[0]!);
  expect(middle.kicker).toBe(0);
  for (const state of [start, middle, end]) {
    for (const word of state.words) {
      expect(word.x).toBeGreaterThanOrEqual(0);
      expect(word.right).toBeLessThanOrEqual(width);
    }
    expect(state.title.y).toBeGreaterThan(state.stage.y);
    expect(state.title.x).toBeGreaterThanOrEqual(0);
    expect(state.title.right).toBeLessThanOrEqual(width);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  await positionHero(page, 0);
  expect(await heroState(page)).toEqual(start);
});

test('reduced motion: static visible photo, no pinning, panels/dots or scroll updates', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('[data-scroll-hero]');
  const stage = page.locator('[data-hero-stage]');
  await expect(stage).toHaveCSS('position', 'relative');
  for (const panel of await page
    .locator('[data-hero-panel],[data-hero-dot]')
    .all())
    await expect(panel).toBeHidden();
  await expect(
    page.getByRole('img', { name: HERO_IMAGE.alt, exact: true }),
  ).toBeVisible();
  const before = await heroState(page);
  expect(before.p).toBe(1);
  expect((await hero.boundingBox())!.height).toBeCloseTo(
    before.stage.height,
    0,
  );
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  expect(
    await hero.evaluate((element) => element.style.getPropertyValue('--p')),
  ).toBe('');
  expect((await heroState(page)).photoScale).toBe(1);
});

test('axe at closed/open portal and no serious or critical violations', async ({
  page,
}) => {
  await page.goto('/');
  for (const fraction of [0, 1]) {
    await positionHero(page, fraction);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.filter(
        (issue) => issue.impact === 'serious' || issue.impact === 'critical',
      ),
    ).toEqual([]);
  }
});
