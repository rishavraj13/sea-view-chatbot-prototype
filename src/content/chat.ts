export const CHAT_COPY = {
  title: 'Ask about your jump',
  subtitle: 'Answers come from greedyadventures.com',
  question: 'Ask a question',
  placeholder: 'Ask a question…',
  mock: 'Mock mode: scripted answers, not a live model',
  intro:
    'Ask questions about jump packages, weather cancellations, or request media.',
  suggestions: 'Suggested starter questions',
  sources: 'Referenced sources',
  loading: 'Looking through the website…',
  loadingLabel: 'Loading response',
  slow: 'Taking longer than usual',
  retry: 'Retry',
  limit:
    'This conversation is full. Start a new conversation to keep chatting.',
  reset: 'Started a new conversation.',
  brochure: 'Brochure document',
  video: 'Experience video',
  pdf: 'PDF',
  demo: 'Demo material',
  open: 'Open',
  download: 'Download',
  unavailable: "That file isn't available right now.",
  noVideo: 'Your browser does not support video playback.',
  videoError: 'Video playback could not load.',
  watch: 'Watch on greedyadventures.com',
} as const;
export function retryLabel(seconds: number): string {
  return seconds > 0 ? `Retry in ${seconds}s` : CHAT_COPY.retry;
}
export const SOURCE_PAGES = [
  {
    pageKey: 'seaview',
    origin: 'https://www.greedyadventures.com',
    pathname: '/experiences/sea-view-skydiving',
    label: 'Sea View Skydiving page',
  },
  {
    pageKey: 'cancellations',
    origin: 'https://www.greedyadventures.com',
    pathname: '/cancellations',
    label: 'Cancellations page',
  },
] as const;
export const CHAT_REFUSAL = 'I do not have that information';
export const MISSING_FACT_PROMPT = 'What is the age limit?';
