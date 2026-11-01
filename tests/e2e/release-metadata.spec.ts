import { expect, test } from '@playwright/test';
import {
  KNOWLEDGE_UI,
  KNOWLEDGE_METADATA,
  SITE_METADATA,
} from '../../src/content';
import { checkFocus, checkHeadingOrder } from './helpers/keyboard';

for (const path of ['/', '/knowledge']) {
  test(`skip link, reduced motion, increased contrast and metadata: ${path}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', contrast: 'more' });
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await checkFocus(page);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    await expect(page).toHaveTitle(
      path === '/' ? SITE_METADATA.title : KNOWLEDGE_METADATA.title,
    );
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBe(
      path === '/' ? SITE_METADATA.description : KNOWLEDGE_UI.subtitle,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
    if (path === '/')
      await expect(page.locator('[data-hero-stage]')).toHaveCSS(
        'position',
        'relative',
      );
    await checkHeadingOrder(page);
  });
}
