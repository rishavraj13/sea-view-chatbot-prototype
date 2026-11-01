import { expect, type Page } from '@playwright/test';
import { CHAT_COPY, CHAT_UI } from '../../../src/content';

export async function openChat(page: Page) {
  await page.goto('/');
  await page
    .getByRole('button', { name: CHAT_UI.launcher, exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}
export async function sendQuestion(page: Page, text: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(CHAT_COPY.question, { exact: true }).fill(text);
  await dialog
    .getByRole('button', { name: CHAT_UI.sendButton, exact: true })
    .click();
}
export async function waitForReply(page: Page) {
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.locator('article[data-role="assistant"]').last(),
  ).toBeVisible();
  await expect(
    dialog.getByRole('status', { name: CHAT_COPY.loadingLabel }),
  ).toBeHidden();
}
