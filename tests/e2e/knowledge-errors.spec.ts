import { test, expect } from '@playwright/test';
import {
  CHAT_COPY,
  ERROR_MESSAGES,
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  retryLabel,
  STARTER_PROMPTS,
  TRACE_UI,
} from '../../src/content';
import { errors, openKnowledge } from './helpers/knowledge';

for (const endpoint of ['sources', 'trace'] as const) {
  for (const capture of errors) {
    test(`${endpoint}: ${capture.name} uses product copy, countdown and Retry`, async ({
      page,
    }) => {
      await page.clock.install();
      let calls = 0;
      const bodies: unknown[] = [];
      await page.route(`**/api/knowledge/${endpoint}`, async (route) => {
        calls++;
        if (endpoint === 'trace') bodies.push(route.request().postDataJSON());
        if (calls === 1)
          await route.fulfill({
            status: capture.status,
            contentType: 'application/json',
            body: JSON.stringify(capture.body),
          });
        else await route.continue();
      });
      const panel = await openKnowledge(
        page,
        endpoint === 'trace' ? KNOWLEDGE_UI.tabTrace : KNOWLEDGE_UI.tabSources,
      );
      if (endpoint === 'trace') {
        await panel
          .getByLabel(TRACE_UI.question, { exact: true })
          .fill(STARTER_PROMPTS[0]);
        await panel
          .getByRole('button', {
            name: KNOWLEDGE_UI.runTraceButton,
            exact: true,
          })
          .click();
      }
      const alert = panel.getByRole('alert');
      await expect(alert).toContainText(
        ERROR_MESSAGES[capture.body.error.code],
      );
      await expect(alert).not.toContainText(capture.body.error.message);
      const delay = capture.body.error.retryAfterSeconds;
      if (delay) {
        await expect(
          alert.getByRole('button', { name: retryLabel(delay), exact: true }),
        ).toBeDisabled();
        await page.clock.fastForward((delay - 1) * 1000);
        await expect(
          alert.getByRole('button', { name: retryLabel(1), exact: true }),
        ).toBeDisabled();
        await page.clock.fastForward(1000);
      }
      await expect(
        alert.getByRole('button', { name: CHAT_COPY.retry, exact: true }),
      ).toBeEnabled();
      await alert
        .getByRole('button', { name: CHAT_COPY.retry, exact: true })
        .click();
      await expect(alert).toBeHidden();
      if (endpoint === 'sources')
        await expect(panel.getByRole('article')).toHaveCount(18);
      else {
        await expect(
          panel.getByRole('region', {
            name: KNOWLEDGE_COPY.resultRegion,
            exact: true,
          }),
        ).toBeVisible();
        expect(bodies).toHaveLength(2);
        expect(bodies[1]).toEqual(bodies[0]);
      }
    });
  }
}

test('malformed JSON shapes show generic errors and recover on both endpoints', async ({
  page,
}) => {
  let catalog = 0;
  let trace = 0;
  await page.route('**/api/knowledge/sources', async (route) => {
    if (++catalog === 1)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ untrusted: 'NEVER_SHOW_THIS_OBJECT' }),
      });
    else await route.continue();
  });
  const panel = await openKnowledge(page);
  await expect(panel.getByRole('alert')).toContainText(ERROR_MESSAGES.UNKNOWN);
  await expect(panel).not.toContainText('NEVER_SHOW_THIS_OBJECT');
  await panel
    .getByRole('button', { name: CHAT_COPY.retry, exact: true })
    .click();
  await expect(panel.getByRole('article')).toHaveCount(18);
  await page
    .getByRole('tab', { name: KNOWLEDGE_UI.tabTrace, exact: true })
    .click();
  const tracePanel = page.getByRole('tabpanel', {
    name: KNOWLEDGE_UI.tabTrace,
    exact: true,
  });
  await page.route('**/api/knowledge/trace', async (route) => {
    if (++trace === 1)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ toolCalls: 'NEVER_SHOW_THIS_OBJECT' }),
      });
    else await route.continue();
  });
  await tracePanel
    .getByLabel(TRACE_UI.question, { exact: true })
    .fill(STARTER_PROMPTS[0]);
  await tracePanel
    .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton, exact: true })
    .click();
  await expect(tracePanel.getByRole('alert')).toContainText(
    ERROR_MESSAGES.UNKNOWN,
  );
  await expect(tracePanel).not.toContainText('NEVER_SHOW_THIS_OBJECT');
  await tracePanel
    .getByRole('button', { name: CHAT_COPY.retry, exact: true })
    .click();
  await expect(
    tracePanel.getByRole('region', {
      name: KNOWLEDGE_COPY.resultRegion,
      exact: true,
    }),
  ).toBeVisible();
});

test('empty catalog has explicit source and media empty states', async ({
  page,
}) => {
  await page.route('**/api/knowledge/sources', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ isDemo: false, sources: [], media: [] }),
    }),
  );
  const panel = await openKnowledge(page);
  await expect(
    panel.getByText(KNOWLEDGE_COPY.sourcesEmpty, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('tab', { name: KNOWLEDGE_UI.tabMedia, exact: true })
    .click();
  await expect(
    page
      .getByRole('tabpanel', { name: KNOWLEDGE_UI.tabMedia, exact: true })
      .getByText(KNOWLEDGE_COPY.mediaEmpty, { exact: true }),
  ).toBeVisible();
});
