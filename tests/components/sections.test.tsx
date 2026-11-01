import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChatProvider } from '@/components/ChatContext';
import { Statement } from '@/components/Statement';
import { Packages } from '@/components/Packages';
import { ThePlan } from '@/components/ThePlan';
import { Faq } from '@/components/Faq';
import { WhereAndWho } from '@/components/WhereAndWho';
import { Footer } from '@/components/Footer';
import { FAQS, INCLUSIONS, LOCATION_INFO, PACKAGES, PLAN_STEPS } from '@/content';

describe('Statement section', () => {
  it('renders statement heading with serif italic and subline', () => {
    const html = renderToStaticMarkup(<Statement />);
    expect(html).toContain('The <span class="serif-italic">same</span> jump in every package.');
    expect(html).toContain('Choose no cameras, instructor video and photos, or a personal cameraman.');
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
      expect(html).toContain(`Ask about the ${pkg.name} package`);
    }

    expect(html).toContain('Included in every package:');
    for (const inc of INCLUSIONS) {
      expect(html).toContain(inc);
    }
  });
});

describe('The Plan section', () => {
  it('renders 5 steps in the plan with correct headings and captions', () => {
    const html = renderToStaticMarkup(<ThePlan />);
    expect(html).toContain('The plan');
    expect(html).toContain('Five steps, from check-in to landing');

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
    expect(html).toContain(LOCATION_INFO.spot);
    expect(html).toContain(LOCATION_INFO.address);
    expect(html).toContain(LOCATION_INFO.operator);
  });
});

describe('Footer component', () => {
  it('renders dark footer with 4 columns, prototype notice, demo links, and credits', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain('Assignment prototype. No real bookings or payments.');
    expect(html).toContain('https://sea-view-chatbot-prototype.vercel.app');
    expect(html).toContain('https://sea-view-chatbot-prototype-mock.vercel.app');
    expect(html).toContain('Knowledge view');
    expect(html).toContain('Photography and content © Greedy Adventures');
    expect(html).toContain('https://www.greedyadventures.com/contact');
  });
});
