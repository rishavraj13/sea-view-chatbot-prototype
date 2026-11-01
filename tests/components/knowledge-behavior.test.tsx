// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { KnowledgeTabs } from '@/components/knowledge/KnowledgeTabs';
import { TraceForm } from '@/components/knowledge/TraceForm';
import { knowledgeSourcesSchema } from '@/components/knowledge/schemas';
import {
  traceFormSchema,
  buildTraceRequest,
} from '@/components/knowledge/trace-input';
import {
  CHAT_COPY,
  ERROR_MESSAGES,
  KNOWLEDGE_COPY,
  KNOWLEDGE_UI,
  STARTER_PROMPTS,
  TRACE_UI,
} from '@/content';
import { CHAT_LIMITS } from '@/components/chat/limits';

const catalog = knowledgeSourcesSchema.parse(
  JSON.parse(
    readFileSync(resolve('docs/examples/real-knowledge/sources.json'), 'utf8'),
  ),
);
afterEach(() => vi.unstubAllGlobals());
describe('Knowledge keyboard and request behavior', () => {
  it.each([
    { question: 'Question', earlierUser: 'User only', earlierAssistant: '' },
    {
      question: 'Question',
      earlierUser: '',
      earlierAssistant: 'Assistant only',
    },
    { question: ' ', earlierUser: '', earlierAssistant: '' },
    {
      question: 'x'.repeat(CHAT_LIMITS.text + 1),
      earlierUser: '',
      earlierAssistant: '',
    },
    {
      question: 'Question',
      earlierUser: 'x'.repeat(CHAT_LIMITS.text + 1),
      earlierAssistant: 'Answer',
    },
  ])('rejects incomplete or oversized trace inputs', (values) => {
    expect(traceFormSchema.safeParse(values).success).toBe(false);
  });
  it('uses roving tabs and activates ArrowLeft/Right/Home/End with linked panels', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(catalog)),
    );
    render(<KnowledgeTabs />);
    const tabs = screen.getAllByRole('tab');
    await waitFor(() =>
      expect(screen.getAllByRole('article')).toHaveLength(
        catalog.sources.length,
      ),
    );
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    for (const [key, index] of [
      ['ArrowRight', 1],
      ['End', 2],
      ['ArrowRight', 0],
      ['ArrowLeft', 2],
      ['Home', 0],
    ] as const) {
      fireEvent.keyDown(
        document.activeElement === document.body
          ? tabs[0]!
          : document.activeElement!,
        { key },
      );
      expect(document.activeElement).toBe(tabs[index]);
      expect(tabs[index]?.getAttribute('aria-selected')).toBe('true');
      expect(tabs[index]?.getAttribute('aria-controls')).toBe(
        screen.getByRole('tabpanel').id,
      );
      expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
        tabs[index]?.id,
      );
    }
    expect(tabs[0]?.textContent).toContain(KNOWLEDGE_UI.tabSources);
  });
  it('validates a complete earlier-turn pair and applies the shared text bound', () => {
    const run = vi.fn();
    render(<TraceForm pending={false} onRun={run} />);
    fireEvent.click(screen.getByRole('button', { name: STARTER_PROMPTS[0] }));
    const user = screen.getByLabelText(KNOWLEDGE_COPY.user);
    const assistant = screen.getByLabelText(KNOWLEDGE_COPY.assistant);
    expect(user.getAttribute('maxlength')).toBe(String(CHAT_LIMITS.text));
    expect(assistant.getAttribute('maxlength')).toBe(String(CHAT_LIMITS.text));
    fireEvent.change(user, { target: { value: 'How much is VIP?' } });
    fireEvent.submit(
      screen
        .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton })
        .closest('form')!,
    );
    expect(screen.getByRole('alert').textContent).toBe(
      KNOWLEDGE_COPY.historyValidation,
    );
    expect(run).not.toHaveBeenCalled();
    fireEvent.change(assistant, {
      target: { value: 'VIP costs ฿14,000 per person.' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: KNOWLEDGE_UI.runTraceButton })
        .closest('form')!,
    );
    expect(run).toHaveBeenCalledOnce();
    expect(
      buildTraceRequest(traceFormSchema.parse(run.mock.calls[0]?.[0])).messages,
    ).toHaveLength(3);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.getByLabelText(TRACE_UI.question).getAttribute('maxlength'),
    ).toBe(String(CHAT_LIMITS.text));
    expect(screen.getByText(KNOWLEDGE_COPY.runNote)).toBeDefined();
  });
  it('handles unexpected successful JSON and Retry without exposing JSON', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ private: 'DO_NOT_RENDER' }))
      .mockResolvedValueOnce(Response.json(catalog));
    vi.stubGlobal('fetch', fetcher);
    render(<KnowledgeTabs />);
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        ERROR_MESSAGES.UNKNOWN,
      ),
    );
    expect(screen.queryByText('DO_NOT_RENDER')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: CHAT_COPY.retry }));
    await waitFor(() =>
      expect(screen.getAllByRole('article')).toHaveLength(
        catalog.sources.length,
      ),
    );
  });
  it('validates typed catalog errors using shared product copy', async () => {
    const fixture = z
      .object({
        captures: z.array(z.object({ body: z.unknown(), status: z.number() })),
      })
      .parse(
        JSON.parse(
          readFileSync(
            resolve('docs/examples/chat-runtime/errors.json'),
            'utf8',
          ),
        ),
      );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(fixture.captures[1]?.body, { status: 429 }),
      ),
    );
    render(<KnowledgeTabs />);
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        ERROR_MESSAGES.RATE_LIMIT,
      ),
    );
  });
  it('ignores a late catalog response after unmount', async () => {
    let release: ((response: Response) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          }),
      ),
    );
    const view = render(<KnowledgeTabs />);
    view.unmount();
    await act(async () => release?.(Response.json(catalog)));
    expect(screen.queryByRole('article')).toBeNull();
  });
});
