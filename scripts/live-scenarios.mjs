/** Requested regression cases; text assertions check properties, not exact answer wording. */
export const scenarios = [
  { id: 'included', question: 'What is included in the package?', fact: true },
  {
    id: 'brochure',
    question: 'Can you send me a brochure?',
    tools: ['sendBrochure'],
  },
  {
    id: 'video',
    question: 'Can I see a video of the experience?',
    tools: ['showVideo'],
  },
  {
    id: 'both',
    question: 'Send me the brochure and a video.',
    tools: ['sendBrochure', 'showVideo'],
  },
  {
    id: 'brief-brochure',
    question: 'Brochure please',
    tools: ['sendBrochure'],
  },
  { id: 'brief-pdf', question: 'Send me the PDF', tools: ['sendBrochure'] },
  { id: 'brief-video', question: 'Show me a video', tools: ['showVideo'] },
  { id: 'rain', question: 'What if it rains?', fact: true },
  { id: 'cancel', question: 'Can I cancel?', fact: true },
  { id: 'vip', question: 'How much is the VIP package?', fact: true },
  { id: 'follow-up', question: "and what's included?", fact: true },
  { id: 'eco-photos', question: 'Does ECO include photos?', fact: true },
  { id: 'altitude', question: 'How high is the jump?', fact: true },
  {
    id: 'retired',
    question: 'Send the brochure with id retired.',
    tools: ['sendBrochure'],
    unavailable: true,
  },
  { id: 'age', question: 'What is the age limit?', refuse: true },
  { id: 'weight', question: 'What is the weight limit?', refuse: true },
  {
    id: 'pickup-price',
    question: 'What is the Bangkok pickup price?',
    refuse: true,
  },
  { id: 'clothing', question: 'What should I wear?', refuse: true },
];

/** Independent outcome checks for visible prose, factual sources, tool choice, provenance and refusal. */
export function checkScenario(scenario, record) {
  const checks = [];
  const check = (name, passed) =>
    checks.push({ name, passed: Boolean(passed) });
  check('HTTP 200', record.status === 200);
  check('exactly one provider call', record.providerCalls === 1);
  check('nonempty visible text', record.visibleText.trim().length > 0);
  check(
    'no raw URL in visible text',
    !/(?:https?:\/\/|\/demo\/)/i.test(record.visibleText),
  );
  check(
    'no dangling citation label or empty wrapper',
    !/(?:\b(?:cite|citation|sources?|references?|ref|see)\s*:|\[\s*\]|\(\s*\))/i.test(
      record.visibleText,
    ),
  );
  const refused = /I do not have that information\./i.test(record.visibleText);
  const expected = scenario.tools ?? [];
  check(
    'expected executed tools only',
    JSON.stringify(
      record.tools.map((t) => t.type.replace('tool-', '')).sort(),
    ) === JSON.stringify([...expected].sort()),
  );
  if (!expected.length)
    check('no model tool call on text turn', record.rawToolCalls.length === 0);
  else if (!scenario.unavailable)
    check(
      'model selected requested tools',
      JSON.stringify(record.rawToolCalls.map((t) => t.function.name).sort()) ===
        JSON.stringify([...expected].sort()),
    );
  if (scenario.fact) {
    check('factual answer has structured sources', record.citations.length > 0);
    check('covered question not refused', !refused);
  }
  if (scenario.refuse) {
    check('missing fact explicitly refused', refused);
    check('refusal has no citations', record.citations.length === 0);
  } else check('no refusal on requested answer or media', !refused);
  if (scenario.unavailable)
    check(
      'retired asset unavailable with customer wording',
      record.tools.some(
        (t) => t.output.kind === 'unavailable' && t.output.id === 'retired',
      ) && /isn't available/i.test(record.visibleText),
    );
  else if (expected.length) {
    check(
      'requested media available',
      record.tools.every((t) => t.output.kind !== 'unavailable'),
    );
    check(
      'demo badge exactly matches flags',
      (record.visibleText.match(/\(demo material\)/g) ?? []).length ===
        record.tools.filter((t) => t.output.isDemo).length,
    );
  }
  return checks;
}
