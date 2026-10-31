const smallNumbers: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};
const currencies: Record<string, string> = {
  '฿': 'THB',
  baht: 'THB',
  thb: 'THB',
  บาท: 'THB',
  $: 'USD',
  usd: 'USD',
  dollar: 'USD',
  dollars: 'USD',
  '€': 'EUR',
  eur: 'EUR',
  euro: 'EUR',
  euros: 'EUR',
  '£': 'GBP',
  gbp: 'GBP',
  pound: 'GBP',
  pounds: 'GBP',
  '₹': 'INR',
  inr: 'INR',
  rupee: 'INR',
  rupees: 'INR',
  '¥': 'JPY',
  jpy: 'JPY',
  yen: 'JPY',
};
const amount = '-?\\d+(?:\\.\\d+)?';
const units =
  'working\\s+days?|milliseconds?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|feet|foot|ft|kilometres?|kilometers?|centimetres?|centimeters?|metres?|meters?|yards?|miles?|inches|inch|percent|ms|s|min|h|km|cm|yd|mi|in|m|%';
/** Literal normalized properties; these sets do not encode semantic relationships or entailment. */
export interface AnswerProperties {
  numbers: Set<string>;
  currencies: Set<string>;
  amounts: Set<string>;
  quantities: Set<string>;
  ranges: Set<string>;
  supported: boolean;
}
function number(value: string): string {
  const [integer = '', fraction = ''] = value.replace(/^\+/, '').split('.');
  const whole = integer.replace(/^(-?)0+(?=\d)/, '$1');
  const decimals = fraction.replace(/0+$/, '');
  const normalized = whole + (decimals ? '.' + decimals : '');
  return normalized === '-0' ? '0' : normalized;
}
function unit(value: string): string {
  const text = value.toLowerCase();
  if (text.startsWith('working')) return 'working-day';
  if (text.startsWith('millisecond') || text === 'ms') return 'ms';
  if (text.startsWith('week')) return 'week';
  if (text.startsWith('month')) return 'month';
  if (text.startsWith('year')) return 'year';
  if (text.startsWith('kilomet') || text === 'km') return 'km';
  if (text.startsWith('centimet') || text === 'cm') return 'cm';
  if (text.startsWith('yard') || text === 'yd') return 'yd';
  if (text.startsWith('mile') || text === 'mi') return 'mi';
  if (text.startsWith('inch') || text === 'in') return 'in';
  if (/^(second|sec|s)$|^seconds$|^secs$/.test(text)) return 's';
  if (text.startsWith('min')) return 'min';
  if (text.startsWith('h')) return 'h';
  if (text.startsWith('day')) return 'day';
  if (['ft', 'feet', 'foot'].includes(text)) return 'ft';
  if (text.startsWith('m')) return 'm';
  return '%';
}
/** Extracts bounded numbers/currencies/unit pairs, accepting comma grouping and common number words. */
export function answerProperties(input: string): AnswerProperties {
  let text = input.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"\]]+/gi, '');
  text = text
    .toLowerCase()
    .replace(
      /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -]+(one|two|three|four|five|six|seven|eight|nine)\b/g,
      (_, t: string, o: string) => String(smallNumbers[t]! + smallNumbers[o]!),
    );
  text = text.replace(
    new RegExp('\\b(' + Object.keys(smallNumbers).join('|') + ')\\b', 'g'),
    (word) => String(smallNumbers[word]),
  );
  const supported =
    !/\b(hundred|thousand|million|billion|dozen|half|quarter|twice)\b/.test(
      text,
    );
  text = text
    .replace(/(\d)[,\u00a0\u202f ](?=\d{3}(?:\D|$))/g, '$1')
    .replace(/(\d)\s*[-–—]\s*(?=\d)/g, '$1 to ');
  text = text.replace(/(\d)([a-z])/g, '$1 $2').replace(/([a-z])(\d)/g, '$1 $2');
  const currencySet = new Set<string>();
  text = text.replace(
    /\p{Sc}|บาท|\b(?:baht|thb|usd|dollars?|eur|euros?|gbp|pounds?|inr|rupees?|jpy|yen)\b/gu,
    (value) => {
      const currency = currencies[value] ?? value;
      currencySet.add(currency);
      return ' ' + (currencies[value] ?? 'CUR') + ' ';
    },
  );
  const properties: AnswerProperties = {
    numbers: new Set(
      [...text.matchAll(new RegExp(amount, 'g'))].map((m) => number(m[0])),
    ),
    currencies: currencySet,
    amounts: new Set(),
    quantities: new Set(),
    ranges: new Set(),
    supported,
  };
  for (const m of text.matchAll(
    new RegExp(`(${amount})\\s*(${units})(?![a-z]|\\.\\d)`, 'g'),
  ))
    properties.quantities.add(`${number(m[1]!)}:${unit(m[2]!)}`);
  for (const m of text.matchAll(
    new RegExp(
      `(${amount})\\s*(?:to|and)\\s*(${amount})\\s*(${units})(?![a-z]|\\.\\d)`,
      'g',
    ),
  )) {
    const u = unit(m[3]!);
    properties.ranges.add(`${number(m[1]!)}:${number(m[2]!)}:${u}`);
    properties.quantities.add(`${number(m[1]!)}:${u}`);
    properties.quantities.add(`${number(m[2]!)}:${u}`);
  }
  for (const m of text.matchAll(
    new RegExp(
      `(THB|USD|EUR|GBP|INR|JPY|CUR)\\s*(${amount})|(${amount})\\s*(THB|USD|EUR|GBP|INR|JPY|CUR)`,
      'g',
    ),
  ))
    properties.amounts.add(`${m[1] ?? m[4]}:${number(m[2] ?? m[3]!)}`);
  return properties;
}
