import { expect, test } from '@playwright/test';
import { PLAN_STEPS, stepLabel } from '../../src/content';

async function revealPhotos(page: import('@playwright/test').Page) {
  for (const image of await page.locator('#plan img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (element) => {
      if (element instanceof HTMLImageElement) await element.decode();
    });
    const reveal = image.locator('..');
    await expect(reveal).toHaveClass(/isRevealed/);
    await expect(reveal).toHaveCSS('clip-path', 'inset(0px)');
    expect(
      await image.evaluate(
        (element) =>
          element instanceof HTMLImageElement && element.naturalWidth > 0,
      ),
    ).toBe(true);
  }
}

test('five ordered cards, responsive stagger, reveal-once photos and viewport capture', async ({
  page,
}) => {
  await page.goto('/');
  const list = page.locator('#plan ol');
  const cards = list.locator(':scope > li');
  await expect(cards).toHaveCount(5);
  for (const [index, step] of PLAN_STEPS.entries()) {
    await expect(
      cards.nth(index).getByRole('heading', { level: 3 }),
    ).toHaveText(step.title);
    await expect(
      cards.nth(index).getByText(stepLabel(step.stepNumber), { exact: true }),
    ).toBeVisible();
    await expect(cards.nth(index)).not.toHaveAttribute('tabindex');
  }
  await expect(cards.first().locator('img')).toHaveCount(0);
  await expect(cards.locator('a,button,input,[tabindex]')).toHaveCount(0);
  await revealPhotos(page);
  await page.locator('#plan').evaluate((element) => {
    const header = parseFloat(
      getComputedStyle(element).getPropertyValue('--header-h'),
    );
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - header,
      behavior: 'instant',
    });
  });
  const boxes = await cards.evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        z: Number(getComputedStyle(item).zIndex),
      };
    }),
  );
  const width = page.viewportSize()!.width;
  if (width >= 1024) {
    expect(boxes[1]!.y - boxes[0]!.y).toBeCloseTo(56, 0);
    expect(boxes[0]!.right - boxes[1]!.x).toBeCloseTo(24, 0);
    expect(boxes[1]!.right - boxes[2]!.x).toBeCloseTo(24, 0);
    for (const index of [0, 1]) {
      const caption = await cards
        .nth(index)
        .getByText(PLAN_STEPS[index]!.description, { exact: true })
        .boundingBox();
      const next = await cards
        .nth(index + 1)
        .locator('[data-plan-surface]')
        .boundingBox();
      expect(caption!.x + caption!.width).toBeLessThan(next!.x);
    }
    for (let index = 1; index < 5; index++)
      expect(boxes[index]!.z).toBeGreaterThan(boxes[index - 1]!.z);
  } else if (width >= 768) {
    expect(boxes[1]!.y - boxes[0]!.y).toBeCloseTo(32, 0);
    expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.right);
    expect(boxes[2]!.x).toBe(boxes[0]!.x);
  } else {
    for (let index = 1; index < 5; index++) {
      expect(boxes[index]!.x).toBe(boxes[0]!.x);
      expect(boxes[index]!.y - boxes[index - 1]!.bottom).toBeCloseTo(16, 0);
    }
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
  await expect(page.locator('#plan img').locator('..').first()).toHaveClass(
    /isRevealed/,
  );
  await page.screenshot({
    path: `docs/screenshots/plan-${width}.png`,
    scale: 'css',
  });
});

test('card drift follows passage position, hover lift is decorative, reduced motion stops both', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const card = page.locator('[data-plan-card="2"]');
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      card.evaluate((element) => Number(element.style.getPropertyValue('--p'))),
    )
    .toBeGreaterThan(0);
  const value = await card.evaluate((element) => {
    const p = Number(element.style.getPropertyValue('--p'));
    const amplitude = parseFloat(
      getComputedStyle(element).getPropertyValue('--drift'),
    );
    const drift = element.querySelector('[data-plan-drift]')!;
    return {
      expected: (0.5 - p) * amplitude,
      actual: new DOMMatrixReadOnly(getComputedStyle(drift).transform).m42,
    };
  });
  expect(value.actual).toBeCloseTo(value.expected, 2);
  if (!isMobile) {
    await card.hover();
    await expect
      .poll(() =>
        card
          .locator('[data-plan-surface]')
          .evaluate(
            (element) =>
              new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
          ),
      )
      .toBeCloseTo(-6, 1);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card.locator('[data-plan-drift]')).toHaveCSS(
    'transform',
    'none',
  );
  await expect
    .poll(() =>
      card.evaluate((element) => element.style.getPropertyValue('--p')),
    )
    .toBe('');
  if (!isMobile) {
    await card.hover();
    await expect(card.locator('[data-plan-surface]')).toHaveCSS(
      'transform',
      'none',
    );
  }
});
