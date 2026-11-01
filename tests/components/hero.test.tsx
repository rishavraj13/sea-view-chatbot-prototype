import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HERO_FACTS, SITE_METADATA } from '@/content';

describe('Header component', () => {
  it('renders sticky navigation landmark with anchors and action pill', () => {
    const html = renderToStaticMarkup(<Header />);
    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain('href="#packages"');
    expect(html).toContain('href="#plan"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain('href="/knowledge"');
    expect(html).toContain('Choose package');
  });
});

describe('Hero component', () => {
  it('renders kicker, h1 with echo-word, subline, action links, and fact row', () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain(SITE_METADATA.kicker);
    expect(html).toContain('class="echo-word"');
    expect(html).toContain(SITE_METADATA.echoWord);
    expect(html).toContain(SITE_METADATA.subline);
    expect(html).toContain(SITE_METADATA.fromPrice);
    expect(html).toContain('Watch the jump');
    expect(html).toContain(SITE_METADATA.videoUrl);

    for (const fact of HERO_FACTS) {
      expect(html).toContain(fact.value);
      expect(html).toContain(fact.label);
    }
  });
});
