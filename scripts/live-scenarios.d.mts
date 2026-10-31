/** Outcome properties expected from one scripted customer turn. */
export interface ScenarioExpectation {
  tools?: readonly string[];
  fact?: boolean;
  refuse?: boolean;
  unavailable?: boolean;
}
/** Public fields inspected by the live assertion function. */
export interface CheckedRecord {
  status: number;
  providerCalls: number;
  visibleText: string;
  citations: readonly unknown[];
  tools: readonly {
    type: string;
    output: { kind: string; id: string; isDemo: boolean };
  }[];
  rawToolCalls: readonly { function: { name: string } }[];
}
/** The eighteen amended regression scenarios. */
export const scenarios: readonly (ScenarioExpectation & {
  id: string;
  question: string;
})[];
/** Checks behavior without requiring exact generated prose. */
export function checkScenario(
  scenario: ScenarioExpectation,
  record: CheckedRecord,
): { name: string; passed: boolean }[];
