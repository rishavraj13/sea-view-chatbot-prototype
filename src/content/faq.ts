interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

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
      "Skydiving, paragliding and snowboarding all run only in safe conditions, and the person on the ground decides what is safe. Diving is called on sea state and visibility.\nIf your load, flight or dive is held for weather you can wait for the next window the same day at no cost, move to any other date at no cost, or take a full refund of anything you have paid.\nThere is no charge and no admin fee for a weather move. It is the most common reason an activity does not run and it is nobody's fault.",
  },
] as const;

export const FAQ_UI = {
  title: 'Good to know',
  subtitle: 'Essential information before your jump',
} as const;
