import { expect, type Page } from '@playwright/test';

export async function positionHero(page: Page, fraction: number) {
  const geometry = await page
    .locator('[data-scroll-hero]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const inset = parseFloat(
        getComputedStyle(element).getPropertyValue('--header-h'),
      );
      return {
        top: rect.top + window.scrollY - inset,
        distance: rect.height - (window.innerHeight - inset),
      };
    });
  await page.evaluate(
    ({ top }) => window.scrollTo({ top, behavior: 'instant' }),
    { top: geometry.top + geometry.distance * fraction },
  );
  await expect
    .poll(() =>
      page
        .locator('[data-scroll-hero]')
        .evaluate((element) =>
          parseFloat(getComputedStyle(element).getPropertyValue('--p')),
        ),
    )
    .toBeCloseTo(fraction, 2);
}
export async function heroState(page: Page) {
  return page.locator('[data-scroll-hero]').evaluate((hero) => {
    const stage = hero.querySelector('[data-hero-stage]')!;
    const title = hero.querySelector('h1')!;
    const photo = hero.querySelector('[data-hero-photo]')!;
    const box = (element: Element) => {
      const r = element.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      };
    };
    return {
      p: parseFloat(getComputedStyle(hero).getPropertyValue('--p')),
      stage: box(stage),
      title: box(title),
      tracking: parseFloat(getComputedStyle(title).letterSpacing),
      font: parseFloat(getComputedStyle(title).fontSize),
      color: getComputedStyle(title).color,
      titleScale: new DOMMatrixReadOnly(getComputedStyle(title).transform).a,
      photoScale: new DOMMatrixReadOnly(getComputedStyle(photo).transform).a,
      panels: [...hero.querySelectorAll('[data-hero-panel]')].map(box),
      dots: [...hero.querySelectorAll('[data-hero-dot]')].map(box),
      words: [...title.querySelectorAll('span')].map(box),
      overlay: [...hero.querySelectorAll('[data-hero-overlay]')].map(
        (element) => Number(getComputedStyle(element).opacity),
      ),
      kicker: Number(getComputedStyle(hero.querySelector('p')!).opacity),
    };
  });
}
