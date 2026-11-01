export const SITE_METADATA = {
  title: 'Sea View Skydiving — Pattaya, Thailand | Greedy Adventures',
  description: 'Tandem jump over Pattaya.',
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

export const LOCATION_INFO = {
  title: 'Where you jump',
  spot: 'Pattaya Sea View, Pattaya, Thailand',
  address: '95 M.4, Chakphong, Klaeng District, Rayong 21190, Thailand',
  operatorTitle: 'Operated by',
  operator: 'Dropzone Thailand',
} as const;

export const ACCESSIBILITY_COPY = { skip: 'Skip to content' } as const;
