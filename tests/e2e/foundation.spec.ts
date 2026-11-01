import { expect, test } from '@playwright/test';
import { HEADER_UI, NAV_BREAKPOINT, PLAN_STEPS } from '../../src/content';

test('header fits at 768px and changes link visibility at 767px', async ({
  page,
}) => {
  await page.goto('/');
  const header = page.getByRole('banner');
  for (const width of [NAV_BREAKPOINT, NAV_BREAKPOINT - 1]) {
    await page.setViewportSize({ width, height: 1024 });
    await expect(
      header.getByRole('link', { name: HEADER_UI.action, exact: true }),
    ).toBeVisible();
    for (const link of HEADER_UI.links) {
      const item = header.getByRole('link', { name: link.label, exact: true });
      if (width >= NAV_BREAKPOINT) await expect(item).toBeVisible();
      else await expect(item).toBeHidden();
    }
    const bounds = await header.evaluate((element) => ({
      scroll: element.scrollWidth,
      client: element.clientWidth,
      links: [...element.querySelectorAll('a')]
        .filter((link) => link.getClientRects().length)
        .map((link) => ({
          left: link.getBoundingClientRect().left,
          right: link.getBoundingClientRect().right,
        })),
    }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.client);
    for (const link of bounds.links) {
      expect(link.left).toBeGreaterThanOrEqual(0);
      expect(link.right).toBeLessThanOrEqual(width);
    }
  }
});

test('all retained plan photos have non-zero 4:3 frames', async ({ page }) => {
  await page.goto('/');
  for (const step of PLAN_STEPS.filter((step) => step.image)) {
    const image = page.getByRole('img', { name: step.image!.alt, exact: true });
    const frame = image.locator('xpath=ancestor::div[@data-plan-photo]');
    const box = await frame.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
    expect(box!.width / box!.height).toBeCloseTo(4 / 3, 2);
    const imageBox = await image.boundingBox();
    expect(imageBox!.width).toBeCloseTo(box!.width, 0);
    expect(imageBox!.height).toBeCloseTo(box!.height, 0);
  }
});

test('hero renders the bundled Familjen Grotesk platform font', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '#hero-heading span:last-child',
    });
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', {
      nodeId,
    });
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.isCustomFont).toBe(true);
      expect(font.familyName).toBe('Familjen Grotesk');
    }
  } finally {
    await session.detach();
  }
});
