import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  FAQS,
  HERO_FACTS,
  INCLUSIONS,
  LOCATION_INFO,
  PACKAGES,
  PLAN_STEPS,
  SITE_METADATA,
} from '@/content';

interface ManifestItem {
  id: string;
  type: string;
  title: string;
  url: string;
  isDemo: boolean;
  available: boolean;
  posterUrl?: string;
}

interface KnowledgeJson {
  title: string;
  url: string;
  capturedAt: string;
  text: string;
  isDemo: boolean;
}

function loadKnowledge(name: string): KnowledgeJson {
  const file = join(process.cwd(), 'data', 'knowledge', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

function loadManifest(): ManifestItem[] {
  const file = join(process.cwd(), 'data', 'media', 'manifest.json');
  return JSON.parse(readFileSync(file, 'utf8'));
}

describe('Content and Knowledge parity', () => {
  it('matches package names, taglines, prices and inclusions with data/knowledge', () => {
    const ecoData = loadKnowledge('eco');
    const deluxeData = loadKnowledge('deluxe');
    const vipData = loadKnowledge('vip');
    const includedData = loadKnowledge('included');

    const eco = PACKAGES.find((p) => p.id === 'eco')!;
    const deluxe = PACKAGES.find((p) => p.id === 'deluxe')!;
    const vip = PACKAGES.find((p) => p.id === 'vip')!;

    expect(ecoData.text).toContain(eco.name);
    expect(ecoData.text).toContain(eco.tagline);
    expect(ecoData.text).toContain(eco.price);

    expect(deluxeData.text).toContain(deluxe.name);
    expect(deluxeData.text).toContain(deluxe.tagline);
    expect(deluxeData.text).toContain(deluxe.price);

    expect(vipData.text).toContain(vip.name);
    expect(vipData.text).toContain(vip.tagline);
    expect(vipData.text).toContain(vip.price);

    for (const inc of INCLUSIONS) {
      expect(includedData.text).toContain(inc);
      expect(ecoData.text).toContain(inc);
      expect(deluxeData.text).toContain(inc);
      expect(vipData.text).toContain(inc);
    }
  });

  it('matches video URL and poster URL with data/media/manifest.json', () => {
    const manifest = loadManifest();
    const videoItem = manifest.find((m) => m.id === 'video')!;
    expect(SITE_METADATA.videoUrl).toBe(videoItem.url);
    expect(SITE_METADATA.videoPosterUrl).toBe(videoItem.posterUrl);
  });

  it('matches FAQs verbatim with data/knowledge', () => {
    const faqPackage = loadKnowledge('faq-package');
    const faqLocation = loadKnowledge('faq-location');
    const faqPickup = loadKnowledge('faq-pickup');
    const weather = loadKnowledge('weather');

    expect(faqPackage.text).toContain(FAQS[0]!.question);
    expect(faqPackage.text).toContain(FAQS[0]!.answer);

    expect(faqLocation.text).toContain(FAQS[1]!.question);
    expect(faqLocation.text).toContain(FAQS[1]!.answer);

    expect(faqPickup.text).toContain(FAQS[2]!.question);
    expect(faqPickup.text).toContain(FAQS[2]!.answer);

    expect(weather.title).toBe(FAQS[3]!.question);
    expect(weather.text).toBe(FAQS[3]!.answer);
  });

  it('matches the 5 steps with data/knowledge/plan.json', () => {
    const plan = loadKnowledge('plan');
    for (const step of PLAN_STEPS) {
      expect(plan.text).toContain(`Step ${step.stepNumber}`);
      expect(plan.text).toContain(step.title);
      expect(plan.text).toContain(step.description);
    }
  });

  it('matches location and operator with data/knowledge/location.json', () => {
    const locationData = loadKnowledge('location');
    expect(locationData.text).toContain(LOCATION_INFO.title);
    expect(locationData.text).toContain(LOCATION_INFO.spot);
    expect(locationData.text).toContain(LOCATION_INFO.address);
    expect(locationData.text).toContain(LOCATION_INFO.operatorTitle);
    expect(locationData.text).toContain(LOCATION_INFO.operator);
  });

  it('matches hero facts with data/knowledge/jump-facts.json', () => {
    const jumpFacts = loadKnowledge('jump-facts');
    const lowerText = jumpFacts.text.toLowerCase();
    expect(jumpFacts.text).toContain(HERO_FACTS[0].value);
    expect(lowerText).toContain(HERO_FACTS[0].label.toLowerCase());
    expect(lowerText).toContain('60 seconds of freefall');
    expect(lowerText).toContain(HERO_FACTS[1].label.toLowerCase());
    expect(lowerText).toContain('five to seven minutes under canopy');
    expect(lowerText).toContain(HERO_FACTS[2].label.toLowerCase());
  });
});

