import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CHAT_UI } from '../../src/content';

test.describe('Accessibility audit (axe-core)', () => {
  test('homepage has zero critical or serious a11y violations', async ({
    page,
  }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (severeViolations.length > 0) {
      console.error(
        'Severe A11y Violations (Home):',
        JSON.stringify(
          severeViolations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
          null,
          2,
        ),
      );
    }
    expect(severeViolations).toEqual([]);
  });

  test('knowledge route has zero critical or serious a11y violations', async ({
    page,
  }) => {
    await page.goto('/knowledge');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (severeViolations.length > 0) {
      console.error(
        'Severe A11y Violations (Knowledge):',
        JSON.stringify(
          severeViolations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
          null,
          2,
        ),
      );
    }
    expect(severeViolations).toEqual([]);
  });

  test('open chat dialog has zero critical or serious a11y violations', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: CHAT_UI.launcher, exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('dialog')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const severeViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (severeViolations.length > 0) {
      console.error(
        'Severe A11y Violations (Chat Dialog):',
        JSON.stringify(
          severeViolations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
          null,
          2,
        ),
      );
    }
    expect(severeViolations).toEqual([]);
  });
});
