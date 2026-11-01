import { expect, type Locator, type Page } from '@playwright/test';

export async function checkFocus(page: Page) {
  const focus = page.locator(':focus');
  const style = await focus.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      width: parseFloat(style.outlineWidth),
      style: style.outlineStyle,
      color: style.outlineColor,
    };
  });
  expect(style.width).toBeGreaterThanOrEqual(2);
  expect(style.style).toBe('solid');
  expect(['rgb(20, 19, 17)', 'rgb(180, 65, 27)']).toContain(style.color);
}

export async function walkTabOrder(page: Page) {
  const expected = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        'a[href],button,textarea,input,select,summary,[tabindex]',
      ),
    ]
      .filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(':disabled') &&
          element.checkVisibility() &&
          !element.closest('dialog:not([open])'),
      )
      .map((element, index) => {
        element.dataset.keyboardIndex = String(index);
        return {
          index,
          text:
            element.getAttribute('aria-label') ||
            element.textContent?.trim() ||
            '',
          tag: element.tagName,
          zone:
            element.closest('[id],header,footer')?.id ||
            element.closest('header,footer')?.tagName,
        };
      }),
  );
  expect(expected.length).toBeGreaterThan(5);
  for (const item of expected) {
    await page.keyboard.press('Tab');
    await expect(
      page.locator(`[data-keyboard-index="${item.index}"]`),
    ).toBeFocused();
    await checkFocus(page);
  }
  return expected;
}

export async function checkHeadingOrder(page: Page) {
  const headings = await page.getByRole('heading').evaluateAll((elements) =>
    elements
      .filter((element) => element.checkVisibility())
      .map((element) => ({
        level: Number(element.tagName.slice(1)),
        text: element.textContent?.trim(),
      })),
  );
  expect(headings.filter((heading) => heading.level === 1)).toHaveLength(1);
  let previous = 0;
  for (const heading of headings) {
    expect(heading.level, heading.text).toBeLessThanOrEqual(previous + 1);
    previous = heading.level;
  }
  return headings;
}

export async function tabTo(page: Page, target: Locator) {
  const bound =
    (await page
      .locator('a[href],button,textarea,input,select,summary,[tabindex]')
      .count()) + 3;
  for (let index = 0; index < bound; index++) {
    if (await target.evaluate((element) => document.activeElement === element))
      return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}
