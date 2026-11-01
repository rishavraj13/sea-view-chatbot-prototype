import { test, expect } from '@playwright/test';
import { CHAT_UI } from '../../src/content';

test.describe('Chat error handling and retry behaviors', () => {
  test('429 with retryAfterSeconds displays disabled countdown button', async ({
    page,
  }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'live',
          provider: 'groq',
          modelId: 'qwen/qwen3.8-27b',
          error: {
            code: 'RATE_LIMIT',
            message: 'The model rate limit was reached. Please retry later.',
            retryAfterSeconds: 12,
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await composer.fill('When can I jump?');
    await dialog.getByRole('button', { name: CHAT_UI.sendButton, exact: true }).click();

    const errorAlert = dialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(
      errorAlert.getByText(
        'The model rate limit was reached. Please retry later.',
        { exact: true }
      )
    ).toBeVisible();

    const retryButton = errorAlert.getByRole('button', { name: /Retry in/i });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeDisabled();
    await expect(retryButton).toContainText('Retry in 12s');
  });

  test('429 without retryAfterSeconds displays immediate enabled Retry button', async ({
    page,
  }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'live',
          provider: 'groq',
          modelId: 'qwen/qwen3.8-27b',
          error: {
            code: 'RATE_LIMIT',
            message: 'The model rate limit was reached. Please retry later.',
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await composer.fill('How high is the jump?');
    await dialog.getByRole('button', { name: CHAT_UI.sendButton, exact: true }).click();

    const errorAlert = dialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(
      errorAlert.getByText(
        'The model rate limit was reached. Please retry later.',
        { exact: true }
      )
    ).toBeVisible();

    const retryButton = errorAlert.getByRole('button', {
      name: 'Retry',
      exact: true,
    });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('504 TIMEOUT displays safe message and enabled retry button', async ({
    page,
  }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 504,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'live',
          provider: 'groq',
          modelId: 'qwen/qwen3.8-27b',
          error: {
            code: 'TIMEOUT',
            message: 'The model timed out. Please retry.',
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await composer.fill('Do you jump in the rain?');
    await dialog.getByRole('button', { name: CHAT_UI.sendButton, exact: true }).click();

    const errorAlert = dialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(
      errorAlert.getByText('The model timed out. Please retry.', {
        exact: true,
      })
    ).toBeVisible();

    const retryButton = errorAlert.getByRole('button', {
      name: 'Retry',
      exact: true,
    });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('502 MODEL_FAILURE displays safe message and enabled retry button', async ({
    page,
  }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'live',
          provider: 'groq',
          modelId: 'qwen/qwen3.8-27b',
          error: {
            code: 'MODEL_FAILURE',
            message: 'The model is temporarily unavailable.',
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await composer.fill('Can I jump at 14?');
    await dialog.getByRole('button', { name: CHAT_UI.sendButton, exact: true }).click();

    const errorAlert = dialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(
      errorAlert.getByText('The model is temporarily unavailable.', {
        exact: true,
      })
    ).toBeVisible();

    const retryButton = errorAlert.getByRole('button', {
      name: 'Retry',
      exact: true,
    });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('400 INVALID_INPUT displays safe input error message', async ({
    page,
  }) => {
    await page.route('/api/chat', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'live',
          provider: 'groq',
          modelId: 'qwen/qwen3.8-27b',
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid message history.',
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', {
      name: CHAT_UI.launcher,
      exact: true,
    }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const composer = dialog.locator('#chat-composer');
    await composer.fill('Invalid question');
    await dialog.getByRole('button', { name: CHAT_UI.sendButton, exact: true }).click();

    const errorAlert = dialog.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(
      errorAlert.getByText('Invalid message history.', { exact: true })
    ).toBeVisible();
  });
});
