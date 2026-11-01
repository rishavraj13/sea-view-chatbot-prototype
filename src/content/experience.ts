export const HERO_UI = {
  firstWord: 'Sea View',
  lastWord: 'Skydiving',
  watch: 'Watch the jump',
  intro: 'Jump overview',
} as const;
export const PLAN_UI = {
  title: 'The plan',
  subtitle: 'Five steps, from check-in to landing',
} as const;
export function stepLabel(step: number): string {
  return `Step ${String(step).padStart(2, '0')}`;
}
