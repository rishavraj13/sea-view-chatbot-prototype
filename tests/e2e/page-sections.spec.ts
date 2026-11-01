import { test, expect } from '@playwright/test';
import {
  HERO_FACTS,
  LOCATION_INFO,
  NAV_BREAKPOINT,
  PACKAGES,
  SITE_METADATA,
} from '../../src/content';

test.describe('Homepage layout and sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. renders skip link attached to DOM', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('2. renders header banner with navigation links and action pill', async ({
    page,
  }) => {
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('link', { name: 'Greedy Adventures', exact: true })
    ).toBeVisible();
    await expect(
      header.getByRole('link', { name: 'Choose package', exact: true })
    ).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;
    if (width >= NAV_BREAKPOINT) {
      await expect(
        header.getByRole('link', { name: 'Packages', exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole('link', { name: 'The plan', exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole('link', { name: 'Good to know', exact: true })
      ).toBeVisible();
      await expect(
        header.getByRole('link', { name: 'Knowledge', exact: true })
      ).toBeVisible();
    } else {
      await expect(
        header.getByRole('link', { name: 'Packages', exact: true })
      ).not.toBeVisible();
      await expect(
        header.getByRole('link', { name: 'The plan', exact: true })
      ).not.toBeVisible();
      await expect(
        header.getByRole('link', { name: 'Good to know', exact: true })
      ).not.toBeVisible();
      await expect(
        header.getByRole('link', { name: 'Knowledge', exact: true })
      ).not.toBeVisible();
    }
  });

  test('3. renders hero heading, echo word, from-price and watch link', async ({
    page,
  }) => {
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    await expect(hero).toBeVisible();
    const heroHeading = hero.getByRole('heading', { level: 1 });
    await expect(heroHeading.getByText('Sea View', { exact: true })).toBeVisible();
    await expect(heroHeading.locator('.echo-word')).toHaveText(SITE_METADATA.echoWord);
    await expect(hero.getByText(SITE_METADATA.fromPrice, { exact: true })).toBeVisible();
    await expect(
      hero.getByRole('link', { name: 'Watch the jump', exact: true })
    ).toBeVisible();
  });

  test('4. renders key jump facts from content constants', async ({ page }) => {
    const main = page.getByRole('main');
    for (const fact of HERO_FACTS) {
      await expect(main.getByText(fact.value, { exact: true })).toBeVisible();
      await expect(main.getByText(fact.label, { exact: true })).toBeVisible();
    }
  });

  test('5. renders hero photo band', async ({ page }) => {
    const photoBand = page.locator(
      'img[alt="Tandem skydivers freefalling in open skies above the coastline"]'
    );
    await expect(photoBand).toBeAttached();
  });

  test('6. renders experience statement overview', async ({ page }) => {
    const statement = page.locator('section[aria-label="Experience overview"]');
    await expect(statement).toBeVisible();
    await expect(
      statement.getByText('The same jump in every package.', { exact: false })
    ).toBeVisible();
  });

  test('7. renders packages section with three packages and inclusions', async ({
    page,
  }) => {
    const packages = page.locator('#packages');
    await expect(packages).toBeVisible();
    for (const pkg of PACKAGES) {
      await expect(
        packages.getByRole('heading', { name: pkg.name, exact: true })
      ).toBeVisible();
    }
    await expect(
      packages.getByText('Included in every package:', { exact: true })
    ).toBeVisible();
  });

  test('8. renders the plan section with 5 steps heading', async ({ page }) => {
    const plan = page.locator('#plan');
    await expect(plan).toBeVisible();
    await expect(
      plan.getByText('Five steps, from check-in to landing', { exact: true })
    ).toBeVisible();
  });

  test('9. renders good to know FAQ accordion', async ({ page }) => {
    const faq = page.locator('#faq');
    await expect(faq).toBeVisible();
    await expect(
      faq.getByRole('heading', { name: 'Good to know', exact: true })
    ).toBeVisible();
  });

  test('10. renders location and operator from content constants', async ({
    page,
  }) => {
    const whereAndWho = page.locator(
      'section[aria-labelledby="location-heading"]'
    );
    await expect(whereAndWho).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.title, { exact: true })
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.spot, { exact: true })
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.address, { exact: true })
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.operatorTitle, { exact: true })
    ).toBeVisible();
    await expect(
      whereAndWho.getByText(LOCATION_INFO.operator, { exact: true })
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
      })
    ).toBeVisible();
    await expect(
      footer.getByText('Photography and content © Greedy Adventures', {
        exact: true,
      })
    ).toBeVisible();
  });

  test('12. has no horizontal scroll and captures responsive screenshot', async ({
    page,
  }) => {
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    const viewport = page.viewportSize();
    if (viewport) {
      await page.screenshot({
        path: `docs/screenshots/home-${viewport.width}.png`,
        fullPage: true,
      });
    }
  });
});
