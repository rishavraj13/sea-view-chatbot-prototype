interface Package {
  readonly id: 'eco' | 'deluxe' | 'vip';
  readonly name: string;
  readonly tagline: string;
  readonly price: string;
  readonly pricePerPerson: string;
  readonly priceAmount: number;
}

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
