import { expect, test } from '@playwright/test';
import {
  HERO_IMAGE,
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  STARTER_PROMPTS,
  CHAT_COPY,
} from '../../src/content';
import { positionHero } from './helpers/hero';
import { openChat, sendQuestion, waitForReply } from './helpers/chat';
import { openKnowledge, runTrace } from './helpers/knowledge';

test('final home viewport evidence, top and scrolled plan', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole('img', { name: HERO_IMAGE.alt, exact: true })
    .evaluate(async (element) => {
      if (element instanceof HTMLImageElement) await element.decode();
    });
  await positionHero(page, 0);
  const width = page.viewportSize()!.width;
  await page.screenshot({
    path: `docs/screenshots/release-home-${width}-top.png`,
    scale: 'css',
  });
  for (const image of await page.locator('#plan img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (element) => {
      if (element instanceof HTMLImageElement) await element.decode();
    });
    await expect(image.locator('..')).toHaveClass(/isRevealed/);
    await expect(image.locator('..')).toHaveCSS('clip-path', 'inset(0px)');
  }
  await page
    .locator('#plan')
    .evaluate((element) =>
      window.scrollTo({
        top:
          element.getBoundingClientRect().top +
          scrollY -
          parseFloat(getComputedStyle(element).getPropertyValue('--header-h')),
        behavior: 'instant',
      }),
    );
  await expect(page.locator('#plan-heading')).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/release-home-${width}-scrolled.png`,
    scale: 'css',
  });
});

test('final mock chat reply viewport evidence', async ({ page }) => {
  const dialog = await openChat(page);
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await waitForReply(page);
  await expect(
    dialog.getByRole('button', { name: CHAT_COPY.showFull, exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText(CHAT_COPY.mock, { exact: true })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/release-chat-${page.viewportSize()!.width}.png`,
    scale: 'css',
  });
});

test('final Knowledge mock trace viewport evidence', async ({ page }) => {
  await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  const { result } = await runTrace(page, STARTER_PROMPTS[3]);
  await result
    .getByRole('heading', { name: KNOWLEDGE_COPY.tools, exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/screenshots/release-knowledge-trace-${page.viewportSize()!.width}.png`,
    scale: 'css',
  });
});
