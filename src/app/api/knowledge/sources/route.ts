import { sources } from '@/server/knowledge';
import { registry } from '@/server/media';
export const runtime = 'nodejs';
export const maxDuration = 10;
/** Exposes bundled demo sources and assets, never configuration or conversations. */
export function GET() {
  return Response.json({ isDemo: true, sources, media: registry });
}
