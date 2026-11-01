import { test, expect } from '@playwright/test';
import { positionHero } from './helpers/hero';

test('visible UI has no saturated blue/teal hues, including borders and shadows', async ({
  page,
}) => {
  await page.goto('/');
  for (const fraction of [0, 0.5, 1]) {
    await positionHero(page, fraction);
    const blue = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      const forbidden = (color: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [red, green, blue, alpha] = ctx.getImageData(0, 0, 1, 1).data;
        if (!alpha) return false;
        const r = red! / 255,
          g = green! / 255,
          b = blue! / 255,
          max = Math.max(r, g, b),
          min = Math.min(r, g, b),
          d = max - min;
        if (!d) return false;
        const l = (max + min) / 2,
          s = d / (1 - Math.abs(2 * l - 1));
        let h =
          (max === r
            ? (g - b) / d
            : max === g
              ? (b - r) / d + 2
              : (r - g) / d + 4) * 60;
        if (h < 0) h += 360;
        return h >= 180 && h <= 260 && s > 0.1;
      };
      return [...document.querySelectorAll('*')].flatMap((element) => {
        const rect = element.getBoundingClientRect(),
          style = getComputedStyle(element);
        if (
          element.matches('img,video,canvas') ||
          !rect.width ||
          !rect.height ||
          rect.bottom <= 0 ||
          rect.top >= innerHeight ||
          rect.right <= 0 ||
          rect.left >= innerWidth ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0
        )
          return [];
        const colors = [
          style.color,
          style.backgroundColor,
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor,
          ...style.boxShadow.matchAll(/rgba?\([^)]+\)/g),
        ].flatMap((value) =>
          typeof value === 'string' ? [value] : [value[0]],
        );
        return colors
          .filter(forbidden)
          .map((color) => ({ tag: element.tagName, color }));
      });
    });
    expect(blue).toEqual([]);
  }
});
