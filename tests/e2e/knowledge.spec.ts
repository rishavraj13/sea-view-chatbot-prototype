import { test, expect } from '@playwright/test';
import { KNOWLEDGE_UI, STARTER_PROMPTS } from '../../src/content';

test.describe('Knowledge transparency route (/knowledge)', () => {
  test('renders header, navigation and captures screenshots', async ({
    page,
  }) => {
    await page.goto('/knowledge');

    // Header & title
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(
      header.getByRole('link', { name: KNOWLEDGE_UI.backLink, exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 1, name: KNOWLEDGE_UI.title, exact: true })
    ).toBeVisible();

    // Tabs
    const tabsList = page.getByRole('tablist');
    await expect(tabsList).toBeVisible();
    await expect(
      page.getByRole('tab', { name: KNOWLEDGE_UI.tabSources, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: KNOWLEDGE_UI.tabMedia, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: KNOWLEDGE_UI.tabTrace, exact: true })
    ).toBeVisible();

    // Responsive screenshot
    const viewport = page.viewportSize();
    if (viewport) {
      await page.screenshot({
        path: `docs/screenshots/knowledge-${viewport.width}.png`,
        fullPage: true,
      });
    }
  });

  test('sources tab displays verified sources, capture dates and expandable text', async ({
    page,
  }) => {
    await page.goto('/knowledge');
    await page.getByRole('tab', { name: KNOWLEDGE_UI.tabSources, exact: true }).click();

    const main = page.getByRole('main');
    // Verify source items loaded from real /api/knowledge/sources
    const sourceLinks = main.locator('a[target="_blank"]');
    await expect(sourceLinks.first()).toBeVisible({ timeout: 10000 });

    // Verify capture date
    await expect(
      main.getByText('Captured: 2026-10-31', { exact: true }).first()
    ).toBeVisible();

    // Expand details
    const details = main.locator('details').first();
    await expect(details).toBeVisible();
    await details.locator('summary').click();
    await expect(details.locator('pre')).toBeVisible();
  });

  test('media tab displays PDF and video assets with availability badges', async ({
    page,
  }) => {
    await page.goto('/knowledge');
    await page.getByRole('tab', { name: KNOWLEDGE_UI.tabMedia, exact: true }).click();

    const main = page.getByRole('main');
    // Check PDF brochure card
    await expect(
      main.getByText('Sea View Skydiving Pattaya — Experience Brochure', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(
      main.getByText('Demo Material', { exact: true }).first()
    ).toBeVisible();

    // Check video card
    await expect(
      main.getByText('Sea View Skydiving — Official Dropzone Video', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      main.getByText('Official', { exact: true }).first()
    ).toBeVisible();
  });

  test('trace tab runs question through real pipeline and renders ordered sections 1-6', async ({
    page,
  }) => {
    await page.goto('/knowledge');
    await page.getByRole('tab', { name: KNOWLEDGE_UI.tabTrace, exact: true }).click();

    const main = page.getByRole('main');

    // Click preset
    const preset = main.getByRole('button', {
      name: STARTER_PROMPTS[0],
      exact: true,
    });
    await expect(preset).toBeVisible();
    await preset.click();

    // Verify textarea populated
    const textarea = main.locator('#trace-question');
    await expect(textarea).toHaveValue(STARTER_PROMPTS[0]);

    // Run trace
    const runButton = main.getByRole('button', {
      name: KNOWLEDGE_UI.runTraceButton,
      exact: true,
    });
    await runButton.click();

    // Wait for trace results
    await expect(
      main.getByText('Output from the real pipeline', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    // Verify ordered sections 1 to 6
    await expect(
      main.getByText('1. Model Context', { exact: true })
    ).toBeVisible();
    await expect(
      main.getByText('2. Retrieved Chunks', { exact: true })
    ).toBeVisible();
    await expect(
      main.getByText('3. Attributed Sources', { exact: true })
    ).toBeVisible();
    await expect(main.getByText('4. Tool Calls', { exact: true })).toBeVisible();
    await expect(
      main.getByText('5. Generated Media', { exact: true })
    ).toBeVisible();
    await expect(
      main.getByText('6. Final Answer', { exact: true })
    ).toBeVisible();

    // Verify final answer contains answer section
    const finalAnswer = main.locator('section[aria-labelledby="section-answer"]');
    await expect(finalAnswer).toBeVisible();
  });
});
