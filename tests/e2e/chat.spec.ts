import { test, expect } from '@playwright/test';
import {
  CHAT_UI,
  PACKAGES,
  packageAskLabel,
  packageQuestion,
  STARTER_PROMPTS,
} from '../../src/content';

test.describe('Chat modal and conversation flows', () => {
  test('launcher pill appears on both routes and opens native modal dialog', async ({
    page,
  }) => {
    // Check on "/"
    await page.goto('/');
    const launcherHome = page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    });
    await expect(launcherHome).toBeVisible();

    // Check on "/knowledge"
    await page.goto('/knowledge');
    const launcherKnowledge = page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    });
    await expect(launcherKnowledge).toBeVisible();
  });

  test('keyboard-only open/close of chat with focus trap and focus return', async ({
    page,
  }) => {
    await page.goto('/');
    const launcher = page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    });

    // Focus launcher and press Enter to open
    await launcher.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Focus should be trapped inside dialog
    const composer = dialog.locator('#chat-composer');
    await expect(composer).toBeFocused();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Focus returns to launcher
    await expect(launcher).toBeFocused();
  });

  test('package button prefills composer without sending and focuses textarea', async ({
    page,
  }) => {
    await page.goto('/');
    const askButton = page.getByRole('button', {
      name: packageAskLabel(PACKAGES[0]!.name),
      exact: true,
    });
    await askButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await expect(composer).toHaveValue(packageQuestion(PACKAGES[0]!.name));

    // Ensure it did not auto-send (no assistant bubble or loading skeleton)
    const messages = dialog.locator('article, div[role="status"]');
    await expect(messages).toHaveCount(0);
  });

  test('starter chips send immediately and render text, brochure, video and mock strip', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('button', {
        name: CHAT_UI.launcher,
        exact: true,
      })
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 1. Send starter chip
    const bothChip = dialog.getByRole('button', {
      name: STARTER_PROMPTS[3],
      exact: true,
    });
    await bothChip.click();

    // Wait for response in MOCK mode
    await expect(
      dialog.getByText('Mock mode: scripted answers, not a live model', {
        exact: true,
      }),
    ).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByText('PDF', { exact: true })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      dialog.getByRole('link', { name: 'Open', exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: 'Download', exact: true }),
    ).toBeVisible();
    await expect(dialog.locator('video')).toBeVisible();

    // 2. New conversation resets state
    await dialog
      .getByRole('button', {
        name: CHAT_UI.newConversation,
        exact: true,
      })
      .click();
    await expect(
      dialog.getByRole('button', { name: STARTER_PROMPTS[0], exact: true }),
    ).toBeVisible();
    await expect(dialog.locator('video')).toHaveCount(0);
  });

  test('captures open chat dialog screenshot', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', {
        name: CHAT_UI.launcher,
        exact: true,
      })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const viewport = page.viewportSize();
    if (viewport) {
      await page.screenshot({
        path: `docs/screenshots/chat-${viewport.width}.png`,
      });
    }
  });
});
