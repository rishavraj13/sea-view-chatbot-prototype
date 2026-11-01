import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  CHAT_COPY,
  CHAT_UI,
  SOURCE_PAGES,
  STARTER_PROMPTS,
} from '../../src/content';
import captures from '../../docs/examples/chat-runtime/errors.json' with { type: 'json' };
import { projectedBodySchema } from '../../src/components/chat/request-projection';
import { openChat, sendQuestion, waitForReply } from './helpers/chat';

test('viewport evidence: empty, media/source, mock strip and countdown; populated axe', async ({
  page,
}) => {
  const width = page.viewportSize()!.width;
  const dialog = await openChat(page);
  await expect(
    dialog.getByRole('group', { name: CHAT_COPY.suggestions }),
  ).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/chat-empty-${width}.png`,
    scale: 'css',
  });
  const bodies: unknown[] = [];
  page.on('request', (request) => {
    if (
      new URL(request.url()).pathname === '/api/chat' &&
      request.method() === 'POST'
    )
      bodies.push(request.postDataJSON());
  });
  await sendQuestion(page, STARTER_PROMPTS[3]);
  await waitForReply(page);
  await expect(
    dialog.getByRole('region', { name: CHAT_COPY.brochure, exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('region', { name: CHAT_COPY.video, exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: new RegExp(SOURCE_PAGES[0].label) }),
  ).toBeVisible();
  await dialog
    .locator('article[data-role="assistant"]')
    .last()
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `docs/screenshots/chat-media-${width}.png`,
    scale: 'css',
  });
  await expect(dialog.getByText(CHAT_COPY.mock, { exact: true })).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/chat-mock-${width}.png`,
    scale: 'css',
  });

  await sendQuestion(page, 'How much is ECO?');
  await waitForReply(page);
  expect(bodies).toHaveLength(2);
  for (const body of bodies)
    expect(projectedBodySchema.safeParse(body).success).toBe(true);
  const history = projectedBodySchema.parse(bodies[1]).messages[1];
  expect(history?.parts.map((part) => part.type)).toEqual(
    expect.arrayContaining([
      'step-start',
      'source-url',
      'tool-sendBrochure',
      'tool-showVideo',
    ]),
  );
  await writeFile(
    `docs/examples/chat-runtime/requests-${width}.json`,
    JSON.stringify(
      {
        evidence:
          'Actual browser assistant-ui runtime requests to the local MOCK backend',
        bodies,
      },
      null,
      2,
    ) + '\n',
  );

  const failure = captures.captures.find(
    (capture) => capture.name === 'rate-present',
  )!;
  await page.clock.install();
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: failure.status,
      contentType: 'application/json',
      body: JSON.stringify(failure.body),
    }),
  );
  await sendQuestion(page, STARTER_PROMPTS[0]);
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('alert').getByRole('button')).toBeDisabled();
  await page.screenshot({
    path: `docs/screenshots/chat-rate-limit-${width}.png`,
    scale: 'css',
  });
  const scan = await new AxeBuilder({ page })
    .include('dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    scan.violations.filter(
      (item) => item.impact === 'critical' || item.impact === 'serious',
    ),
  ).toEqual([]);
  await dialog
    .getByRole('button', { name: CHAT_UI.newConversation, exact: true })
    .click();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
});
