import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  CHAT_COPY,
  CHAT_UI,
  KNOWLEDGE_UI,
  PLAN_STEPS,
  ACCESSIBILITY_COPY,
  STARTER_PROMPTS,
  TRACE_UI,
} from '../../src/content';
import {
  checkFocus,
  checkHeadingOrder,
  walkTabOrder,
  tabTo,
} from './helpers/keyboard';

for (const path of ['/', '/knowledge']) {
  test(`keyboard-only order, focus, headings and accessible names: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    if (path === '/knowledge')
      await expect(
        page.getByRole('tab', { name: KNOWLEDGE_UI.tabSources, exact: true }),
      ).toContainText('18');
    const headings = await checkHeadingOrder(page);
    const order = await walkTabOrder(page);
    expect(order[0]?.text).toBe(ACCESSIBILITY_COPY.skip);
    expect(order.at(-1)?.text).toBe(CHAT_UI.launcher);
    if (path === '/') {
      expect(
        order.filter((item) => item.zone === 'packages').length,
      ).toBeGreaterThanOrEqual(3);
      for (const step of PLAN_STEPS)
        expect(headings.some((heading) => heading.text === step.title)).toBe(
          true,
        );
      for (const summary of await page.locator('#faq summary').all()) {
        await tabTo(page, summary);
        await page.keyboard.press('Enter');
        await expect(summary.locator('..')).toHaveAttribute('open', '');
        await page.keyboard.press('Enter');
        await expect(summary.locator('..')).not.toHaveAttribute('open', '');
      }
    }
    await tabTo(
      page,
      page.getByRole('button', { name: CHAT_UI.launcher, exact: true }),
    );
    await page.keyboard.press('Enter');
    await expect(
      page.getByLabel(CHAT_COPY.question, { exact: true }),
    ).toBeFocused();
    const count = await page
      .getByRole('dialog')
      .locator('button,textarea')
      .count();
    for (let index = 0; index < count + 2; index++) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => ({
        body: document.activeElement === document.body,
        inDialog: !!document.activeElement?.closest('dialog'),
      }));
      expect(focus.body || focus.inDialog).toBe(true);
      if (focus.inDialog) await checkFocus(page);
    }
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: CHAT_UI.launcher, exact: true }),
    ).toBeFocused();
    await writeFile(
      `docs/examples/release-readiness/keyboard-${path === '/' ? 'home' : 'knowledge'}-${page.viewportSize()!.width}.json`,
      JSON.stringify(
        {
          mode: 'mock',
          order,
          headings,
          nativeDialogChromeBoundary:
            'Body may be active at the browser-chrome Tab boundary; no background control receives focus.',
        },
        null,
        2,
      ) + '\n',
    );
    const scan = await new AxeBuilder({ page })
      .withRules(['label-content-name-mismatch', 'heading-order'])
      .analyze();
    expect(scan.violations).toEqual([]);
  });
}

test('Knowledge tabs and trace controls work using only the keyboard', async ({
  page,
}) => {
  await page.goto('/knowledge');
  const sources = page.getByRole('tab', {
    name: KNOWLEDGE_UI.tabSources,
    exact: true,
  });
  await tabTo(page, sources);
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: KNOWLEDGE_UI.tabMedia, exact: true }),
  ).toBeFocused();
  await checkFocus(page);
  await checkHeadingOrder(page);
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: KNOWLEDGE_UI.tabTrace, exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('tabpanel', { name: KNOWLEDGE_UI.tabTrace }),
  ).toBeFocused();
  await checkFocus(page);
  await checkHeadingOrder(page);
  await page.keyboard.press('Tab');
  await expect(
    page
      .getByRole('tabpanel', { name: KNOWLEDGE_UI.tabTrace })
      .getByRole('button')
      .first(),
  ).toBeFocused();
  await checkFocus(page);
});

test('Knowledge test question is submitted and inspected with keyboard controls', async ({
  page,
}) => {
  await page.goto('/knowledge');
  await tabTo(
    page,
    page.getByRole('tab', { name: KNOWLEDGE_UI.tabSources, exact: true }),
  );
  await page.keyboard.press('End');
  const question = page.getByLabel(TRACE_UI.question, { exact: true });
  await tabTo(page, question);
  await checkFocus(page);
  await page.keyboard.type(STARTER_PROMPTS[0]);
  const run = page.getByRole('button', {
    name: KNOWLEDGE_UI.runTraceButton,
    exact: true,
  });
  await tabTo(page, run);
  await checkFocus(page);
  await page.keyboard.press('Enter');
  await expect(page.getByText(TRACE_UI.output, { exact: true })).toBeVisible();
  await checkHeadingOrder(page);
});
