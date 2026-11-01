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
