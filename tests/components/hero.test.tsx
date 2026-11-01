import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HeroIntro } from '@/components/HeroIntro';
import { HERO_FACTS, HERO_UI, SITE_METADATA } from '@/content';

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
  it('renders one semantic spaced h1, source photo and hidden portal decoration', () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain(SITE_METADATA.kicker);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(
      `<span>${HERO_UI.firstWord}</span> <span>${HERO_UI.lastWord}</span>`,
    );
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(7);
    expect(html).toContain(SITE_METADATA.echoWord);
    expect(html).toContain(SITE_METADATA.subline);
    expect(html).not.toContain(SITE_METADATA.fromPrice);
  });
  it('renders the CTA and fact row once after the portal, with the real external video', () => {
    const html = renderToStaticMarkup(<HeroIntro />);
    expect(html.split(SITE_METADATA.fromPrice)).toHaveLength(2);
    expect(html).toContain(HERO_UI.watch);
    expect(html).toContain(SITE_METADATA.videoUrl);
    expect(html).toContain('rel="noopener noreferrer"');

    for (const fact of HERO_FACTS) {
      expect(html).toContain(fact.value);
      expect(html).toContain(fact.label);
    }
  });
});
