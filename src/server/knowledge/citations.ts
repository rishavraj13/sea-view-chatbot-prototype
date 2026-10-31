import { z } from 'zod';
/** AI SDK source-url part, also used for public trace citations and returned history. */
export const citationSchema = z.object({
  type: z.literal('source-url'),
  sourceId: z.string().min(1).max(2048),
  url: z.url().max(2048),
  title: z.string().max(512).optional(),
});
/** A validated public citation; contains no provider metadata or credentials. */
export type Citation = z.infer<typeof citationSchema>;
