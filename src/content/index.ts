export { HEADER_UI } from './navigation';
export {
  ERROR_MESSAGES,
  PACKAGE_UI,
  packageAskLabel,
  packageQuestion,
  STATEMENT_UI,
  TRACE_UI,
} from './foundation';

export interface Package {
  readonly id: 'eco' | 'deluxe' | 'vip';
  readonly name: string;
  readonly tagline: string;
  readonly price: string;
  readonly pricePerPerson: string;
  readonly priceAmount: number;
}

export interface PlanStep {
  readonly stepNumber: number;
  readonly title: string;
  readonly description: string;
  readonly image?: {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export const SITE_METADATA = {
  title: 'Sea View Skydiving — Pattaya, Thailand | Greedy Adventures',
  description:
    'Tandem skydiving over Pattaya with stunning sea views. 13,000 ft exit altitude, ~60 s freefall, operated by Dropzone Thailand.',
  kicker: 'Sea View · Pattaya, Thailand',
  heroHeading: 'Sea View Skydiving',
  echoWord: 'Skydiving',
  subline: 'Tandem jump over Pattaya',
  fromPrice: 'From ฿9,500 per person',
  videoUrl:
    'https://www.greedyadventures.com/greedy/films/sea-view-studio-hero.mp4',
  videoPosterUrl:
    'https://www.greedyadventures.com/greedy/films/sea-view-studio-hero-poster.jpg',
  liveDemoUrl: 'https://sea-view-chatbot-prototype.vercel.app',
  mockDemoUrl: 'https://sea-view-chatbot-prototype-mock.vercel.app',
  greedyAdventuresUrl:
    'https://www.greedyadventures.com/experiences/sea-view-skydiving',
  contactUrl: 'https://www.greedyadventures.com/contact',
  cancellationsUrl: 'https://www.greedyadventures.com/cancellations',
} as const;

export const HERO_FACTS = [
  { label: 'exit altitude', value: '13,000 ft' },
  { label: 'of freefall', value: '~60 s' },
  { label: 'under canopy', value: '5–7 min' },
] as const;

export const HERO_IMAGE = {
  src: '/images/home-hero-skydivers.webp',
  alt: 'Tandem skydivers freefalling in open skies above the coastline',
  width: 1536,
  height: 1024,
} as const;

export const PACKAGES: readonly Package[] = [
  {
    id: 'eco',
    name: 'ECO',
    tagline: 'The jump, nothing else',
    price: '฿9,500',
    pricePerPerson: '฿9,500 per person',
    priceAmount: 9500,
  },
  {
    id: 'deluxe',
    name: 'DELUXE',
    tagline: 'Video and photos included',
    price: '฿12,500',
    pricePerPerson: '฿12,500 per person',
    priceAmount: 12500,
  },
  {
    id: 'vip',
    name: 'VIP',
    tagline: 'Personal cameraman and edited film',
    price: '฿14,000',
    pricePerPerson: '฿14,000 per person',
    priceAmount: 14000,
  },
] as const;

export const INCLUSIONS: readonly string[] = [
  'Tandem skydive experience in Pattaya, Thailand',
  'Safety briefing and tandem instructor support',
  'Aircraft ascent and ocean-view jump experience',
  'Certificate of completion',
] as const;

export const PLAN_STEPS: readonly PlanStep[] = [
  {
    stepNumber: 1,
    title: 'Arrival and check-in',
    description: 'Sign in at the dropzone and bring your photo ID.',
  },
  {
    stepNumber: 2,
    title: 'Safety briefing and gear fitting',
    description:
      'Meet your instructor for the safety briefing and harness fitting.',
    image: {
      src: '/images/step-2.jpg',
      alt: 'Skydiver having safety harness fitted during pre-jump briefing',
      width: 1365,
      height: 2048,
    },
  },
  {
    stepNumber: 3,
    title: 'Boarding and the climb',
    description: 'Board the aircraft and climb to jump altitude.',
    image: {
      src: '/images/step-3.webp',
      alt: 'Jump aircraft propeller and fuselage on the runway',
      width: 1600,
      height: 1066,
    },
  },
  {
    stepNumber: 4,
    title: 'Exit and freefall',
    description:
      'Exit with your instructor for freefall over the Gulf of Thailand.',
    image: {
      src: '/images/step-4.webp',
      alt: 'Tandem skydivers in freefall with the sea and coastline below',
      width: 1600,
      height: 1600,
    },
  },
  {
    stepNumber: 5,
    title: 'Canopy flight and landing',
    description:
      'Fly under the parachute with your instructor and land back at the dropzone.',
    image: {
      src: '/images/step-5.jpg',
      alt: 'Tandem skydiver and instructor landing safely under open canopy',
      width: 1085,
      height: 1018,
    },
  },
] as const;

export const FAQS: readonly FaqItem[] = [
  {
    id: 'package-choice',
    question: 'Which package should I choose?',
    answer:
      'Choose ECO for the standard jump, Deluxe if you want handy cam video, and VIP if you want full media coverage.',
  },
  {
    id: 'location',
    question: 'Where does the activity take place?',
    answer: 'The tandem skydive is listed for Pattaya, Thailand.',
  },
  {
    id: 'pickup',
    question: 'Is Bangkok pickup available?',
    answer: 'Yes. Bangkok pickup is available as a fixed-price add-on.',
  },
  {
    id: 'weather',
    question: 'If the weather stops the activity',
    answer:
      'Skydiving, paragliding and snowboarding all run only in safe conditions, and the person on the ground decides what is safe. Diving is called on sea state and visibility.\nIf your load, flight or dive is held for weather you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund of anything you have paid.\nThere is no charge and no admin fee for a weather move. It is the most common reason an activity does not run and it is nobody\'s fault.',
  },
] as const;

export const LOCATION_INFO = {
  title: 'Where you jump',
  spot: 'Pattaya Sea View, Pattaya, Thailand',
  address: '95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand',
  operatorTitle: 'Operated by',
  operator: 'Dropzone Thailand',
} as const;

export const STARTER_PROMPTS = [
  'What is included in the package?',
  'Can you send me a brochure?',
  'Can I see a video of the experience?',
  'Send me the brochure and a video.',
  'What if it rains?',
] as const;

export const CHAT_UI = {
  launcher: 'Ask about your jump',
  sendButton: 'Send',
  newConversation: 'New conversation',
  closeButton: 'Close chat',
} as const;

export const KNOWLEDGE_UI = {
  title: 'Knowledge Base',
  subtitle:
    'Read-only transparency view: explore grounded website source sections, registered media assets, and test questions through the real pipeline trace.',
  backLink: '← Back to experience',
  tabSources: 'Sources',
  tabMedia: 'Media',
  tabTrace: 'Test a question',
  runTraceButton: 'Run trace',
  runningTraceButton: 'Running pipeline trace…',
} as const;

export const NAV_BREAKPOINT = 768;


