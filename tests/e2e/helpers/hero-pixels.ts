import type { Page } from '@playwright/test';

/** Measure opaque glyph cores against the separately captured underlying pixels. */
export async function sampleHero(
  page: Page,
  foreground: Buffer,
  background: Buffer,
  photo: Buffer,
) {
  const geometry = await page.locator('#hero-heading').evaluate((heading) => ({
    color: getComputedStyle(heading).color,
    words: [...heading.querySelectorAll('span')].map((word) => {
      const r = word.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }),
  }));
  const seams = await page
    .locator('[data-hero-panel]')
    .evaluateAll((panels) =>
      panels.map((panel, index) =>
        index === 0
          ? panel.getBoundingClientRect().right
          : panel.getBoundingClientRect().left,
      ),
    );
  const stage = await page.locator('[data-hero-stage]').boundingBox();
  return page.evaluate(
    async ({ fg, bg, photo, geometry, stage, seams }) => {
      const decode = async (data: string) => {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        return {
          pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
          width: canvas.width,
        };
      };
      const [front, back, image] = await Promise.all([
        decode(fg),
        decode(bg),
        decode(photo),
      ]);
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d')!;
      context.fillStyle = geometry.color;
      context.fillRect(0, 0, 1, 1);
      const color = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      const light = (rgb: readonly number[]) =>
        rgb
          .map((value) => {
            const s = value / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          })
          .reduce(
            (total, value, index) =>
              total + value * [0.2126, 0.7152, 0.0722][index]!,
            0,
          );
      const luminance = light(color);
      let minimum = Infinity;
      let glyphPixels = 0;
      let worst = { x: 0, y: 0, background: [0, 0, 0] };
      for (const word of geometry.words)
        for (
          let y = Math.max(0, Math.ceil(word.y));
          y < Math.min(window.innerHeight, Math.floor(word.bottom));
          y++
        )
          for (
            let x = Math.max(0, Math.ceil(word.x));
            x < Math.min(front.width, Math.floor(word.right));
            x++
          ) {
            if (seams.some((edge) => Math.abs(x + 0.5 - edge) <= 1)) continue;
            const offset = (y * front.width + x) * 4;
            const pixel = [
              front.pixels[offset]!,
              front.pixels[offset + 1]!,
              front.pixels[offset + 2]!,
            ];
            const under = [
              back.pixels[offset]!,
              back.pixels[offset + 1]!,
              back.pixels[offset + 2]!,
            ];
            if (
              pixel.every((value, i) => Math.abs(value - color[i]!) <= 2) &&
              pixel.some((value, i) => Math.abs(value - under[i]!) > 8)
            ) {
              const below = light(under);
              const ratio =
                (Math.max(luminance, below) + 0.05) /
                (Math.min(luminance, below) + 0.05);
              if (ratio < minimum) {
                minimum = ratio;
                worst = { x, y, background: under };
              }
              glyphPixels++;
            }
          }
      const sum = [0, 0, 0];
      let count = 0;
      for (
        let y = Math.ceil(stage!.y) + 20;
        y < Math.floor(stage!.y + stage!.height) - 20;
        y++
      )
        for (let x = 20; x < image.width - 20; x++) {
          const offset = (y * image.width + x) * 4;
          for (let i = 0; i < 3; i++) sum[i]! += image.pixels[offset + i]!;
          count++;
        }
      return {
        worst,
        minimumContrast: minimum,
        glyphPixels,
        textColor: color,
        photoMean: sum.map((value) => value / count),
      };
    },
    {
      fg: foreground.toString('base64'),
      bg: background.toString('base64'),
      photo: photo.toString('base64'),
      geometry,
      stage,
      seams,
    },
  );
}
