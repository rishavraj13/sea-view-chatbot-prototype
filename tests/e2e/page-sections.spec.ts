import { test, expect } from '@playwright/test';
import {
  HEADER_UI,
  HERO_FACTS,
  HERO_IMAGE,
  HERO_UI,
  LOCATION_INFO,
  NAV_BREAKPOINT,
  PACKAGES,
  SITE_METADATA,
  PACKAGE_UI,
  STATEMENT_UI,
} from '../../src/content';

test.describe('Homepage layout and sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. renders skip link attached to DOM', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('2. renders header banner with viewport-aware navigation and action pill', async ({
    page,
  }, testInfo) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('link', { name: HEADER_UI.brand, exact: true }),
    ).toBeVisible();
    await expect(
      header.getByRole('link', { name: HEADER_UI.action, exact: true }),
    ).toBeVisible();
    const width = testInfo.project.use.viewport?.width;
    expect(width).toBeDefined();
    for (const link of HEADER_UI.links) {
      const item = header.getByRole('link', { name: link.label, exact: true });
      if (width! >= NAV_BREAKPOINT) {
        await expect(item).toBeVisible();
      } else {
        await expect(item).toBeHidden();
      }
    }
  });

  test('3. renders hero heading, echo word, from-price and watch link', async ({
    page,
  }) => {
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(hero).toBeVisible();
    const heroHeading = hero.getByRole('heading', { level: 1 });
    await expect(
      heroHeading.getByText('Sea View', { exact: true }),
    ).toBeVisible();
    await expect(heroHeading).toHaveText(SITE_METADATA.heroHeading);
    await expect(heroHeading.locator('span').last()).toHaveText(
      SITE_METADATA.echoWord,
    );
    const intro = page.getByRole('region', {
      name: HERO_UI.intro,
      exact: true,
    });
    await expect(
      intro.getByText(SITE_METADATA.fromPrice, { exact: true }),
    ).toHaveCount(1);
    await expect(
      intro.getByRole('link', { name: HERO_UI.watch, exact: true }),
    ).toHaveAttribute('href', SITE_METADATA.videoUrl);
  });

  test('4. renders key jump facts from content constants', async ({ page }) => {
    const main = page.getByRole('main');
    for (const fact of HERO_FACTS) {
      await expect(main.getByText(fact.value, { exact: true })).toBeVisible();
      await expect(main.getByText(fact.label, { exact: true })).toBeVisible();
    }
  });

  test('5. renders the portal photo in its stage', async ({ page }) => {
    const image = page.getByRole('img', { name: HERO_IMAGE.alt, exact: true });
    await expect(image).toBeAttached();
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((element) =>
        element instanceof HTMLImageElement ? element.naturalWidth : 0,
      ),
    ).toBeGreaterThan(0);
    await expect(page.locator('[data-hero-stage]')).toHaveCSS(
      'overflow-x',
      'clip',
    );
  });

  test('6. renders experience statement overview', async ({ page }) => {
    const statement = page.getByRole('region', {
      name: STATEMENT_UI.label,
      exact: true,
    });
    await expect(statement).toBeVisible();
    await expect(
      statement.getByRole('heading', {
        name: STATEMENT_UI.heading,
        exact: true,
      }),
    ).toBeVisible();
  });

  test('7. renders packages section with three packages and inclusions', async ({
    page,
  }) => {
    const packages = page.locator('#packages');
    await expect(packages).toBeVisible();
    for (const pkg of PACKAGES) {
      await expect(
        packages.getByRole('heading', { name: pkg.name, exact: true }),
      ).toBeVisible();
    }
    await expect(
      packages.getByText(PACKAGE_UI.inclusions, { exact: true }),
    ).toBeVisible();
  });

  test('8. renders the plan section with 5 steps heading', async ({ page }) => {
    const plan = page.locator('#plan');
    await expect(plan).toBeVisible();
    await expect(
      plan.getByText('Five steps, from check-in to landing', { exact: true }),
    ).toBeVisible();
  });

  test('9. renders good to know FAQ accordion', async ({ page }) => {
    const faq = page.locator('#faq');
    await expect(faq).toBeVisible();
    await expect(
      faq.getByRole('heading', { name: 'Good to know', exact: true }),
    ).toBeVisible();
  });

  test('10. renders location and operator from content constants', async ({
    page,
  }) => {
    const whereAndWho = page.locator(
      'section[aria-labelledby="location-heading"]',
    );
    await expect(whereAndWho).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.title, { exact: true }),
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.spot, { exact: true }),
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.address, { exact: true }),
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.operatorTitle, { exact: true }),
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.operator, { exact: true }),
    ).toBeVisible();
  });

  test('11. renders dark footer with assignment notice and credits', async ({
    page,
  }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(
      footer.getByText('Assignment prototype. No real bookings or payments.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      footer.getByText('Photography and content © Greedy Adventures', {
        exact: true,
      }),
    ).toBeVisible();
  });

  test('12. has no horizontal scroll and reveals the retained plan photos', async ({
    page,
  }) => {
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    for (const image of await page.locator('#plan img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty('complete', true);
      await image.evaluate(async (element) => {
        if (element instanceof HTMLImageElement) await element.decode();
      });
      expect(
        await image.evaluate((element) =>
          element instanceof HTMLImageElement ? element.naturalWidth : 0,
        ),
      ).toBeGreaterThan(0);
      await expect(image.locator('..')).toHaveClass(/isRevealed/);
      await expect(image.locator('..')).toHaveCSS('clip-path', 'inset(0px)');
    }
  });
});
