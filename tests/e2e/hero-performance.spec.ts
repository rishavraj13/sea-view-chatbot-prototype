import { writeArtifact } from './helpers/artifacts';
import { test } from '@playwright/test';
import { positionHero } from './helpers/hero';

test('record layout shifts and long tasks during a reversible scroll', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const evidence = { cls: 0, longTasks: [] as number[] };
    Object.assign(window, { scrollEvidence: evidence });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          'value' in entry &&
          'hadRecentInput' in entry &&
          !entry.hadRecentInput &&
          typeof entry.value === 'number'
        )
          evidence.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      evidence.longTasks.push(
        ...list.getEntries().map((entry) => entry.duration),
      );
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const fraction of [0, 0.5, 1, 0.5, 0])
    await positionHero(page, fraction);
  const evidence = await page.evaluate(
    () =>
      Reflect.get(window, 'scrollEvidence') as {
        cls: number;
        longTasks: number[];
      },
  );
  await writeArtifact(
    `docs/examples/scroll-hero/performance-${page.viewportSize()!.width}.json`,
    JSON.stringify(evidence, null, 2) + '\n',
  );
});
