import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { HERO_IMAGE, KNOWLEDGE_UI } from '../../src/content';

for (const path of ['/', '/knowledge']) {
  test(`cold-load transfer and image selection: ${path}`, async ({
    page,
    context,
  }, info) => {
    const session = await context.newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.setCacheDisabled', { cacheDisabled: true });
    const requests = new Map<
      string,
      { path: string; mime: string; bytes: number }
    >();
    session.on('Network.responseReceived', ({ requestId, response }) => {
      requests.set(requestId, {
        path: new URL(response.url).pathname + new URL(response.url).search,
        mime: response.mimeType,
        bytes: 0,
      });
    });
    session.on(
      'Network.loadingFinished',
      ({ requestId, encodedDataLength }) => {
        const record = requests.get(requestId);
        if (record) record.bytes = encodedDataLength;
      },
    );
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    if (path === '/')
      await page
        .getByRole('img', { name: HERO_IMAGE.alt, exact: true })
        .evaluate(async (element) => {
          if (element instanceof HTMLImageElement) await element.decode();
        });
    else
      await expect(
        page.getByRole('tab', { name: KNOWLEDGE_UI.tabSources, exact: true }),
      ).toContainText('18');
    const initial = [...requests.values()];
    const timings = await page.evaluate(() => ({
      navigation: performance
        .getEntriesByType('navigation')
        .map((entry) => entry.toJSON()),
      paint: performance
        .getEntriesByType('paint')
        .map((entry) => entry.toJSON()),
    }));
    const images = [];
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async (element) => {
        if (element instanceof HTMLImageElement) await element.decode();
      });
      images.push(
        await image.evaluate((element) => {
          const img = element as HTMLImageElement;
          return {
            alt: img.alt,
            sizes: img.sizes,
            width: img.getBoundingClientRect().width,
            dpr: devicePixelRatio,
            selected: img.currentSrc,
            naturalWidth: img.naturalWidth,
          };
        }),
      );
    }
    for (const image of images.slice(1)) {
      const candidate = Number(new URL(image.selected).searchParams.get('w'));
      const required = image.width * image.dpr;
      expect(candidate).toBeGreaterThanOrEqual(Math.floor(required));
      expect(candidate).toBeLessThanOrEqual(Math.ceil(required * 1.1));
    }
    await writeFile(
      `docs/examples/release-readiness/load-${path === '/' ? 'home' : 'knowledge'}-${info.project.name.split(' ')[0]}.json`,
      JSON.stringify(
        {
          mode: 'mock',
          viewport: page.viewportSize(),
          initialBytes: initial.reduce((sum, item) => sum + item.bytes, 0),
          initial,
          timings,
          images,
        },
        null,
        2,
      ) + '\n',
    );
    await session.detach();
  });
}
