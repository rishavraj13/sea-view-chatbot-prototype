'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { APICallError } from 'ai';
import type { z } from 'zod';
import { parseChatError, type ProductError } from '../chat/api-error';

/** Validates every public response; cancelling/unmounting prevents late state writes. */
export function useKnowledgeRequest<T>(url: string, schema: z.ZodType<T>) {
  const [state, setState] = useState<{
    data: T | null;
    error: ProductError | null;
    pending: boolean;
    attempt: number;
  }>({ data: null, error: null, pending: false, attempt: 0 });
  const active = useRef<AbortController | null>(null);
  const lastBody = useRef<unknown>(undefined);
  const run = useCallback(
    async (body?: unknown) => {
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      lastBody.current = body;
      setState((prior) => ({
        data: null,
        error: null,
        pending: true,
        attempt: prior.attempt + 1,
      }));
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          ...(body !== undefined
            ? {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              }
            : {}),
        });
        if (!response.ok)
          throw new APICallError({
            message: 'Public request failed',
            url,
            requestBodyValues: undefined,
            statusCode: response.status,
            responseBody: await response.text(),
          });
        const raw: unknown = await response.json();
        const data = schema.parse(raw);
        if (!controller.signal.aborted)
          setState((prior) => ({
            ...prior,
            data,
            error: null,
            pending: false,
          }));
      } catch (error: unknown) {
        if (!controller.signal.aborted)
          setState((prior) => ({
            ...prior,
            data: null,
            error: parseChatError(error),
            pending: false,
          }));
      }
    },
    [url, schema],
  );
  useEffect(() => () => active.current?.abort(), []);
  const retry = useCallback(() => {
    void run(lastBody.current);
  }, [run]);
  return { ...state, run, retry };
}
