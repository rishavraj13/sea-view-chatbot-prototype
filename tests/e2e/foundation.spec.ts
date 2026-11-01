import { expect, test } from '@playwright/test';

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
