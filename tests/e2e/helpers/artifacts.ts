import { test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type CaptureOptions = NonNullable<Parameters<Page['screenshot']>[0]>;

/** Keep generated captures separate from curated, potentially viewer-open evidence. */
export function captureViewport(page: Page, options: CaptureOptions = {}) {
  const path = options.path ? test.info().outputPath(options.path) : undefined;
  return page.screenshot({ ...options, ...(path ? { path } : {}) });
}

/** Each test owns its fresh artifact directory; committed fixtures are never overwritten. */
export async function writeArtifact(path: string, text: string) {
  const output = test.info().outputPath(path);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, text);
}
