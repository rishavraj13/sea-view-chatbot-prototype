import { expect, test } from '@playwright/test';
import { CHAT_COPY, STARTER_PROMPTS } from '../../src/content';
import { openChat, sendQuestion, waitForReply } from './helpers/chat';

test('long mock answers disclose the same DOM text and preserves source chips', async ({
  page,
}) => {
  const dialog = await openChat(page);
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await waitForReply(page);
  const answer = dialog.locator('article[data-role="assistant"]').last();
  const body = answer.locator('[data-answer-text]');
  const original = await body.textContent();
  expect(original!.length).toBeGreaterThan(600);
  const full = answer.getByRole('button', {
    name: CHAT_COPY.showFull,
    exact: true,
  });
  await expect(full).toHaveAttribute('aria-expanded', 'false');
  const collapsed = await body.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    line: parseFloat(getComputedStyle(element).lineHeight),
  }));
  expect(collapsed.height).toBeLessThanOrEqual(collapsed.line * 8 + 1);
  await full.click();
  await expect(
    answer.getByRole('button', { name: CHAT_COPY.showLess, exact: true }),
  ).toHaveAttribute('aria-expanded', 'true');
  expect((await body.boundingBox())!.height).toBeGreaterThan(collapsed.height);
  expect(await body.textContent()).toBe(original);
  await expect(answer.getByRole('link').first()).toBeVisible();
  await answer
    .getByRole('button', { name: CHAT_COPY.showLess, exact: true })
    .click();
  expect(await body.textContent()).toBe(original);
  await expect(full).toHaveAttribute('aria-expanded', 'false');
});
