import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ToolResultBrochure } from '@/components/chat/ToolResultBrochure';
import { ToolResultVideo } from '@/components/chat/ToolResultVideo';
import { ToolResultUnavailable } from '@/components/chat/ToolResultUnavailable';
import type { BrochureResult, VideoResult } from '@/components/chat/types';

describe('Tool result renderers', () => {
  it('renders brochure card with PDF mark, title, demo badge, open and download links', () => {
    const brochure: BrochureResult = {
      kind: 'brochure',
      type: 'pdf',
      id: 'brochure',
      title: 'Sea View Skydiving package brochure',
      url: '/demo/brochure.pdf',
      isDemo: true,
    };

    const html = renderToStaticMarkup(<ToolResultBrochure result={brochure} />);
    expect(html).toContain('PDF');
    expect(html).toContain('Sea View Skydiving package brochure');
    expect(html).toContain('Demo material');
    expect(html).toContain('href="/demo/brochure.pdf"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('download=""');
  });

  it('renders video card with 16:9 native video element and title', () => {
    const video: VideoResult = {
      kind: 'video',
      type: 'video',
      id: 'video',
      title: 'Sea View Skydiving - page video (external link)',
      url: 'https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4',
      isDemo: false,
      posterUrl: 'https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg',
    };

    const html = renderToStaticMarkup(<ToolResultVideo result={video} />);
    expect(html).toContain('Sea View Skydiving - page video (external link)');
    expect(html).toContain('<video');
    expect(html).toContain('controls=""');
    expect(html).toContain('playsInline=""');
    expect(html).toContain('preload="none"');
    expect(html).toContain('src="https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4"');
  });

  it('renders unavailable note without broken card styling', () => {
    const html = renderToStaticMarkup(<ToolResultUnavailable />);
    expect(html).toContain("That file isn&#x27;t available right now.");
    expect(html).not.toContain('<video');
    expect(html).not.toContain('PDF');
  });
});
