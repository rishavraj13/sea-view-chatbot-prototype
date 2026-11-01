import { test, expect } from '@playwright/test';
import captures from '../../docs/examples/chat-runtime/errors.json' with { type: 'json' };
import { errorEnvelopeSchema } from '../../src/components/chat/api-error';
import {
  CHAT_COPY,
  ERROR_MESSAGES,
  retryLabel,
  STARTER_PROMPTS,
} from '../../src/content';
import { openChat, sendQuestion, waitForReply } from './helpers/chat';

for (const capture of captures.captures) {
  test(`${capture.name}: inline product copy and correct Retry state`, async ({
    page,
  }) => {
    const body = errorEnvelopeSchema.parse(capture.body);
    await page.clock.install();
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: capture.status,
        contentType: 'application/json',
        body: JSON.stringify(capture.body),
      }),
    );
    const dialog = await openChat(page);
    await sendQuestion(page, STARTER_PROMPTS[0]);
    const alert = dialog.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(ERROR_MESSAGES[body.error.code]);
    await expect(alert).not.toContainText(body.error.message);
    const seconds =
      body.error.code === 'RATE_LIMIT'
        ? body.error.retryAfterSeconds
        : undefined;
    const retry = alert.getByRole('button', {
      name: retryLabel(seconds ?? 0),
      exact: true,
    });
    if (seconds) {
      await expect(retry).toBeDisabled();
      await page.clock.fastForward((seconds - 1) * 1000);
      await expect(
        alert.getByRole('button', { name: retryLabel(1), exact: true }),
      ).toBeDisabled();
      await page.clock.fastForward(1000);
    }
    await expect(
      alert.getByRole('button', { name: CHAT_COPY.retry, exact: true }),
    ).toBeEnabled();
  });
}

test('Retry reloads the failed turn with no duplicated user message', async ({
  page,
}) => {
  const bodies: unknown[] = [];
  const failure = captures.captures.find(
    (capture) => capture.name === 'rate-absent',
  )!;
  await page.route('**/api/chat', async (route) => {
    bodies.push(route.request().postDataJSON());
    if (bodies.length === 1)
      await route.fulfill({
        status: failure.status,
        contentType: 'application/json',
        body: JSON.stringify(failure.body),
      });
    else await route.continue();
  });
  const dialog = await openChat(page);
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog
    .getByRole('button', { name: CHAT_COPY.retry, exact: true })
    .click();
  await waitForReply(page);
  await expect(dialog.getByRole('alert')).toBeHidden();
  expect(bodies).toHaveLength(2);
  expect(bodies[1]).toEqual(bodies[0]);
  await expect(dialog.locator('article[data-role="user"]')).toHaveCount(1);
});
