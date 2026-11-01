// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChatProvider } from '@/components/ChatContext';
import { Statement } from '@/components/Statement';
import { Packages } from '@/components/Packages';
import { ThePlan } from '@/components/ThePlan';
import { Faq } from '@/components/Faq';
import { WhereAndWho } from '@/components/WhereAndWho';
import { Footer } from '@/components/Footer';
import {
  FAQS,
  INCLUSIONS,
  LOCATION_INFO,
  PACKAGES,
  PACKAGE_UI,
  PLAN_STEPS,
  PLAN_UI,
  stepLabel,
  STATEMENT_UI,
} from '@/content';

describe('Statement section', () => {
  it('renders the source-supported statement with serif italic and no unsupported subline', () => {
    const html = renderToStaticMarkup(<Statement />);
    expect(html).toContain(
      `<span class="serif-italic">${STATEMENT_UI.emphasis}</span>`,
    );
    expect(html.replace(/<[^>]+>/g, '')).toContain(STATEMENT_UI.heading);
    expect(html).not.toContain('<p');
  });
});

describe('Packages section', () => {
  it('renders 3 packages with taglines, prices, ask buttons, and inclusions', () => {
    const html = renderToStaticMarkup(
      <ChatProvider>
        <Packages />
      </ChatProvider>,
    );

    for (const pkg of PACKAGES) {
      expect(html).toContain(pkg.name);
      expect(html).toContain(pkg.tagline);
      expect(html).toContain(pkg.price);
      expect(html).toContain(PACKAGE_UI.ask);
      expect(html).toContain(`(${pkg.name})`);
    }

    expect(html).toContain(PACKAGE_UI.inclusions);
    for (const inc of INCLUSIONS) {
      expect(html).toContain(inc);
    }
  });
});

describe('The Plan section', () => {
  it('renders 5 steps in the plan with correct headings and captions', () => {
    const html = renderToStaticMarkup(<ThePlan />);
    expect(html).toContain(PLAN_UI.title);
    expect(html).toContain(PLAN_UI.subtitle);
    const document = new DOMParser().parseFromString(html, 'text/html');
    const list = document.querySelector('ol')!;
    expect(list).not.toBeNull();
    expect(list.children).toHaveLength(5);
    for (const [index, item] of [...list.children].entries()) {
      expect(item.tagName).toBe('LI');
      expect(item.textContent).toContain(
        stepLabel(PLAN_STEPS[index]!.stepNumber),
      );
      expect(item.querySelector('h3')?.textContent).toBe(
        PLAN_STEPS[index]!.title,
      );
      expect(item.querySelector('[aria-hidden=true]')?.textContent).toBe(
        String(index + 1).padStart(2, '0'),
      );
      expect(item.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
    }
    expect(list.children[0]!.querySelector('img')).toBeNull();
    expect(list.querySelectorAll('img')).toHaveLength(4);

    for (const step of PLAN_STEPS) {
      expect(html).toContain(step.title);
      expect(html).toContain(step.description);
    }
  });
});

describe('Faq section', () => {
  it('renders native details elements with verbatim FAQs', () => {
    const html = renderToStaticMarkup(<Faq />);
    expect(html).toContain('Good to know');
    for (const item of FAQS) {
      expect(html).toContain(item.question);
      for (const line of item.answer.split('\n')) {
        const expected = line.replace(/'/g, '&#x27;');
        expect(html).toContain(expected);
      }
    }
  });
});

describe('WhereAndWho section', () => {
  it('renders location and operator information without invented facts', () => {
    const html = renderToStaticMarkup(<WhereAndWho />);
    expect(html).toContain(LOCATION_INFO.title);
    expect(html).toContain(LOCATION_INFO.spot);
    expect(html).toContain(LOCATION_INFO.address);
    expect(html).toContain(LOCATION_INFO.operatorTitle);
    expect(html).toContain(LOCATION_INFO.operator);
  });
});

describe('Footer component', () => {
  it('renders dark footer with 4 columns, prototype notice, demo links, and credits', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain(
      'Assignment prototype. No real bookings or payments.',
    );
    expect(html).toContain('https://sea-view-chatbot-prototype.vercel.app');
    expect(html).toContain(
      'https://sea-view-chatbot-prototype-mock.vercel.app',
    );
    expect(html).toContain('Knowledge view');
    expect(html).toContain('Photography and content © Greedy Adventures');
    expect(html).toContain('https://www.greedyadventures.com/contact');
  });
});
