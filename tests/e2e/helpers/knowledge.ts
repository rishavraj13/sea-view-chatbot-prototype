import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  knowledgeMediaSchema,
  traceResponseSchema,
} from '../../../src/components/knowledge/schemas';
import { errorEnvelopeSchema } from '../../../src/components/chat/api-error';
import { KNOWLEDGE_COPY, KNOWLEDGE_UI, TRACE_UI } from '../../../src/content';

export const manifest = z
  .array(knowledgeMediaSchema)
  .parse(
    JSON.parse(readFileSync(resolve('data', 'media', 'manifest.json'), 'utf8')),
  );
export const errors = z
  .object({
    captures: z.array(
      z.object({
        name: z.string(),
        status: z.number(),
        body: errorEnvelopeSchema,
      }),
    ),
  })
  .parse(
    JSON.parse(
      readFileSync(
        resolve('docs', 'examples', 'chat-runtime', 'errors.json'),
        'utf8',
      ),
    ),
  ).captures;

export async function openKnowledge(
  page: Page,
  label: string = KNOWLEDGE_UI.tabSources,
) {
  await page.goto('/knowledge');
  await page.getByRole('tab', { name: label, exact: true }).click();
  return page.getByRole('tabpanel', { name: label, exact: true });
}
export async function runTrace(page: Page, question: string) {
  const panel = page.getByRole('tabpanel', {
    name: KNOWLEDGE_UI.tabTrace,
    exact: true,
  });
  await panel.getByLabel(TRACE_UI.question, { exact: true }).fill(question);
  const waiting = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/knowledge/trace',
  );
  await panel
    .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton, exact: true })
    .click();
  const response = await waiting;
  expect(response.status()).toBe(200);
  const data = traceResponseSchema.parse(await response.json());
  const result = panel.getByRole('region', {
    name: KNOWLEDGE_COPY.resultRegion,
    exact: true,
  });
  await expect(result).toBeVisible();
  await expect(
    result.getByRole('region', {
      name: KNOWLEDGE_COPY.contextText,
      exact: true,
    }),
  ).toHaveText(data.context);
  expect(
    await result
      .getByRole('region', { name: KNOWLEDGE_COPY.contextText, exact: true })
      .textContent(),
  ).toBe(data.context);
  return { panel, result, data };
}
