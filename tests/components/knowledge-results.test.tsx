import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { SourcesTab } from '@/components/knowledge/SourcesTab';
import { MediaTab } from '@/components/knowledge/MediaTab';
import { TraceResults } from '@/components/knowledge/TraceResults';
import {
  knowledgeSourcesSchema,
  traceResponseSchema,
} from '@/components/knowledge/schemas';
import { traceFormSchema } from '@/components/knowledge/trace-input';
import { CHAT_COPY, KNOWLEDGE_COPY } from '@/content';

const catalog = knowledgeSourcesSchema.parse(
  JSON.parse(
    readFileSync(resolve('docs/examples/real-knowledge/sources.json'), 'utf8'),
  ),
);
describe('Read-only knowledge rendering', () => {
  it('renders actual source text, metadata and full details', () => {
    const html = renderToStaticMarkup(<SourcesTab sources={catalog.sources} />);
    for (const source of catalog.sources) {
      expect(html).toContain(source.title.replace(/'/g, '&#x27;'));
      expect(html).toContain(source.capturedAt);
      expect(html).toContain(source.url);
    }
    expect(html).toContain(KNOWLEDGE_COPY.fullSource);
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('renders real media titles/types/provenance/availability, with no retired link', () => {
    const html = renderToStaticMarkup(<MediaTab media={catalog.media} />);
    for (const media of catalog.media) expect(html).toContain(media.title);
    expect(html).toContain(CHAT_COPY.demo);
    expect(html).toContain(KNOWLEDGE_COPY.unavailable);
    const retired = catalog.media.find((media) => !media.available)!;
    if (retired.url) expect(html).not.toContain(`href="${retired.url}"`);
  });
  it('shows explicit source and media empty states', () => {
    expect(renderToStaticMarkup(<SourcesTab sources={[]} />)).toContain(
      KNOWLEDGE_COPY.sourcesEmpty,
    );
    expect(renderToStaticMarkup(<MediaTab media={[]} />)).toContain(
      KNOWLEDGE_COPY.mediaEmpty,
    );
  });
  it.each(['vip', 'weather', 'unknown'])(
    'renders the real %s trace instead of inspecting a DTO',
    (name) => {
      const capture = z
        .object({
          request: z.object({ question: z.string() }),
          response: traceResponseSchema,
        })
        .parse(
          JSON.parse(
            readFileSync(
              resolve(`docs/examples/real-knowledge/trace-${name}.json`),
              'utf8',
            ),
          ),
        );
      const submitted = traceFormSchema.parse({
        question: capture.request.question,
        earlierUser: '',
        earlierAssistant: '',
      });
      const html = renderToStaticMarkup(
        <TraceResults trace={capture.response} submitted={submitted} />,
      );
      for (const label of [
        KNOWLEDGE_COPY.context,
        KNOWLEDGE_COPY.chunks,
        KNOWLEDGE_COPY.tools,
        KNOWLEDGE_COPY.media,
        KNOWLEDGE_COPY.answer,
      ])
        expect(html).toContain(label);
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('Retrieval query');
      expect(html).toContain(capture.response.mode);
    },
  );
  it('renders actual brochure, earlier-turn, unavailable and empty trace captures', () => {
    const fixture = z
      .object({
        captures: z.array(
          z.object({
            submitted: traceFormSchema,
            response: traceResponseSchema,
          }),
        ),
      })
      .parse(
        JSON.parse(
          readFileSync(
            resolve('docs/examples/knowledge-view/captures.json'),
            'utf8',
          ),
        ),
      );
    for (const capture of fixture.captures) {
      const html = renderToStaticMarkup(
        <TraceResults trace={capture.response} submitted={capture.submitted} />,
      );
      expect(html).not.toContain('[object Object]');
      if (capture.response.context)
        expect(html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'")).toContain(
          capture.response.context.replace(/&/g, '&amp;'),
        );
      for (const call of capture.response.toolCalls) {
        expect(html).toContain(call.name);
        expect(html).toContain(call.input.id);
      }
      if (capture.submitted.earlierUser)
        expect(html).toContain(capture.submitted.earlierUser);
      if (capture.response.media.some((item) => item.kind === 'unavailable'))
        expect(html).toContain(CHAT_COPY.unavailable.replace(/'/g, '&#x27;'));
      if (!capture.response.chunks.length)
        expect(html).toContain(KNOWLEDGE_COPY.noChunks);
    }
  });
});
