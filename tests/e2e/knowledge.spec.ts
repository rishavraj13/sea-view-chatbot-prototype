import { test, expect } from '@playwright/test';
import {
  CHAT_COPY,
  CHAT_REFUSAL,
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  MISSING_FACT_PROMPT,
  SOURCE_PAGES,
  STARTER_PROMPTS,
  TRACE_UI,
} from '../../src/content';
import { manifest, openKnowledge, runTrace } from './helpers/knowledge';

test('header, exact tab names, counts and home footer targets', async ({
  page,
}) => {
  await openKnowledge(page);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: KNOWLEDGE_UI.title,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: KNOWLEDGE_UI.backLink, exact: true }),
  ).toHaveAttribute('href', '/');
  const tabs = page.getByRole('tablist', { name: KNOWLEDGE_COPY.tabs });
  for (const label of [
    KNOWLEDGE_UI.tabSources,
    KNOWLEDGE_UI.tabMedia,
    KNOWLEDGE_UI.tabTrace,
  ])
    await expect(
      tabs.getByRole('tab', { name: label, exact: true }),
    ).toBeVisible();
  for (const target of ['packages', 'plan', 'faq'])
    await expect(
      page.getByRole('contentinfo').locator(`a[href="/#${target}"]`),
    ).toHaveCount(1);
});

test('sources: 18 sections, capture dates, safe links and expandable real text', async ({
  page,
}) => {
  const panel = await openKnowledge(page);
  await expect(panel.getByRole('article')).toHaveCount(18);
  await expect(panel.locator('time[datetime="2026-10-31"]')).toHaveCount(18);
  const article = panel.getByRole('article').first();
  await expect(
    article.getByRole('heading', { name: 'ECO', exact: true }),
  ).toBeVisible();
  await expect(article.getByRole('link')).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );
  await expect(article.locator('details')).not.toHaveAttribute('open');
  await article.getByText(KNOWLEDGE_COPY.fullSource, { exact: true }).click();
  await expect(article.locator('pre')).toContainText('฿9,500');
});

