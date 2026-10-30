import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RootLayout from '../src/app/layout';
import Home from '../src/app/page';

describe('App Router scaffold', () => {
  it('renders the root page within the document layout', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <Home />
      </RootLayout>,
    );

    expect(markup).toContain('<html lang="en">');
    expect(markup).toContain('<body><main>Project scaffold</main></body>');
  });
});
