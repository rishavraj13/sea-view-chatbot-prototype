import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RootLayout from '../src/app/layout';
import Home from '../src/app/page';

describe('App Router scaffold and root layout', () => {
  it('renders the root page within the document layout with skip link and header', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <Home />
      </RootLayout>,
    );

    expect(markup).toContain('<html lang="en"');
    expect(markup).toContain('Skip to content</a>');
    expect(markup).toContain('id="main"');
    expect(markup).toContain('Sea View');
    expect(markup).toContain('Skydiving');
    expect(markup).toContain('From ฿9,500 per person');
  });
});