test('media: every actual manifest title, type, provenance and availability', async ({
  page,
}) => {
  const panel = await openKnowledge(page, KNOWLEDGE_UI.tabMedia);
  await expect(panel.getByRole('article')).toHaveCount(manifest.length);
  for (const item of manifest) {
    const article = panel.getByRole('article').filter({
      has: page.getByRole('heading', { name: item.title, exact: true }),
    });
    await expect(article).toBeVisible();
    await expect(article.getByText(item.type, { exact: true })).toBeVisible();
    await expect(
      article.getByText(
        item.available ? KNOWLEDGE_COPY.available : KNOWLEDGE_COPY.unavailable,
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      article.getByText(CHAT_COPY.demo, { exact: true }),
    ).toHaveCount(item.isDemo ? 1 : 0);
    if (item.available) {
      await expect(article.getByRole('link')).toHaveAttribute('href', item.url);
      await expect(article.getByRole('link')).toHaveAttribute(
        'rel',
        'noopener noreferrer',
      );
    } else {
      await expect(article.getByRole('link')).toHaveCount(0);
      await expect(
        article.getByText(KNOWLEDGE_COPY.noAsset, { exact: true }),
      ).toBeVisible();
    }
  }
});

test('trace brochure: actual context, object tool call, demo receipt, citations area and metadata', async ({
  page,
}) => {
  const panel = await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  await expect(
    panel.getByText(KNOWLEDGE_COPY.traceEmpty, { exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByText(KNOWLEDGE_COPY.runNote, { exact: true }),
  ).toBeVisible();
  for (const prompt of STARTER_PROMPTS)
    await expect(
      panel.getByRole('button', { name: prompt, exact: true }),
    ).toBeVisible();
  const { result, data } = await runTrace(page, STARTER_PROMPTS[1]);
  expect(data.toolCalls.map((call) => call.name)).toContain('sendBrochure');
  const tools = result.getByRole('region', {
    name: KNOWLEDGE_COPY.tools,
    exact: true,
  });
  await expect(
    tools.getByRole('heading', { name: 'sendBrochure', exact: true }),
  ).toBeVisible();
  await expect(tools).toContainText(data.toolCalls[0]!.input.id);
  const media = result.getByRole('region', {
    name: KNOWLEDGE_COPY.media,
    exact: true,
  });
  await expect(media.getByText(CHAT_COPY.demo, { exact: true })).toBeVisible();
  await expect(media.getByRole('link')).toHaveAttribute(
    'href',
    '/demo/brochure.pdf',
  );
  await expect(
    result.getByRole('region', { name: KNOWLEDGE_COPY.citations, exact: true }),
  ).toBeVisible();
  for (const [label, value] of [
    [TRACE_UI.mode, data.mode],
    [TRACE_UI.provider, data.provider],
    [TRACE_UI.model, data.modelId],
  ])
    await expect(
      result.getByText(`${label}: ${value}`, { exact: true }),
    ).toBeVisible();
  await expect(
    result.getByText(TRACE_UI.output, { exact: true }),
  ).toBeVisible();
  expect(await result.locator('h3').allTextContents()).toEqual([
    KNOWLEDGE_COPY.question,
    KNOWLEDGE_COPY.context,
    KNOWLEDGE_COPY.chunks,
    KNOWLEDGE_COPY.tools,
    KNOWLEDGE_COPY.media,
    KNOWLEDGE_COPY.answer,
  ]);
  await expect(result).not.toContainText('[object Object]');
  await expect(panel).not.toContainText('Retrieval query');
});

test('trace earlier turns: VIP-dependent follow-up, exact context and submitted history', async ({
  page,
}) => {
  const panel = await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  await panel.getByText(TRACE_UI.earlierTurns, { exact: true }).click();
  const earlierUser = 'How much is the VIP package?';
  const earlierAssistant = 'The VIP package costs ฿14,000 per person.';
  await panel
    .getByLabel(KNOWLEDGE_COPY.user, { exact: true })
    .fill(earlierUser);
  await panel
    .getByLabel(KNOWLEDGE_COPY.assistant, { exact: true })
    .fill(earlierAssistant);
  const { result, data } = await runTrace(page, "and what's included?");
  expect(data.chunks.some((chunk) => chunk.source.title === 'VIP')).toBe(true);
  await expect(
    result.getByRole('region', {
      name: KNOWLEDGE_COPY.contextText,
      exact: true,
    }),
  ).toContainText('VIP');
  await expect(
    result.getByRole('region', { name: KNOWLEDGE_COPY.question, exact: true }),
  ).toContainText(earlierUser);
  await expect(
    result.getByRole('region', { name: KNOWLEDGE_COPY.question, exact: true }),
  ).toContainText(earlierAssistant);
  await expect(
    result
      .getByRole('region', { name: KNOWLEDGE_COPY.citations, exact: true })
      .getByRole('link', { name: new RegExp(SOURCE_PAGES[0].label) }),
  ).toBeVisible();
});

test('trace age limit: no context, empty chunks/tools/media and honest refusal', async ({
  page,
}) => {
  await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  const { result, data } = await runTrace(page, MISSING_FACT_PROMPT);
  expect(data.chunks).toEqual([]);
  expect(data.media).toEqual([]);
  expect(data.toolCalls).toEqual([]);
  await expect(
    result.getByText(KNOWLEDGE_COPY.noChunks, { exact: true }),
  ).toBeVisible();
  await expect(
    result.getByText(KNOWLEDGE_COPY.noTools, { exact: true }),
  ).toBeVisible();
  await expect(
    result.getByText(KNOWLEDGE_COPY.noMedia, { exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('region', { name: KNOWLEDGE_COPY.answer, exact: true }),
  ).toContainText(CHAT_REFUSAL);
});

test('earlier-turn pair validation sends no silently truncated history', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/knowledge/trace') calls++;
  });
  const panel = await openKnowledge(page, KNOWLEDGE_UI.tabTrace);
  await panel.getByText(TRACE_UI.earlierTurns, { exact: true }).click();
  await panel
    .getByLabel(KNOWLEDGE_COPY.user, { exact: true })
    .fill('How much is VIP?');
  await panel
    .getByLabel(TRACE_UI.question, { exact: true })
    .fill("and what's included?");
  await panel
    .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton, exact: true })
    .click();
  await expect(panel.getByRole('alert')).toHaveText(
    KNOWLEDGE_COPY.historyValidation,
  );
  expect(calls).toBe(0);
});

test('ARIA tabs activate by arrows/Home/End and Tab enters the selected panel', async ({
  page,
}) => {
  await openKnowledge(page);
  const labels = [
    KNOWLEDGE_UI.tabSources,
    KNOWLEDGE_UI.tabMedia,
    KNOWLEDGE_UI.tabTrace,
  ];
  await page.getByRole('tab', { name: labels[0], exact: true }).focus();
  for (const [key, index] of [
    ['ArrowRight', 1],
    ['End', 2],
    ['ArrowRight', 0],
    ['ArrowLeft', 2],
    ['Home', 0],
  ] as const) {
    await page.keyboard.press(key);
    const tab = page.getByRole('tab', { name: labels[index], exact: true });
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveAttribute('tabindex', '0');
    for (const [other, label] of labels.entries())
      if (other !== index)
        await expect(
          page.getByRole('tab', { name: label, exact: true }),
        ).toHaveAttribute('tabindex', '-1');
  }
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('tabpanel', { name: labels[0], exact: true }),
  ).toBeFocused();
});
