import type { MediaResult } from '../src/server/media/index';
/** Public response properties consumed by production smoke assertions. */
export interface ProductionRecord {
  status: number;
  transportRequests: number;
  message?: { metadata?: unknown };
  visibleText: string;
  citations: readonly unknown[];
  tools: readonly { type: string; state: string; output: MediaResult }[];
}
/** Expected files, factual grounding or refusal for a production scenario. */
export interface ProductionExpectation {
  tools?: readonly string[];
  fact?: boolean;
  refuse?: boolean;
}
/** Validates only publicly observable stream and response properties. */
export function checkProductionScenario(
  scenario: ProductionExpectation,
  record: ProductionRecord,
): { name: string; passed: boolean }[];
/** Runs a single budgeted campaign, refusing any existing campaign ledger. */
export function runProductionSmoke(args: readonly string[]): Promise<void>;
