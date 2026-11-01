import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  retryLabel,
  STARTER_PROMPTS,
  TRACE_UI,
} from '../../src/content';
import { errors, openKnowledge, runTrace } from './helpers/knowledge';

async function checkAxe(page: Parameters<typeof openKnowledge>[0]) {
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    scan.violations.filter(
      (item) => item.impact === 'critical' || item.impact === 'serious',
    ),
  ).toEqual([]);
}
test('viewport captures and axe for Sources, Media, trace result and 429 countdown', async ({
  page,
}) => {
  const width = page.viewportSize()!.width;
  const sources = await openKnowledge(page);
  await expect(sources.getByRole('article')).toHaveCount(18);
  await page.screenshot({
    path: `docs/screenshots/knowledge-sources-${width}.png`,
    scale: 'css',
  });
  await checkAxe(page);
  await page
    .getByRole('tab', { name: KNOWLEDGE_UI.tabMedia, exact: true })
    .click();
  await expect(
    page
      .getByRole('tabpanel', { name: KNOWLEDGE_UI.tabMedia, exact: true })
      .getByRole('article'),
  ).toHaveCount(3);
  await page.screenshot({
    path: `docs/screenshots/knowledge-media-${width}.png`,
    scale: 'css',
  });
  await checkAxe(page);
  await page
    .getByRole('tab', { name: KNOWLEDGE_UI.tabTrace, exact: true })
    .click();
  await checkAxe(page);
  const { panel, result } = await runTrace(page, STARTER_PROMPTS[1]);
  await result
    .getByRole('heading', { name: KNOWLEDGE_COPY.tools, exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/screenshots/knowledge-trace-${width}.png`,
    scale: 'css',
  });
  await checkAxe(page);
  await page.clock.install();
  const failure = errors.find((capture) => capture.name === 'rate-present')!;
  await page.route('**/api/knowledge/trace', (route) =>
    route.fulfill({
      status: failure.status,
      contentType: 'application/json',
      body: JSON.stringify(failure.body),
    }),
  );
  await panel
    .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton, exact: true })
    .click();
  const alert = panel.getByRole('alert');
  await expect(
    alert.getByRole('button', { name: retryLabel(12), exact: true }),
  ).toBeDisabled();
  await alert.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/screenshots/knowledge-rate-limit-${width}.png`,
    scale: 'css',
  });
  await checkAxe(page);
});

test('Run trace is disabled while a request is pending', async ({ page }) => {
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reached: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    reached = resolve;
  });
  await page.route('**/api/knowledge/trace', async (route) => {
    const response = await route.fetch();
    reached?.();
    await held;
    await route.fulfill({ response });
  });
  const panel = await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  await panel
    .getByLabel(TRACE_UI.question, { exact: true })
    .fill(STARTER_PROMPTS[0]);
  await panel
    .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton, exact: true })
    .click();
  await pending;
  await expect(
    panel.getByRole('button', {
      name: KNOWLEDGE_UI.runningTraceButton,
      exact: true,
    }),
  ).toBeDisabled();
  release?.();
  await page.unrouteAll({ behavior: 'wait' });
  await expect(
    panel.getByRole('button', {
      name: KNOWLEDGE_UI.runTraceButton,
      exact: true,
    }),
  ).toBeEnabled();
});
