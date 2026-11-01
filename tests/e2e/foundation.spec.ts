import { expect, test } from '@playwright/test';
import { PLAN_STEPS } from '../../src/content';

test('Step 5 photo is a non-zero square at the project viewport', async ({ page }) => {
  await page.goto('/');
  const landingImage = PLAN_STEPS.find((step) => step.stepNumber === 5)?.image;
  expect(landingImage).toBeDefined();
  const circle = page.getByRole('img', { name: landingImage!.alt, exact: true })
    .locator('xpath=ancestor::div[contains(@class, "step5Circle")]');
  const box = await circle.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
  expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
});

test('hero renders the bundled Familjen Grotesk platform font', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '#hero-heading .echo-word',
    });
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font.isCustomFont).toBe(true);
      expect(font.familyName).toBe('Familjen Grotesk');
    }
  } finally {
    await session.detach();
  }
});
