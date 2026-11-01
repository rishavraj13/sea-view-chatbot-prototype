import { test, expect } from '@playwright/test';
import {
  CHAT_COPY,
  CHAT_REFUSAL,
  CHAT_UI,
  HEADER_UI,
  NAV_BREAKPOINT,
  SOURCE_PAGES,
  STARTER_PROMPTS,
} from '../../src/content';
import { openChat, sendQuestion, waitForReply } from './helpers/chat';

test('New conversation cancels a pending request and ignores a late response', async ({
  page,
}) => {
  await page.clock.install();
  let release: (() => void) | undefined;
  let reached: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/chat', async (route) => {
    const response = await route.fetch();
    reached?.();
    await held;
    await route.fulfill({ response }).catch(() => undefined);
  });
  const dialog = await openChat(page);
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await pending;
  await expect(
    dialog.getByRole('status', { name: CHAT_COPY.loadingLabel }),
  ).toBeVisible();
  await expect(dialog.getByText(CHAT_COPY.slow, { exact: true })).toBeHidden();
  await page.clock.fastForward(8000);
  await expect(dialog.getByText(CHAT_COPY.slow, { exact: true })).toBeVisible();
  await dialog
    .getByRole('button', { name: CHAT_UI.newConversation, exact: true })
    .click();
  await expect(
    dialog.getByRole('group', { name: CHAT_COPY.suggestions }),
  ).toBeVisible();
  release?.();
  await page.unrouteAll({ behavior: 'wait' });
  await expect(dialog.locator('article')).toHaveCount(0);
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await expect(dialog.getByText(CHAT_COPY.mock, { exact: true })).toBeHidden();
});

for (const [index, prompt] of STARTER_PROMPTS.entries()) {
  test(`starter ${index + 1}: real mock backend renders its text/media/refusal`, async ({
    page,
  }) => {
    const dialog = await openChat(page);
    await dialog.getByRole('button', { name: prompt, exact: true }).click();
    await waitForReply(page);
    await expect(
      dialog.getByText(CHAT_COPY.mock, { exact: true }),
    ).toBeVisible();
    await expect(dialog.locator('article[data-role="user"]')).toHaveCount(1);
    await expect(
      dialog.getByRole('region', { name: CHAT_COPY.brochure, exact: true }),
    ).toHaveCount(index === 1 || index === 3 ? 1 : 0);
    await expect(
      dialog.getByRole('region', { name: CHAT_COPY.video, exact: true }),
    ).toHaveCount(index === 2 || index === 3 ? 1 : 0);
    if (index === 4)
      await expect(
        dialog.locator('article[data-role="assistant"]'),
      ).toContainText(CHAT_REFUSAL);
    else if (index === 0)
      await expect(
        dialog.getByRole('link', { name: new RegExp(SOURCE_PAGES[0].label) }),
      ).toBeVisible();
    await dialog
      .getByRole('button', { name: CHAT_UI.newConversation, exact: true })
      .click();
    await expect(
      dialog.getByText(CHAT_COPY.mock, { exact: true }),
    ).toBeHidden();
  });
}

test('conversation survives closing the dialog and client route navigation', async ({
  page,
}) => {
  const dialog = await openChat(page);
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await waitForReply(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  const link = HEADER_UI.links.find((item) => item.href === '/knowledge')!;
  if ((page.viewportSize()?.width ?? 0) >= NAV_BREAKPOINT)
    await page
      .getByRole('banner')
      .getByRole('link', { name: link.label, exact: true })
      .click();
  else
    await page
      .getByRole('contentinfo')
      .locator('a[href="/knowledge"]')
      .first()
      .click();
  await expect(page).toHaveURL(/\/knowledge$/);
  await page
    .getByRole('button', { name: CHAT_UI.launcher, exact: true })
    .click();
  await expect(dialog.locator('article[data-role="user"]')).toHaveCount(1);
  await expect(dialog.locator('article[data-role="assistant"]')).toBeVisible();
});
